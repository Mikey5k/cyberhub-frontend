import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

interface Task {
  id: string;
  title?: string;
  price?: number;
  assignedWorkerPhone?: string;
  status?: string;
  completedAt?: any;
}

interface AgentCommission {
  taskId: string;
  taskTitle?: string;
  agentPhone?: string;
  taskPrice: number;
  agentEarning: number;
  managerEarning: number;
}

interface CommissionRecord {
  taskId: string;
  title?: string;
  price: number;
  agentPhone?: string;
  agentCommission: number;
  managerCommission: number;
  netProfit: number;
}

interface WithdrawalRequest {
  userPhone: string;
  userRole: string;
  amount: number;
  method?: string;
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

// Helper functions
function calculateNextWithdrawal(): string {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday, 3 = Wednesday
  
  if (day === 0 || day === 3) {
    return 'Today';
  } else if (day < 3) {
    return 'Wednesday';
  } else {
    return 'Sunday';
  }
}

function getCurrentWithdrawalDay(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
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

async function getTasksByFilter(field: string, value: string, statusFilter?: string) {
  const response = await firestoreRequest('/tasks');
  if (!response.documents) return [];
  
  return response.documents
    .map(convertFirestoreDoc)
    .filter((task: any) => {
      if (statusFilter && task.status !== statusFilter) return false;
      if (field === 'assignedWorkerPhone' && task[field] !== value) return false;
      return true;
    });
}

async function getWorkersByManager(managerPhone: string) {
  const response = await firestoreRequest('/workers');
  if (!response.documents) return [];
  
  return response.documents
    .map(convertFirestoreDoc)
    .filter((worker: any) => worker.managerPhone === managerPhone);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('userPhone');
    const userRole = searchParams.get('userRole');
    const period = searchParams.get('period') || 'all';

    if (!userPhone || !userRole) {
      return NextResponse.json({ 
        error: 'User phone and role are required' 
      }, { status: 400 });
    }

    if (userRole === 'worker') {
      // Calculate agent commissions (30% of completed tasks)
      const completedTasks = await getTasksByFilter('assignedWorkerPhone', userPhone, 'completed');

      let totalEarnings = 0;
      let agentCommission = 0;
      const tasksWithCommission = completedTasks.map((task: any) => {
        const taskPrice = task.price || 0;
        const commission = taskPrice * 0.30; // 30% agent commission
        
        totalEarnings += taskPrice;
        agentCommission += commission;

        return {
          id: task.id,
          title: task.title,
          price: taskPrice,
          commission: commission,
          completedAt: task.completedAt
        };
      });

      return NextResponse.json({
        success: true,
        userRole: 'worker',
        totalTasksValue: totalEarnings,
        agentCommission: agentCommission,
        commissionRate: 0.30,
        completedTasks: tasksWithCommission.length,
        tasks: tasksWithCommission,
        nextWithdrawal: calculateNextWithdrawal()
      });
    }

    else if (userRole === 'manager') {
      // Calculate manager commissions (10% of agent earnings)
      const agents = await getWorkersByManager(userPhone);
      const agentPhones = agents.map((agent: any) => agent.id);

      let managerCommission = 0;
      let teamEarnings = 0;
      const agentCommissions: AgentCommission[] = [];

      if (agentPhones.length > 0) {
        const allTasks = await getTasksByFilter('status', 'completed');
        const agentTasks = allTasks.filter((task: any) => 
          task.assignedWorkerPhone && agentPhones.includes(task.assignedWorkerPhone)
        );

        agentTasks.forEach((task: any) => {
          const taskPrice = task.price || 0;
          const agentEarning = taskPrice * 0.30; // Agent gets 30%
          const managerEarning = agentEarning * 0.10; // Manager gets 10% of agent earnings
          
          teamEarnings += taskPrice;
          managerCommission += managerEarning;

          agentCommissions.push({
            taskId: task.id,
            taskTitle: task.title,
            agentPhone: task.assignedWorkerPhone,
            taskPrice: taskPrice,
            agentEarning: agentEarning,
            managerEarning: managerEarning
          });
        });
      }

      return NextResponse.json({
        success: true,
        userRole: 'manager',
        teamAgentsCount: agentPhones.length,
        teamTotalEarnings: teamEarnings,
        managerCommission: managerCommission,
        commissionRate: 0.10,
        agentCommissions: agentCommissions,
        nextWithdrawal: calculateNextWithdrawal()
      });
    }

    else if (userRole === 'admin') {
      // Admin sees all commissions
      const completedTasks = await getTasksByFilter('status', 'completed');

      let totalRevenue = 0;
      let totalAgentCommissions = 0;
      let totalManagerCommissions = 0;
      const allCommissions: CommissionRecord[] = [];

      completedTasks.forEach((task: any) => {
        const taskPrice = task.price || 0;
        const agentCommission = taskPrice * 0.30;
        const managerCommission = agentCommission * 0.10;
        
        totalRevenue += taskPrice;
        totalAgentCommissions += agentCommission;
        totalManagerCommissions += managerCommission;

        allCommissions.push({
          taskId: task.id,
          title: task.title,
          price: taskPrice,
          agentPhone: task.assignedWorkerPhone,
          agentCommission: agentCommission,
          managerCommission: managerCommission,
          netProfit: taskPrice - agentCommission - managerCommission
        });
      });

      return NextResponse.json({
        success: true,
        userRole: 'admin',
        totalRevenue: totalRevenue,
        totalAgentCommissions: totalAgentCommissions,
        totalManagerCommissions: totalManagerCommissions,
        platformProfit: totalRevenue - totalAgentCommissions - totalManagerCommissions,
        completedTasks: completedTasks.length,
        allCommissions: allCommissions
      });
    }

    else {
      return NextResponse.json({ 
        error: 'Invalid role for commission calculation' 
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Commissions API error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message || error.toString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WithdrawalRequest;
    const { userPhone, userRole, amount, method = 'mpesa' } = body;

    if (!userPhone || !userRole || !amount) {
      return NextResponse.json({ 
        error: 'User phone, role, and amount are required' 
      }, { status: 400 });
    }

    const withdrawalId = Date.now().toString();
    const now = new Date().toISOString();
    
    const withdrawalData = {
      fields: {
        userPhone: { stringValue: userPhone },
        userRole: { stringValue: userRole },
        amount: { doubleValue: parseFloat(amount.toString()) },
        method: { stringValue: method },
        status: { stringValue: 'pending' },
        requestedAt: { timestampValue: now },
        processedAt: { nullValue: null },
        withdrawalDay: { stringValue: getCurrentWithdrawalDay() }
      }
    };

    await firestoreRequest(`/withdrawals/${withdrawalId}`, 'PATCH', withdrawalData);

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted',
      withdrawalId: withdrawalId,
      amount: amount,
      status: 'pending',
      processingDays: 'Wednesdays & Sundays'
    });

  } catch (error: any) {
    console.error('Commissions API POST error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message || error.toString()
    }, { status: 500 });
  }
}