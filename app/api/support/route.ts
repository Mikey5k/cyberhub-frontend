// Force Node runtime for Admin SDK
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../src/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';
import { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase-admin/firestore';

interface SupportTicket {
  id: string;
  createdBy?: string;
  userRole?: string;
  category?: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  createdAt?: any;
  updatedAt?: any;
  resolvedAt?: any;
}

interface TeamLeadApplication {
  id: string;
  phone?: string;
  fullName?: string;
  email?: string;
  serviceUsed?: string;
  appliedAt?: any;
  status?: string;
}

interface Manager {
  id: string;
  phone?: string;
  name?: string;
  email?: string;
  status?: string;
  approvedBy?: string;
  approvedAt?: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const userPhone = searchParams.get('userPhone');
    const userRole = searchParams.get('userRole');
    const status = searchParams.get('status');

    // SUB-MODE 1A: Get support tickets
    if (!type || type === 'tickets') {
      if (!userPhone || !userRole) {
        return NextResponse.json({ 
          error: 'User phone and role are required' 
        }, { status: 400 });
      }

      // Use 'any' type to avoid TypeScript query assignment issues
      let query: any = db.collection('supportTickets');

      // Filter based on user role
      if (userRole === 'user' || userRole === 'worker') {
        query = query.where('createdBy', '==', userPhone);
      } else if (userRole === 'admin') {
        // Admin sees all tickets - no filter needed
      } else if (userRole === 'manager') {
        // Managers see tickets from their agents
        const agentsSnapshot: QuerySnapshot = await db.collection('workers')
          .where('managerPhone', '==', userPhone)
          .get();
        
        const agentPhones: string[] = [];
        agentsSnapshot.forEach((doc: DocumentSnapshot) => {
          agentPhones.push(doc.id);
        });

        if (agentPhones.length > 0) {
          query = query.where('createdBy', 'in', agentPhones);
        } else {
          return NextResponse.json({
            success: true,
            type: 'tickets',
            count: 0,
            tickets: []
          });
        }
      }

      // Filter by status if provided
      if (status) {
        query = query.where('status', '==', status);
      }

      const snapshot: QuerySnapshot = await query.orderBy('createdAt', 'desc').get();
      const tickets: any[] = [];
      
      snapshot.forEach((doc: DocumentSnapshot) => {
        const data = doc.data();
        tickets.push({
          id: doc.id,
          ...data,
          createdAt: data?.createdAt?.toDate?.()?.toISOString() || data?.createdAt,
          updatedAt: data?.updatedAt?.toDate?.()?.toISOString() || data?.updatedAt,
          resolvedAt: data?.resolvedAt?.toDate?.()?.toISOString() || data?.resolvedAt
        });
      });
      
      return NextResponse.json({
        success: true,
        type: 'tickets',
        count: tickets.length,
        tickets
      });
    }

    // SUB-MODE 1B: Get pending team lead applications (ADMIN ONLY)
    if (type === 'pendingTeamLeads') {
      if (!userPhone || userRole !== 'admin') {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
      }

      const snapshot: QuerySnapshot = await db.collection('teamLeadApplications')
        .where('status', '==', 'pending')
        .orderBy('appliedAt', 'desc')
        .get();
      
      const applications: any[] = [];
      
      snapshot.forEach((doc: DocumentSnapshot) => {
        const data = doc.data();
        applications.push({
          id: doc.id,
          phone: data?.phone,
          fullName: data?.fullName,
          email: data?.email,
          serviceUsed: data?.serviceUsed,
          appliedAt: data?.appliedAt?.toDate?.()?.toISOString() || data?.appliedAt
        });
      });
      
      return NextResponse.json({
        success: true,
        type: 'pendingTeamLeads',
        count: applications.length,
        applications
      });
    }

    // SUB-MODE 1C: Get support categories
    if (type === 'categories') {
      const categories = [
        { id: 'technical', name: 'Technical Issue', description: 'App or website problems' },
        { id: 'payment', name: 'Payment Issue', description: 'Problems with payments or withdrawals' },
        { id: 'service', name: 'Service Issue', description: 'Problems with service delivery' },
        { id: 'agent', name: 'Agent Support', description: 'Help with agent tasks or commissions' },
        { id: 'account', name: 'Account Issue', description: 'Problems with account access' },
        { id: 'suggestion', name: 'Suggestion', description: 'Feature requests or improvements' },
        { id: 'other', name: 'Other', description: 'Any other issues' }
      ];

      return NextResponse.json({
        success: true,
        type: 'categories',
        categories
      });
    }

    // SUB-MODE 1D: Check if user can apply for team lead
    if (type === 'checkTeamLeadEligibility') {
      if (!userPhone) {
        return NextResponse.json({ error: 'User phone is required' }, { status: 400 });
      }

      // Check if user has completed KRA service
      const [kraPinDoc, kraReturnsDoc]: [QuerySnapshot, QuerySnapshot] = await Promise.all([
        db.collection('tasks')
          .where('customerPhone', '==', userPhone)
          .where('title', '>=', 'KRA PIN')
          .where('title', '<=', 'KRA PIN' + '\uf8ff')
          .where('status', '==', 'completed')
          .limit(1)
          .get(),
        db.collection('tasks')
          .where('customerPhone', '==', userPhone)
          .where('title', '>=', 'KRA Returns')
          .where('title', '<=', 'KRA Returns' + '\uf8ff')
          .where('status', '==', 'completed')
          .limit(1)
          .get()
      ]);

      const hasCompletedKraService = !kraPinDoc.empty || !kraReturnsDoc.empty;
      
      // Check if already applied
      const existingAppSnapshot: QuerySnapshot = await db.collection('teamLeadApplications')
        .where('phone', '==', userPhone)
        .limit(1)
        .get();
      
      const hasApplied = !existingAppSnapshot.empty;
      let currentStatus = null;
      
      existingAppSnapshot.forEach((doc: DocumentSnapshot) => {
        const data = doc.data();
        currentStatus = data?.status || null;
      });

      // Check if already a manager
      const managerDoc: DocumentSnapshot = await db.collection('managers').doc(userPhone).get();
      const isAlreadyManager = managerDoc.exists;

      return NextResponse.json({
        success: true,
        type: 'eligibility',
        userPhone,
        canApply: hasCompletedKraService && !hasApplied && !isAlreadyManager,
        hasCompletedKraService,
        hasApplied,
        currentStatus,
        isAlreadyManager,
        message: hasCompletedKraService 
          ? (!hasApplied && !isAlreadyManager ? 'Eligible to apply' : 'Already applied or is manager')
          : 'Complete a KRA service first'
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

    // SUB-MODE 2A: Create support ticket
    if (action === 'createTicket') {
      const { category, title, description, priority = 'medium' } = data;

      if (!category || !title || !description) {
        return NextResponse.json({ error: 'Category, title, and description are required' }, { status: 400 });
      }

      const ticketRef = db.collection('supportTickets').doc();
      const ticketId = `TICKET${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const ticketData = {
        id: ticketId,
        ticketRef: ticketRef.id,
        createdBy: userPhone,
        userRole,
        category,
        title,
        description,
        priority,
        status: 'open',
        whatsappContact: `https://wa.me/254712345678?text=Support Ticket: ${ticketId} - ${title}`,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await ticketRef.set(ticketData);

      return NextResponse.json({
        success: true,
        message: 'Support ticket created successfully',
        ticketId,
        ticket: ticketData,
        nextStep: 'Contact support via WhatsApp link provided'
      });
    }

    // SUB-MODE 2B: Submit team lead application
    if (action === 'submitTeamLeadApplication') {
      const { 
        fullName, 
        email, 
        serviceUsed,
        hasComputer = false,
        hasSmartphone = false,
        internetQuality = 'basic',
        availableHours = '5-10',
        agreedTerms = false
      } = data;

      // Validate required fields
      if (!fullName || !email || !serviceUsed) {
        return NextResponse.json({ error: 'Full name, email, and service used are required' }, { status: 400 });
      }

      if (!agreedTerms) {
        return NextResponse.json({ error: 'You must agree to the terms' }, { status: 400 });
      }

      // Check eligibility: must have completed KRA service
      const [kraPinDoc, kraReturnsDoc]: [QuerySnapshot, QuerySnapshot] = await Promise.all([
        db.collection('tasks')
          .where('customerPhone', '==', userPhone)
          .where('title', '>=', 'KRA PIN')
          .where('title', '<=', 'KRA PIN' + '\uf8ff')
          .where('status', '==', 'completed')
          .limit(1)
          .get(),
        db.collection('tasks')
          .where('customerPhone', '==', userPhone)
          .where('title', '>=', 'KRA Returns')
          .where('title', '<=', 'KRA Returns' + '\uf8ff')
          .where('status', '==', 'completed')
          .limit(1)
          .get()
      ]);

      const hasCompletedKraService = !kraPinDoc.empty || !kraReturnsDoc.empty;
      
      if (!hasCompletedKraService) {
        return NextResponse.json({ 
          error: 'You must complete a KRA PIN or KRA Returns service first',
          requiredAction: 'Complete a KRA service from our services page'
        }, { status: 400 });
      }

      // Check if already applied
      const existingAppSnapshot: QuerySnapshot = await db.collection('teamLeadApplications')
        .where('phone', '==', userPhone)
        .limit(1)
        .get();
      
      if (!existingAppSnapshot.empty) {
        return NextResponse.json({ error: 'You have already applied for Team Lead' }, { status: 400 });
      }

      // Check if already a manager
      const managerDoc: DocumentSnapshot = await db.collection('managers').doc(userPhone).get();
      if (managerDoc.exists) {
        return NextResponse.json({ error: 'You are already a manager' }, { status: 400 });
      }

      // Create application
      const applicationRef = db.collection('teamLeadApplications').doc();
      const applicationId = `TEAMLEAD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      const applicationData = {
        id: applicationId,
        applicationRef: applicationRef.id,
        phone: userPhone,
        userRole,
        fullName,
        email,
        serviceUsed,
        hasComputer,
        hasSmartphone,
        internetQuality,
        availableHours,
        agreedTerms,
        status: 'pending',
        appliedAt: FieldValue.serverTimestamp()
      };

      await applicationRef.set(applicationData);

      return NextResponse.json({
        success: true,
        message: 'Team Lead application submitted successfully',
        applicationId,
        application: applicationData,
        nextSteps: 'Your application is pending review. You will be notified via email.',
        note: 'Admin will review your application within 48 hours'
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
    const adminDoc: DocumentSnapshot = await db.collection('admins').doc(adminPhone).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    // SUB-MODE 3A: Update ticket status
    if (action === 'updateTicket') {
      const { ticketId, status, resolution, notes } = data;

      if (!ticketId || !status) {
        return NextResponse.json({ error: 'Ticket ID and status are required' }, { status: 400 });
      }

      const ticketRef = db.collection('supportTickets').doc(ticketId);
      const ticketDoc: DocumentSnapshot = await ticketRef.get();

      if (!ticketDoc.exists) {
        return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
      }

      const updateData: any = {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        resolvedBy: adminPhone
      };

      if (status === 'resolved') {
        updateData.resolvedAt = FieldValue.serverTimestamp();
      }

      if (resolution) {
        updateData.resolution = resolution;
      }

      if (notes) {
        updateData.adminNotes = notes;
      }

      await ticketRef.update(updateData);

      return NextResponse.json({
        success: true,
        message: `Ticket ${status} successfully`,
        ticketId,
        updates: updateData
      });
    }

    // SUB-MODE 3B: Process team lead application
    if (action === 'processTeamLeadApplication') {
      const { applicationId, status, reason } = data;

      if (!applicationId || !status) {
        return NextResponse.json({ error: 'Application ID and status are required' }, { status: 400 });
      }

      if (status !== 'approved' && status !== 'rejected') {
        return NextResponse.json({ error: 'Status must be "approved" or "rejected"' }, { status: 400 });
      }

      const applicationRef = db.collection('teamLeadApplications').doc(applicationId);
      const applicationDoc: DocumentSnapshot = await applicationRef.get();

      if (!applicationDoc.exists) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }

      const applicationData = applicationDoc.data();

      // Update application status
      const updateData: any = {
        status,
        reviewedBy: adminPhone,
        reviewedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      if (reason) {
        updateData.reason = reason;
      }

      await applicationRef.update(updateData);

      // If approved, create manager record
      if (status === 'approved') {
        const managerData = {
          phone: applicationData?.phone || '',
          name: applicationData?.fullName || '',
          email: applicationData?.email || '',
          status: 'active',
          approvedBy: adminPhone,
          approvedAt: FieldValue.serverTimestamp(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
          maxAgents: 20,
          currentAgents: 0,
          commissionRate: 0.10
        };

        await db.collection('managers').doc(applicationData?.phone || '').set(managerData);

        updateData.managerCreated = true;
        updateData.managerData = managerData;
      }

      return NextResponse.json({
        success: true,
        message: `Team Lead application ${status} successfully`,
        applicationId,
        applicantPhone: applicationData?.phone,
        applicantName: applicationData?.fullName,
        updates: updateData,
        emailSent: false,
        note: 'Email notification would be sent in production'
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