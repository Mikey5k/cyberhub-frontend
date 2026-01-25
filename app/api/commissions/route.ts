// Force Node runtime for Admin SDK
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userPhone = searchParams.get('userPhone');
    const userRole = searchParams.get('userRole');
    const period = searchParams.get('period') || 'all'; // period: week, month, all

    if (!userPhone || !userRole) {
      return NextResponse.json({ 
        error: 'User phone and role are required' 
      }, { status: 400 });
    }

    if (userRole === 'worker') {
      // Calculate agent commissions (30% of completed tasks)
      const tasksSnapshot = await db.collection('tasks')
        .where('assignedWorkerPhone', '==', userPhone)
        .where('status', '==', 'completed')
        .get();

      const completedTasks: any[] = [];
      let totalEarnings = 0;
      let agentCommission = 0;

      tasksSnapshot.forEach(doc => {
        const task = doc.data() as Task;
        const taskPrice = task.price || 0;
        const commission = taskPrice * 0.30; // 30% agent commission
        
        completedTasks.push({
          id: doc.id,
          title: task.title,
          price: taskPrice,
          commission: commission,
          completedAt: task.completedAt
        });

        totalEarnings += taskPrice;
        agentCommission += commission;
      });

      return NextResponse.json({
        success: true,
        userRole: 'worker',
        totalTasksValue: totalEarnings,
        agentCommission: agentCommission,
        commissionRate: 0.30, // 30%
        completedTasks: completedTasks.length,
        tasks: completedTasks,
        nextWithdrawal: calculateNextWithdrawal()
      });
    }

    else if (userRole === 'manager') {
      // Calculate manager commissions (10% of agent earnings)
      // First get agents under this manager
      const agentsSnapshot = await db.collection('workers')
        .where('managerPhone', '==', userPhone)
        .get();

      const agentPhones: string[] = [];
      agentsSnapshot.forEach(doc => {
        agentPhones.push(doc.id);
      });

      let managerCommission = 0;
      let teamEarnings = 0;
      const agentCommissions: AgentCommission[] = [];

      if (agentPhones.length > 0) {
        // Get completed tasks for these agents
        const tasksSnapshot = await db.collection('tasks')
          .where('assignedWorkerPhone', 'in', agentPhones)
          .where('status', '==', 'completed')
          .get();

        tasksSnapshot.forEach(doc => {
          const task = doc.data() as Task;
          const taskPrice = task.price || 0;
          const agentEarning = taskPrice * 0.30; // Agent gets 30%
          const managerEarning = agentEarning * 0.10; // Manager gets 10% of agent earnings
          
          teamEarnings += taskPrice;
          managerCommission += managerEarning;

          agentCommissions.push({
            taskId: doc.id,
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
        commissionRate: 0.10, // 10% of agent earnings
        agentCommissions: agentCommissions,
        nextWithdrawal: calculateNextWithdrawal()
      });
    }

    else if (userRole === 'admin') {
      // Admin sees all commissions
      const tasksSnapshot = await db.collection('tasks')
        .where('status', '==', 'completed')
        .get();

      let totalRevenue = 0;
      let totalAgentCommissions = 0;
      let totalManagerCommissions = 0;
      const allCommissions: CommissionRecord[] = [];

      tasksSnapshot.forEach(doc => {
        const task = doc.data() as Task;
        const taskPrice = task.price || 0;
        const agentCommission = taskPrice * 0.30;
        const managerCommission = agentCommission * 0.10;
        
        totalRevenue += taskPrice;
        totalAgentCommissions += agentCommission;
        totalManagerCommissions += managerCommission;

        allCommissions.push({
          taskId: doc.id,
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
        completedTasks: tasksSnapshot.size,
        allCommissions: allCommissions
      });
    }

    else {
      return NextResponse.json({ 
        error: 'Invalid role for commission calculation' 
      }, { status: 400 });
    }

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
    const body = await request.json() as WithdrawalRequest;
    const { userPhone, userRole, amount, method = 'mpesa' } = body;

    if (!userPhone || !userRole || !amount) {
      return NextResponse.json({ 
        error: 'User phone, role, and amount are required' 
      }, { status: 400 });
    }

    const withdrawalRef = db.collection('withdrawals').doc();

    await withdrawalRef.set({
      userPhone: userPhone,
      userRole: userRole,
      amount: parseFloat(amount.toString()),
      method: method,
      status: 'pending',
      requestedAt: FieldValue.serverTimestamp(),
      processedAt: null,
      withdrawalDay: getCurrentWithdrawalDay()
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted',
      withdrawalId: withdrawalRef.id,
      amount: amount,
      status: 'pending',
      processingDays: 'Wednesdays & Sundays'
    });

  } catch (error: any) {
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message
    }, { status: 500 });
  }
}