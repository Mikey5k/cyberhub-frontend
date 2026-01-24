// Force Node runtime for Admin SDK
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const phone = searchParams.get('phone');

    // Get all services
    if (!type || type === 'services') {
      let query: FirebaseFirestore.Query = db.collection('services');
      
      if (status) {
        query = query.where('status', '==', status);
      }
      
      if (category) {
        query = query.where('category', '==', category);
      }
      
      const snapshot = await query.orderBy('createdAt', 'desc').get();
      const services: any[] = [];
      
      snapshot.forEach(doc => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return NextResponse.json({
        success: true,
        type: 'services',
        count: services.length,
        services
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
    const { action, phone, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Check if user is admin
    const adminDoc = await db.collection('admins').doc(phone).get();
    if (!adminDoc.exists) {
      return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
    }

    // Add new service
    if (action === 'addService') {
      const { 
        name, 
        description, 
        category, 
        price, 
        requirements = [], 
        deliveryTime = '24-48 hours',
        popular = false 
      } = data;

      if (!name || !description || !category || price === undefined) {
        return NextResponse.json({ 
          error: 'Name, description, category, and price are required' 
        }, { status: 400 });
      }

      const serviceRef = db.collection('services').doc();
      
      const serviceData = {
        id: serviceRef.id,
        name,
        description,
        category,
        price: Number(price),
        requirements: Array.isArray(requirements) ? requirements : [requirements],
        deliveryTime,
        popular: Boolean(popular),
        status: 'active',
        createdBy: phone,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      };

      await serviceRef.set(serviceData);

      return NextResponse.json({
        success: true,
        message: 'Service added successfully',
        serviceId: serviceRef.id,
        service: serviceData
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
    const { action, phone, ...data } = body;
    
    // Logging for debugging
    console.log('PUT request received:', { action, phone, serviceId: data.serviceId });

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Check if user is admin or manager
    const [adminDoc, managerDoc] = await Promise.all([
      db.collection('admins').doc(phone).get(),
      db.collection('managers').doc(phone).get()
    ]);

    const isAdmin = adminDoc.exists;
    const isManager = managerDoc.exists;

    if (!isAdmin && !isManager) {
      return NextResponse.json({ error: 'Unauthorized: Admin or Manager only' }, { status: 403 });
    }

    // Update service
    if (action === 'updateService') {
      const { serviceId, status, archive = false, ...updateFields } = data;

      if (!serviceId) {
        return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
      }

      // Only admin can update services
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized: Admin only' }, { status: 403 });
      }

      const updateData: any = {
        updatedAt: FieldValue.serverTimestamp(),
        ...updateFields
      };

      if (status) {
        updateData.status = status;
      }

      if (archive) {
        updateData.archived = true;
        updateData.archivedAt = FieldValue.serverTimestamp();
        updateData.archivedBy = phone;
      }

      await db.collection('services').doc(serviceId).update(updateData);

      return NextResponse.json({
        success: true,
        message: `Service ${archive ? 'archived' : 'updated'} successfully`,
        serviceId,
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