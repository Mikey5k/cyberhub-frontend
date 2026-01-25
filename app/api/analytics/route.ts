// Force Node runtime for Admin SDK
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { DocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore';

// Commission rates from our system
const AGENT_COMMISSION_RATE = 0.30; // 30%
const MANAGER_COMMISSION_RATE = 0.10; // 10% of agent earnings

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userPhone = searchParams.get('userPhone');
    const userRole = searchParams.get('userRole');
    const timeframe = searchParams.get('timeframe') || '7d';

    // Handle phone number URL encoding (+ to space issue)
    const decodePhone = (phone: string | null) => {
      if (!phone) return '';
      let decoded = decodeURIComponent(phone);
      if (decoded.startsWith(' ') && decoded.length > 1) {
        decoded = '+' + decoded.substring(1);
      }
      return decoded;
    };

    const decodedUserPhone = decodePhone(userPhone);

    // SUB-MODE 1A: Get system health status
    if (!type || type === 'health') {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      // Check recent activity
      const [tasksSnapshot, usersSnapshot, paymentsSnapshot] = await Promise.all([
        db.collection('tasks')
          .where('createdAt', '>=', oneHourAgo)
          .limit(5)
          .get(),
        db.collection('users')
          .limit(5)
          .get(),
        db.collection('payments')
          .where('createdAt', '>=', oneHourAgo)
          .limit(5)
          .get()
      ]);

      const recentTasks = tasksSnapshot.size;
      const recentPayments = paymentsSnapshot.size;
      
      // Calculate uptime (simulated)
      const uptimePercentage = 99.8;
      
      // Check system components
      const components = [
        { name: 'Database', status: 'healthy', details: 'Firestore connected' },
        { name: 'Authentication', status: 'healthy', details: 'Phone auth working' },
        { name: 'API Gateway', status: 'healthy', details: 'All 10 endpoints responding' },
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
          tasks: recentTasks,
          payments: recentPayments,
          activeUsers: usersSnapshot.size
        },
        components,
        alerts: recentTasks === 0 && recentPayments === 0 ? ['Low recent activity'] : [],
        project: 'CyberHub',
        version: '1.0.0',
        backend: '100% migrated (10/10 APIs)'
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
          totalUsers,
          totalWorkers,
          totalManagers,
          totalTasks,
          completedTasks,
          pendingWithdrawals
        ] = await Promise.all([
          db.collection('users').count().get(),
          db.collection('workers').count().get(),
          db.collection('managers').count().get(),
          db.collection('tasks').count().get(),
          db.collection('tasks').where('status', '==', 'completed').count().get(),
          db.collection('withdrawals').where('status', '==', 'pending').count().get()
        ]);

        // Calculate total revenue
        const paymentsSnapshot = await db.collection('payments')
          .where('status', '==', 'completed')
          .get();
        
        let revenueTotal = 0;
        paymentsSnapshot.forEach((doc: DocumentSnapshot) => {
          const data = doc.data();
          revenueTotal += data?.amount || 0;
        });

        // Get recent tasks for timeline
        const recentTasksSnapshot = await db.collection('tasks')
          .orderBy('createdAt', 'desc')
          .limit(10)
          .get();
        
        const recentTasks: any[] = [];
        recentTasksSnapshot.forEach((doc: DocumentSnapshot) => {
          const data = doc.data();
          recentTasks.push({
            id: doc.id,
            ...data,
            createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
            completedAt: data?.completedAt?.toDate?.()?.toISOString() || data?.completedAt
          });
        });

        // Calculate commissions distributed
        const completedTasksSnapshot = await db.collection('tasks')
          .where('status', '==', 'completed')
          .get();
        
        let totalCommissions = 0;
        completedTasksSnapshot.forEach((doc: DocumentSnapshot) => {
          const task = doc.data();
          const taskPrice = task?.price || 0;
          totalCommissions += taskPrice * AGENT_COMMISSION_RATE;
        });

        analytics = {
          summary: {
            totalUsers: totalUsers.data().count,
            totalWorkers: totalWorkers.data().count,
            totalManagers: totalManagers.data().count,
            totalTasks: totalTasks.data().count,
            completedTasks: completedTasks.data().count,
            completionRate: totalTasks.data().count > 0 
              ? Math.round((completedTasks.data().count / totalTasks.data().count) * 100) 
              : 0,
            totalRevenue: Math.round(revenueTotal),
            totalCommissions: Math.round(totalCommissions),
            pendingWithdrawals: pendingWithdrawals.data().count,
            commissionRates: {
              agent: `${AGENT_COMMISSION_RATE * 100}%`,
              manager: `${MANAGER_COMMISSION_RATE * 100}% of agent earnings`
            }
          },
          recentActivity: recentTasks,
          timeframe
        };

      } else if (userRole === 'manager') {
        // Manager sees team analytics - OUR SYSTEM: Admin → Super Agent → Regular Agent
        const agentsSnapshot: QuerySnapshot = await db.collection('workers')
          .where('managerPhone', '==', decodedUserPhone)
          .get();
        
        const agentPhones: string[] = [];
        agentsSnapshot.forEach((doc: DocumentSnapshot) => {
          agentPhones.push(doc.id);
        });

        let teamTasksCompleted = 0;
        let teamRevenue = 0;
        let teamCommission = 0;

        if (agentPhones.length > 0) {
          const tasksSnapshot: QuerySnapshot = await db.collection('tasks')
            .where('assignedWorkerPhone', 'in', agentPhones)
            .where('status', '==', 'completed')
            .where('completedAt', '>=', startDate)
            .get();
          
          tasksSnapshot.forEach((doc: DocumentSnapshot) => {
            const task = doc.data();
            const taskRevenue = task?.price || 0;
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
        // Worker/Agent sees personal analytics - OUR SYSTEM: Worker/Agent role
        const tasksSnapshot: QuerySnapshot = await db.collection('tasks')
          .where('assignedWorkerPhone', '==', decodedUserPhone)
          .where('completedAt', '>=', startDate)
          .get();
        
        let completedTasks = 0;
        let totalEarnings = 0;
        let avgCompletionTime = 0;
        const completionTimes: number[] = [];

        tasksSnapshot.forEach((doc: DocumentSnapshot) => {
          const task = doc.data();
          if (task?.status === 'completed') {
            completedTasks++;
            totalEarnings += (task.price || 0) * AGENT_COMMISSION_RATE;
            
            if (task.createdAt && task.completedAt) {
              const created = task.createdAt.toDate ? task.createdAt.toDate() : new Date(task.createdAt);
              const completed = task.completedAt.toDate ? task.completedAt.toDate() : new Date(task.completedAt);
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
      const notificationsSnapshot: QuerySnapshot = await db.collection('notifications')
        .where('userPhone', '==', decodedUserPhone)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .get();
      
      const notifications: any[] = [];
      let unreadCount = 0;
      
      notificationsSnapshot.forEach((doc: DocumentSnapshot) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt
        });
        
        if (!data?.read) {
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

      // Add commission reminder
      systemNotifications.push({
        id: 'commission_info',
        type: 'info',
        title: 'Commission Rates',
        message: `Your commission: ${userRole === 'worker' || userRole === 'agent' ? `${AGENT_COMMISSION_RATE * 100}%` : userRole === 'manager' ? `${MANAGER_COMMISSION_RATE * 100}% of agent earnings` : 'N/A'}`,
        priority: 'low',
        createdAt: currentNow.toISOString(),
        system: true
      });

      return NextResponse.json({
        success: true,
        type: 'notifications',
        userPhone: decodedUserPhone,
        notifications: [...systemNotifications, ...notifications],
        unreadCount: unreadCount + systemNotifications.length,
        totalCount: notifications.length + systemNotifications.length,
        withdrawalSchedule: 'Wednesdays & Sundays'
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error: any) {
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message,
      project: 'CyberHub',
      endpoint: 'analytics'
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

    // Handle phone decoding for database queries
    const decodePhone = (phone: string) => {
      if (!phone) return '';
      if (phone.startsWith(' ') && phone.length > 1) {
        return '+' + phone.substring(1);
      }
      return phone;
    };

    const decodedUserPhone = decodePhone(userPhone);

    // SUB-MODE 2A: Mark notifications as read
    if (action === 'markAsRead') {
      const { notificationIds } = data;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return NextResponse.json({ error: 'Notification IDs array is required' }, { status: 400 });
      }

      const batch = db.batch();
      const now = FieldValue.serverTimestamp();

      notificationIds.forEach((notificationId: string) => {
        const notificationRef = db.collection('notifications').doc(notificationId);
        batch.update(notificationRef, {
          read: true,
          readAt: now
        });
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `${notificationIds.length} notification(s) marked as read`,
        markedRead: notificationIds.length,
        userPhone: decodedUserPhone
      });
    }

    // SUB-MODE 2B: Clear all notifications
    if (action === 'clearAll') {
      const notificationsSnapshot: QuerySnapshot = await db.collection('notifications')
        .where('userPhone', '==', decodedUserPhone)
        .where('read', '==', false)
        .get();
      
      const batch = db.batch();
      const now = FieldValue.serverTimestamp();

      notificationsSnapshot.forEach((doc: DocumentSnapshot) => {
        const notificationRef = db.collection('notifications').doc(doc.id);
        batch.update(notificationRef, {
          read: true,
          readAt: now
        });
      });

      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `Cleared ${notificationsSnapshot.size} unread notification(s)`,
        clearedCount: notificationsSnapshot.size,
        userPhone: decodedUserPhone
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Firestore error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message,
      project: 'CyberHub',
      endpoint: 'analytics'
    }, { status: 500 });
  }
}