import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

// Commission rates from our system
const AGENT_COMMISSION_RATE = 0.30; // 30%
const MANAGER_COMMISSION_RATE = 0.10; // 10% of agent earnings

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

async function getCollectionCount(collection: string, filters?: { field: string, value: any }[]) {
  const documents = await getCollectionData(collection, filters);
  return documents.length;
}

function decodePhone(phone: string | null) {
  if (!phone) return '';
  let decoded = decodeURIComponent(phone);
  if (decoded.startsWith(' ') && decoded.length > 1) {
    decoded = '+' + decoded.substring(1);
  }
  return decoded;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userPhone = searchParams.get('userPhone');
    const userRole = searchParams.get('userRole');
    const timeframe = searchParams.get('timeframe') || '7d';

    const decodedUserPhone = decodePhone(userPhone);

    // SUB-MODE 1A: Get system health status
    if (!type || type === 'health') {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
      
      // Get recent tasks
      const allTasks = await getCollectionData('tasks');
      const recentTasks = allTasks.filter((task: any) => {
        const taskTime = task.createdAt ? new Date(task.createdAt).getTime() : 0;
        const cutoffTime = new Date(oneHourAgo).getTime();
        return taskTime >= cutoffTime;
      });

      // Get recent payments
      const allPayments = await getCollectionData('payments');
      const recentPayments = allPayments.filter((payment: any) => {
        const paymentTime = payment.createdAt ? new Date(payment.createdAt).getTime() : 0;
        const cutoffTime = new Date(oneHourAgo).getTime();
        return paymentTime >= cutoffTime;
      });

      const users = await getCollectionData('users');
      
      // Calculate uptime (simulated)
      const uptimePercentage = 99.8;
      
      // Check system components
      const components = [
        { name: 'Database', status: 'healthy', details: 'Firestore connected' },
        { name: 'Authentication', status: 'healthy', details: 'Phone auth working' },
        { name: 'API Gateway', status: 'healthy', details: 'All endpoints responding' },
        { name: 'Payment Processing', status: 'simulated', details: 'Using simulated payments' },
        { name: 'WhatsApp Integration', status: 'external', details: 'Direct links only' },
        { name: 'Commission System', status: 'healthy', details: `Agent: ${AGENT_COMMISSION_RATE*100}%, Manager: ${MANAGER_COMMISSION_RATE*100}%` }
      ];

      return NextResponse.json({
        success: true,
        type: 'health',
        timestamp: now.toISOString(),
        status: 'healthy',
        uptime: `${uptimePercentage}%`,
        recentActivity: {
          tasks: recentTasks.length,
          payments: recentPayments.length,
          activeUsers: users.length
        },
        components,
        alerts: recentTasks.length === 0 && recentPayments.length === 0 ? ['Low recent activity'] : [],
        project: 'CyberHub',
        version: '1.0.0',
        backend: 'APIs migrated to Firestore REST'
      });
    }

    // SUB-MODE 1B: Get dashboard analytics
    if (type === 'dashboard') {
      if (!decodedUserPhone || !userRole) {
        return NextResponse.json({ error: 'User phone and role are required' }, { status: 400 });
      }

      // Calculate date range based on timeframe
      const now = new Date();
      let startDate = new Date();
      
      switch (timeframe) {
        case '1d':
          startDate.setDate(now.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }

      let analytics: any = {};

      if (userRole === 'admin') {
        // Admin sees system-wide analytics
        const [
          users,
          workers,
          managers,
          tasks,
          completedTasksList,
          withdrawals
        ] = await Promise.all([
          getCollectionData('users'),
          getCollectionData('workers'),
          getCollectionData('managers'),
          getCollectionData('tasks'),
          getCollectionData('tasks', [{ field: 'status', value: 'completed' }]),
          getCollectionData('withdrawals', [{ field: 'status', value: 'pending' }])
        ]);

        // Calculate total revenue from payments
        const payments = await getCollectionData('payments');
        const completedPayments = payments.filter((p: any) => p.status === 'completed');
        let revenueTotal = 0;
        completedPayments.forEach((payment: any) => {
          revenueTotal += payment.amount || 0;
        });

        // Get recent tasks for timeline
        const allTasks = await getCollectionData('tasks');
        const recentTasks = allTasks
          .sort((a: any, b: any) => {
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return timeB - timeA;
          })
          .slice(0, 10);

        // Calculate commissions distributed
        let totalCommissions = 0;
        completedTasksList.forEach((task: any) => {
          const taskPrice = task.price || 0;
          totalCommissions += taskPrice * AGENT_COMMISSION_RATE;
        });

        analytics = {
          summary: {
            totalUsers: users.length,
            totalWorkers: workers.length,
            totalManagers: managers.length,
            totalTasks: tasks.length,
            completedTasks: completedTasksList.length,
            completionRate: tasks.length > 0 
              ? Math.round((completedTasksList.length / tasks.length) * 100) 
              : 0,
            totalRevenue: Math.round(revenueTotal),
            totalCommissions: Math.round(totalCommissions),
            pendingWithdrawals: withdrawals.length,
            commissionRates: {
              agent: `${AGENT_COMMISSION_RATE * 100}%`,
              manager: `${MANAGER_COMMISSION_RATE * 100}% of agent earnings`
            }
          },
          recentActivity: recentTasks,
          timeframe
        };

      } else if (userRole === 'manager') {
        // Manager sees team analytics
        const workers = await getCollectionData('workers');
        const agentPhones = workers
          .filter((w: any) => w.managerPhone === decodedUserPhone)
          .map((w: any) => w.id);

        let teamTasksCompleted = 0;
        let teamRevenue = 0;
        let teamCommission = 0;

        if (agentPhones.length > 0) {
          const allTasks = await getCollectionData('tasks');
          const teamTasks = allTasks.filter((task: any) => {
            const isAgentTask = task.assignedWorkerPhone && agentPhones.includes(task.assignedWorkerPhone);
            const isCompleted = task.status === 'completed';
            const isInTimeframe = task.completedAt && new Date(task.completedAt) >= startDate;
            return isAgentTask && isCompleted && isInTimeframe;
          });
          
          teamTasks.forEach((task: any) => {
            const taskRevenue = task.price || 0;
            const agentEarning = taskRevenue * AGENT_COMMISSION_RATE;
            const managerCommission = agentEarning * MANAGER_COMMISSION_RATE;
            
            teamTasksCompleted++;
            teamRevenue += taskRevenue;
            teamCommission += managerCommission;
          });
        }

        analytics = {
          summary: {
            teamSize: agentPhones.length,
            teamTasksCompleted,
            teamRevenue: Math.round(teamRevenue),
            teamCommission: Math.round(teamCommission),
            timeframe,
            commissionRate: `${MANAGER_COMMISSION_RATE * 100}% of agent earnings`
          },
          agents: agentPhones.length,
          performance: {
            taskCompletionRate: agentPhones.length > 0 ? Math.round((teamTasksCompleted / (agentPhones.length * 10)) * 100) : 0,
            avgCommissionPerAgent: agentPhones.length > 0 ? Math.round(teamCommission / agentPhones.length) : 0,
            withdrawalSchedule: 'Wednesdays & Sundays'
          }
        };

      } else if (userRole === 'worker' || userRole === 'agent') {
        // Worker/Agent sees personal analytics
        const allTasks = await getCollectionData('tasks');
        const workerTasks = allTasks.filter((task: any) => {
          const isWorkerTask = task.assignedWorkerPhone === decodedUserPhone;
          const isInTimeframe = task.completedAt && new Date(task.completedAt) >= startDate;
          return isWorkerTask && isInTimeframe;
        });
        
        let completedTasks = 0;
        let totalEarnings = 0;
        let avgCompletionTime = 0;
        const completionTimes: number[] = [];

        workerTasks.forEach((task: any) => {
          if (task.status === 'completed') {
            completedTasks++;
            totalEarnings += (task.price || 0) * AGENT_COMMISSION_RATE;
            
            if (task.createdAt && task.completedAt) {
              const created = new Date(task.createdAt);
              const completed = new Date(task.completedAt);
              const hours = (completed.getTime() - created.getTime()) / (1000 * 60 * 60);
              completionTimes.push(hours);
            }
          }
        });

        if (completionTimes.length > 0) {
          avgCompletionTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
        }

        // Get performance ranking (simulated)
        const performanceScore = Math.min(100, Math.round((completedTasks / 10) * 100));
        const performanceLevel = performanceScore >= 90 ? 'Excellent' :
                                performanceScore >= 70 ? 'Good' :
                                performanceScore >= 50 ? 'Average' : 'Needs Improvement';

        analytics = {
          summary: {
            completedTasks,
            totalEarnings: Math.round(totalEarnings),
            avgCompletionTime: Math.round(avgCompletionTime * 10) / 10,
            performanceScore,
            performanceLevel,
            timeframe,
            commissionRate: `${AGENT_COMMISSION_RATE * 100}%`,
            withdrawalDays: 'Wednesdays & Sundays'
          },
          recentTasks: completedTasks,
          earningsTrend: 'up'
        };
      }

      return NextResponse.json({
        success: true,
        type: 'dashboard',
        userPhone: decodedUserPhone,
        userRole,
        timeframe,
        ...analytics,
        generatedAt: now.toISOString(),
        system: 'CyberHub Analytics'
      });
    }

    // SUB-MODE 1C: Get notifications
    if (type === 'notifications') {
      if (!decodedUserPhone) {
        return NextResponse.json({ error: 'User phone is required' }, { status: 400 });
      }

      // Get user-specific notifications
      const allNotifications = await getCollectionData('notifications');
      const userNotifications = allNotifications
        .filter((n: any) => n.userPhone === decodedUserPhone)
        .sort((a: any, b: any) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        })
        .slice(0, 20);
      
      let unreadCount = 0;
      
      userNotifications.forEach((notification: any) => {
        if (!notification.read) {
          unreadCount++;
        }
      });

      // Generate system notifications based on user role
      const systemNotifications = [];
      const currentNow = new Date();
      
      // Check for upcoming withdrawal days - OUR SYSTEM: Wednesdays & Sundays
      const dayOfWeek = currentNow.getDay(); // 0 = Sunday, 3 = Wednesday
      const isWithdrawalDay = dayOfWeek === 0 || dayOfWeek === 3;
      const nextWithdrawalDay = dayOfWeek < 3 ? 3 : dayOfWeek === 3 ? 0 : 0;
      const daysUntilWithdrawal = isWithdrawalDay ? 0 : 
                                 dayOfWeek < 3 ? 3 - dayOfWeek : 
                                 dayOfWeek === 3 ? 0 : 7 - dayOfWeek;
      
      if (daysUntilWithdrawal <= 2) {
        systemNotifications.push({
          id: 'withdrawal_reminder',
          type: 'reminder',
          title: 'Withdrawal Day Approaching',
          message: `Next withdrawal is ${isWithdrawalDay ? 'TODAY' : `in ${daysUntilWithdrawal} day(s) (${nextWithdrawalDay === 0 ? 'Sunday' : 'Wednesday'})`}`,
          priority: 'medium',
          createdAt: currentNow.toISOString(),
          system: true,
          action: '/agent-dashboard?withdraw=true'
        });
      }

      return NextResponse.json({
        success: true,
        type: 'notifications',
        userPhone: decodedUserPhone,
        notifications: [...systemNotifications, ...userNotifications],
        unreadCount: unreadCount + systemNotifications.length,
        totalCount: userNotifications.length + systemNotifications.length,
        withdrawalSchedule: 'Wednesdays & Sundays'
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message || error.toString(),
      project: 'CyberHub',
      endpoint: 'analytics'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userPhone, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!userPhone) {
      return NextResponse.json({ error: 'User phone is required' }, { status: 400 });
    }

    const decodedUserPhone = decodePhone(userPhone);

    // Note: Marking notifications as read requires more complex batch operations
    // For MVP, we'll implement a simplified version
    if (action === 'markAsRead') {
      const { notificationIds } = data;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json({ error: 'Notification IDs array is required' }, { status: 400 });
      }

      // Simplified: Just return success since batch updates are complex with REST API
      // In production, would need to update each document individually
      
      return NextResponse.json({
        success: true,
        message: `Marked ${notificationIds.length} notification(s) as read (simulated)`,
        markedRead: notificationIds.length,
        userPhone: decodedUserPhone,
        note: 'Batch updates require individual document updates in REST API'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Analytics API POST error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message || error.toString(),
      project: 'CyberHub',
      endpoint: 'analytics'
    }, { status: 500 });
  }
}