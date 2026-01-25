// Force Node runtime for Admin SDK
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userPhone = searchParams.get('userPhone');
    const userRole = searchParams.get('userRole');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // SUB-MODE 1A: Get payment history
    if (!type || type === 'payments') {
      if (!userPhone || !userRole) {
        return NextResponse.json({ 
          error: 'User phone and role are required' 
        }, { status: 400 });
      }

      // Use 'any' type to avoid TypeScript query assignment issues
      let query: any = db.collection('payments');

      // Filter by user
      if (userRole === 'user') {
        query = query.where('customerPhone', '==', userPhone);
      } else if (userRole === 'worker') {
        query = query.where('workerPhone', '==', userPhone);
      } else if (userRole === 'manager') {
        // Managers see payments from their agents
        const agentsSnapshot = await db.collection('workers')
          .where('managerPhone', '==', userPhone)
          .get();
        
        const agentPhones: string[] = [];
        agentsSnapshot.forEach((doc: any) => {
          agentPhones.push(doc.id);
        });

        if (agentPhones.length === 0) {
          return NextResponse.json({
            success: true,
            type: 'payments',
            count: 0,
            payments: []
          });
        }

        query = query.where('workerPhone', 'in', agentPhones);
      } else if (userRole === 'admin') {
        // Admin sees all payments - no filter needed
      } else {
        return NextResponse.json({ error: 'Invalid user role' }, { status: 400 });
      }

      // Filter by status if provided
      if (status) {
        query = query.where('status', '==', status);
      }

      // Filter by date range if provided
      if (startDate) {
        const start = new Date(startDate);
        query = query.where('createdAt', '>=', start);
      }

      if (endDate) {
        const end = new Date(endDate);
        query = query.where('createdAt', '<=', end);
      }

      const snapshot = await query.orderBy('createdAt', 'desc').get();
      const payments: any[] = [];
      
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        payments.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
          completedAt: data.completedAt?.toDate?.()?.toISOString() || data.completedAt
        });
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

      // Use 'any' type to avoid TypeScript query assignment issues
      let query: any = db.collection('withdrawals').where('userPhone', '==', userPhone);

      // Filter by status if provided
      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot = await query.orderBy('requestedAt', 'desc').get();
      const withdrawals: any[] = [];
      
      snapshot.forEach((doc: any) => {
        const data = doc.data();
        withdrawals.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to ISO strings
          requestedAt: data.requestedAt?.toDate?.()?.toISOString() || data.requestedAt,
          processedAt: data.processedAt?.toDate?.()?.toISOString() || data.processedAt
        });
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
        const tasksSnapshot = await db.collection('tasks')
          .where('assignedWorkerPhone', '==', userPhone)
          .where('status', '==', 'completed')
          .get();
        
        tasksSnapshot.forEach((doc: any) => {
          const task = doc.data() as Task;
          totalEarnings += (task.price || 0) * 0.30; // 30% commission
        });

        // Get worker's withdrawal requests
        const withdrawalsSnapshot = await db.collection('withdrawals')
          .where('userPhone', '==', userPhone)
          .get();
        
        withdrawalsSnapshot.forEach((doc: any) => {
          const withdrawal = doc.data() as Withdrawal;
          if (withdrawal.status === 'completed') {
            totalWithdrawn += withdrawal.amount || 0;
          } else if (withdrawal.status === 'pending') {
            pendingWithdrawals += withdrawal.amount || 0;
          }
        });

        availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

      } else if (userRole === 'manager') {
        // Get manager's team completed tasks
        const agentsSnapshot = await db.collection('workers')
          .where('managerPhone', '==', userPhone)
          .get();
        
        const agentPhones: string[] = [];
        agentsSnapshot.forEach((doc: any) => {
          agentPhones.push(doc.id);
        });

        if (agentPhones.length > 0) {
          const tasksSnapshot = await db.collection('tasks')
            .where('assignedWorkerPhone', 'in', agentPhones)
            .where('status', '==', 'completed')
            .get();
          
          let totalAgentEarnings = 0;
          tasksSnapshot.forEach((doc: any) => {
            const task = doc.data() as Task;
            totalAgentEarnings += (task.price || 0) * 0.30; // 30% agent commission
          });

          totalEarnings = totalAgentEarnings * 0.10; // 10% manager commission

          // Get manager's withdrawal requests
          const withdrawalsSnapshot = await db.collection('withdrawals')
            .where('userPhone', '==', userPhone)
            .get();
          
          withdrawalsSnapshot.forEach((doc: any) => {
            const withdrawal = doc.data() as Withdrawal;
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
        availableBalance: Math.round(availableBalance),
        pendingWithdrawals: Math.round(pendingWithdrawals),
        totalWithdrawn: Math.round(totalWithdrawn),
        currency: 'KES'
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error: any) {
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message
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
      const taskDoc = await db.collection('tasks').doc(taskId).get();
      if (!taskDoc.exists) {
        return NextResponse.json({ error: 'Task not found' }, { status: 404 });
      }

      const paymentRef = db.collection('payments').doc();
      const paymentId = `PAY${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const paymentData = {
        id: paymentId,
        paymentRef: paymentRef.id,
        taskId,
        amount: Number(amount),
        customerPhone: userPhone,
        workerPhone: taskDoc.data()?.assignedWorkerPhone || null,
        method,
        description: description || `Payment for task: ${taskDoc.data()?.title || 'Unknown'}`,
        status: 'completed', // Simulated payment is always successful
        createdAt: FieldValue.serverTimestamp(),
        completedAt: FieldValue.serverTimestamp()
      };

      await paymentRef.set(paymentData);

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
        const tasksSnapshot = await db.collection('tasks')
          .where('assignedWorkerPhone', '==', userPhone)
          .where('status', '==', 'completed')
          .get();
        
        let totalEarnings = 0;
        tasksSnapshot.forEach((doc: any) => {
          const task = doc.data() as Task;
          totalEarnings += (task.price || 0) * 0.30;
        });

        const withdrawalsSnapshot = await db.collection('withdrawals')
          .where('userPhone', '==', userPhone)
          .where('status', 'in', ['completed', 'pending'])
          .get();
        
        let totalWithdrawn = 0;
        withdrawalsSnapshot.forEach((doc: any) => {
          const withdrawal = doc.data() as Withdrawal;
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

      const withdrawalRef = db.collection('withdrawals').doc();
      const withdrawalId = `WD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const withdrawalData = {
        id: withdrawalId,
        withdrawalRef: withdrawalRef.id,
        userPhone,
        userRole,
        amount: Number(amount),
        method,
        accountDetails: accountDetails || {},
        status: 'pending',
        requestedAt: FieldValue.serverTimestamp(),
        processedBy: null,
        processedAt: null
      };

      await withdrawalRef.set(withdrawalData);

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
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message
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

    // Verify admin
    const adminDoc = await db.collection('admins').doc(adminPhone).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    // SUB-MODE 3A: Process withdrawal
    if (action === 'processWithdrawal') {
      const { withdrawalId, status, transactionId, notes } = data;

      if (!withdrawalId || !status) {
        return NextResponse.json({ error: 'Withdrawal ID and status are required' }, { status: 400 });
      }

      const withdrawalRef = db.collection('withdrawals').doc(withdrawalId);
      const withdrawalDoc = await withdrawalRef.get();

      if (!withdrawalDoc.exists) {
        return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
      }

      const updateData: any = {
        status,
        processedBy: adminPhone,
        processedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      if (transactionId) {
        updateData.transactionId = transactionId;
      }

      if (notes) {
        updateData.adminNotes = notes;
      }

      await withdrawalRef.update(updateData);

      return NextResponse.json({
        success: true,
        message: `Withdrawal ${status} successfully`,
        withdrawalId,
        updates: updateData
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message
    }, { status: 500 });
  }
}