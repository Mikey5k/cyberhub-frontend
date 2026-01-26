import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

interface Payment {
  id: string;
  taskId?: string;
  amount?: number;
  customerPhone?: string;
  workerPhone?: string;
  method?: string;
  status?: string;
  createdAt?: any;
  completedAt?: any;
}

interface Withdrawal {
  id: string;
  userPhone?: string;
  userRole?: string;
  amount?: number;
  status?: string;
  requestedAt?: any;
  processedAt?: any;
}

interface Task {
  id: string;
  title?: string;
  price?: number;
  assignedWorkerPhone?: string;
  status?: string;
}

// Firestore REST API helper
const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;

async function firestoreRequest(endpoint: string, method: string = 'GET', body?: any) {
  const url = `${FIRESTORE_URL}${endpoint}`;
  const apiKey = process.env.FIREBASE_API_KEY;
  
  if (!apiKey) {
    throw new Error("Firebase API key not configured");
  }

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const finalUrl = `${url}?key=${apiKey}`;
  const response = await fetch(finalUrl, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore API error (${response.status}):`, errorText);
    throw new Error(`Firestore request failed: ${response.status} ${errorText}`);
  }
  
  return await response.json();
}

// Helper to convert Firestore document
function convertFirestoreDoc(doc: any): any {
  const fields = doc.fields || {};
  const result: any = { id: doc.name.split('/').pop() };
  
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (field.stringValue !== undefined) result[key] = field.stringValue;
    else if (field.integerValue !== undefined) result[key] = Number(field.integerValue);
    else if (field.doubleValue !== undefined) result[key] = Number(field.doubleValue);
    else if (field.booleanValue !== undefined) result[key] = field.booleanValue;
    else if (field.timestampValue !== undefined) result[key] = field.timestampValue;
    else if (field.nullValue !== undefined) result[key] = null;
    else if (field.mapValue?.fields) {
      const nested: any = {};
      Object.keys(field.mapValue.fields).forEach(nestedKey => {
        const nestedField = field.mapValue.fields[nestedKey];
        if (nestedField.stringValue !== undefined) nested[nestedKey] = nestedField.stringValue;
        else if (nestedField.integerValue !== undefined) nested[nestedKey] = Number(nestedField.integerValue);
        else if (nestedField.doubleValue !== undefined) nested[nestedKey] = Number(nestedField.doubleValue);
      });
      result[key] = nested;
    }
  });
  
  return result;
}

async function getCollectionData(collection: string, filters?: { field: string, value: any }[]) {
  try {
    const response = await firestoreRequest(`/${collection}`);
    if (!response.documents) return [];
    
    let documents = response.documents.map(convertFirestoreDoc);
    
    if (filters) {
      filters.forEach(filter => {
        documents = documents.filter((doc: any) => doc[filter.field] === filter.value);
      });
    }
    
    return documents;
  } catch (error) {
    console.error(`Error fetching ${collection}:`, error);
    return [];
  }
}

async function getDocument(collection: string, docId: string) {
  try {
    const response = await firestoreRequest(`/${collection}/${docId}`);
    return convertFirestoreDoc(response);
  } catch (error) {
    console.error(`Error fetching document ${docId} from ${collection}:`, error);
    return null;
  }
}

async function updateDocument(collection: string, docId: string, data: any) {
  const updateData = {
    fields: {} as any
  };

  Object.keys(data).forEach(key => {
    const value = data[key];
    if (typeof value === 'string') updateData.fields[key] = { stringValue: value };
    else if (typeof value === 'number') {
      if (Number.isInteger(value)) updateData.fields[key] = { integerValue: value.toString() };
      else updateData.fields[key] = { doubleValue: value };
    }
    else if (typeof value === 'boolean') updateData.fields[key] = { booleanValue: value };
    else if (value === null) updateData.fields[key] = { nullValue: null };
    else if (value instanceof Date) updateData.fields[key] = { timestampValue: value.toISOString() };
    else if (typeof value === 'object') {
      const mapFields: any = {};
      Object.keys(value).forEach(subKey => {
        const subValue = value[subKey];
        if (typeof subValue === 'string') mapFields[subKey] = { stringValue: subValue };
        else if (typeof subValue === 'number') mapFields[subKey] = { integerValue: subValue.toString() };
      });
      updateData.fields[key] = { mapValue: { fields: mapFields } };
    }
  });

  return firestoreRequest(`/${collection}/${docId}`, 'PATCH', updateData);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userPhone = searchParams.get('userPhone');
    const userRole = searchParams.get('userRole');
    const status = searchParams.get('status');

    // SUB-MODE 1A: Get payment history
    if (!type || type === 'payments') {
      if (!userPhone || !userRole) {
        return NextResponse.json({ 
          error: 'User phone and role are required' 
        }, { status: 400 });
      }

      let payments = await getCollectionData('payments');
      
      // Filter by user role
      if (userRole === 'user') {
        payments = payments.filter((p: any) => p.customerPhone === userPhone);
      } else if (userRole === 'worker') {
        payments = payments.filter((p: any) => p.workerPhone === userPhone);
      } else if (userRole === 'manager') {
        // Get agents under this manager
        const workers = await getCollectionData('workers');
        const agentPhones = workers
          .filter((w: any) => w.managerPhone === userPhone)
          .map((w: any) => w.id);
        
        payments = payments.filter((p: any) => 
          p.workerPhone && agentPhones.includes(p.workerPhone)
        );
      }
      // Admin sees all payments - no filter needed

      // Filter by status if provided
      if (status) {
        payments = payments.filter((p: any) => p.status === status);
      }

      // Sort by createdAt descending
      payments.sort((a: any, b: any) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      
      return NextResponse.json({
        success: true,
        type: 'payments',
        count: payments.length,
        payments
      });
    }

    // SUB-MODE 1B: Get withdrawal requests
    if (type === 'withdrawals') {
      if (!userPhone || !userRole) {
        return NextResponse.json({ 
          error: 'User phone and role are required' 
        }, { status: 400 });
      }

      let withdrawals = await getCollectionData('withdrawals');
      withdrawals = withdrawals.filter((w: any) => w.userPhone === userPhone);
      
      if (status) {
        withdrawals = withdrawals.filter((w: any) => w.status === status);
      }

      // Sort by requestedAt descending
      withdrawals.sort((a: any, b: any) => {
        const timeA = a.requestedAt ? new Date(a.requestedAt).getTime() : 0;
        const timeB = b.requestedAt ? new Date(b.requestedAt).getTime() : 0;
        return timeB - timeA;
      });
      
      return NextResponse.json({
        success: true,
        type: 'withdrawals',
        count: withdrawals.length,
        withdrawals
      });
    }

    // SUB-MODE 1C: Get financial summary
    if (type === 'summary') {
      if (!userPhone || !userRole) {
        return NextResponse.json({ 
          error: 'User phone and role are required' 
        }, { status: 400 });
      }

      let totalEarnings = 0;
      let availableBalance = 0;
      let pendingWithdrawals = 0;
      let totalWithdrawn = 0;

      if (userRole === 'worker') {
        // Get worker's completed tasks
        const tasks = await getCollectionData('tasks');
        const completedTasks = tasks.filter((t: any) => 
          t.assignedWorkerPhone === userPhone && t.status === 'completed'
        );
        
        completedTasks.forEach((task: any) => {
          totalEarnings += (task.price || 0) * 0.30; // 30% commission
        });

        // Get worker's withdrawal requests
        const withdrawals = await getCollectionData('withdrawals');
        const userWithdrawals = withdrawals.filter((w: any) => w.userPhone === userPhone);
        
        userWithdrawals.forEach((withdrawal: any) => {
          if (withdrawal.status === 'completed') {
            totalWithdrawn += withdrawal.amount || 0;
          } else if (withdrawal.status === 'pending') {
            pendingWithdrawals += withdrawal.amount || 0;
          }
        });

        availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

      } else if (userRole === 'manager') {
        // Get manager's team completed tasks
        const workers = await getCollectionData('workers');
        const agentPhones = workers
          .filter((w: any) => w.managerPhone === userPhone)
          .map((w: any) => w.id);

        if (agentPhones.length > 0) {
          const tasks = await getCollectionData('tasks');
          const completedTasks = tasks.filter((t: any) => 
            t.assignedWorkerPhone && 
            agentPhones.includes(t.assignedWorkerPhone) && 
            t.status === 'completed'
          );
          
          let totalAgentEarnings = 0;
          completedTasks.forEach((task: any) => {
            totalAgentEarnings += (task.price || 0) * 0.30; // 30% agent commission
          });

          totalEarnings = totalAgentEarnings * 0.10; // 10% manager commission

          // Get manager's withdrawal requests
          const withdrawals = await getCollectionData('withdrawals');
          const userWithdrawals = withdrawals.filter((w: any) => w.userPhone === userPhone);
          
          userWithdrawals.forEach((withdrawal: any) => {
            if (withdrawal.status === 'completed') {
              totalWithdrawn += withdrawal.amount || 0;
            } else if (withdrawal.status === 'pending') {
              pendingWithdrawals += withdrawal.amount || 0;
            }
          });

          availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;
        }
      }

      return NextResponse.json({
        success: true,
        type: 'summary',
        userPhone,
        userRole,
        totalEarnings: Math.round(totalEarnings),
        availableBalance: Math.max(0, Math.round(availableBalance)),
        pendingWithdrawals: Math.round(pendingWithdrawals),
        totalWithdrawn: Math.round(totalWithdrawn),
        currency: 'KES'
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error: any) {
    console.error('Financial API GET error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message || error.toString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userPhone, userRole, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!userPhone || !userRole) {
      return NextResponse.json({ error: 'User phone and role are required' }, { status: 400 });
    }

    // SUB-MODE 2A: Create payment record (simulated payment)
    if (action === 'createPayment') {
      const { taskId, amount, method = 'simulated', description } = data;

      if (!taskId || !amount) {
        return NextResponse.json({ error: 'Task ID and amount are required' }, { status: 400 });
      }

      // Verify task exists
      const task = await getDocument('tasks', taskId);
      if (!task) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      const paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();
      
      const paymentData = {
        id: paymentId,
        taskId,
        amount: Number(amount),
        customerPhone: userPhone,
        workerPhone: task.assignedWorkerPhone || null,
        method,
        description: description || `Payment for task: ${task.title || 'Unknown'}`,
        status: 'completed', // Simulated payment is always successful
        createdAt: now,
        completedAt: now
      };

      await updateDocument('payments', paymentId, paymentData);

      return NextResponse.json({
        success: true,
        message: 'Payment recorded successfully',
        paymentId,
        payment: paymentData
      });
    }

    // SUB-MODE 2B: Request withdrawal (enhanced version)
    if (action === 'requestWithdrawal') {
      const { amount, method = 'mpesa', accountDetails } = data;

      if (!amount || amount <= 0) {
        return NextResponse.json({ error: 'Valid amount is required' }, { status: 400 });
      }

      // Check withdrawal schedule (Wednesdays & Sundays)
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 3 = Wednesday
      if (dayOfWeek !== 0 && dayOfWeek !== 3) {
        return NextResponse.json({ 
          error: 'Withdrawals only allowed on Wednesdays and Sundays',
          nextWithdrawal: dayOfWeek < 3 ? 'Wednesday' : 'Sunday'
        }, { status: 400 });
      }

      // Get user's available balance
      let availableBalance = 0;
      
      if (userRole === 'worker') {
        const tasks = await getCollectionData('tasks');
        const completedTasks = tasks.filter((t: any) => 
          t.assignedWorkerPhone === userPhone && t.status === 'completed'
        );
        
        let totalEarnings = 0;
        completedTasks.forEach((task: any) => {
          totalEarnings += (task.price || 0) * 0.30;
        });

        const withdrawals = await getCollectionData('withdrawals');
        const userWithdrawals = withdrawals.filter((w: any) => 
          w.userPhone === userPhone && (w.status === 'completed' || w.status === 'pending')
        );
        
        let totalWithdrawn = 0;
        userWithdrawals.forEach((withdrawal: any) => {
          totalWithdrawn += withdrawal.amount || 0;
        });

        availableBalance = totalEarnings - totalWithdrawn;
      }

      if (amount > availableBalance) {
        return NextResponse.json({ 
          error: 'Insufficient balance',
          availableBalance,
          requestedAmount: amount
        }, { status: 400 });
      }

      const withdrawalId = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const now = new Date().toISOString();
      
      const withdrawalData = {
        id: withdrawalId,
        userPhone,
        userRole,
        amount: Number(amount),
        method,
        accountDetails: accountDetails || {},
        status: 'pending',
        requestedAt: now,
        processedBy: null,
        processedAt: null
      };

      await updateDocument('withdrawals', withdrawalId, withdrawalData);

      return NextResponse.json({
        success: true,
        message: 'Withdrawal request submitted successfully',
        withdrawalId,
        withdrawal: withdrawalData,
        nextStep: 'Admin will process your withdrawal within 24 hours'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Financial API POST error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message || error.toString()
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, adminPhone, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!adminPhone) {
      return NextResponse.json({ error: 'Admin phone is required' }, { status: 400 });
    }

    // Verify admin (using users API pattern)
    const admins = await getCollectionData('admins');
    const adminExists = admins.some((admin: any) => admin.id === adminPhone);
    if (!adminExists) {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    // SUB-MODE 3A: Process withdrawal
    if (action === 'processWithdrawal') {
      const { withdrawalId, status, transactionId, notes } = data;

      if (!withdrawalId || !status) {
        return NextResponse.json({ error: 'Withdrawal ID and status are required' }, { status: 400 });
      }

      const withdrawal = await getDocument('withdrawals', withdrawalId);
      if (!withdrawal) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
      }

      const now = new Date().toISOString();
      const updateData: any = {
        status,
        processedBy: adminPhone,
        processedAt: now,
        updatedAt: now
      };

      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      if (notes) {
        updateData.adminNotes = notes;
      }

      await updateDocument('withdrawals', withdrawalId, updateData);

      return NextResponse.json({
        success: true,
        message: `Withdrawal ${status} successfully`,
        withdrawalId,
        updates: updateData
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Financial API PUT error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message || error.toString()
    }, { status: 500 });
  }
}