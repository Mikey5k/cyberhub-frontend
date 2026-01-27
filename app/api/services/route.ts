// Force Node runtime for fetch API
export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error('Missing Firebase environment variables');
}

// Helper function to call Firestore REST API
async function firestoreFetch(endpoint: string, method: string = 'GET', data?: any) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents${endpoint}?key=${API_KEY}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore REST error (${response.status}):`, errorText);
    throw new Error(`Firestore error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// Helper to transform Firestore document
function transformDocument(doc: any) {
  if (!doc || !doc.fields) return null;
  
  const docId = doc.name.split('/').pop();
  const fields = doc.fields;
  const result: any = { id: docId };
  
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (field.stringValue !== undefined) {
      result[key] = field.stringValue;
    } else if (field.integerValue !== undefined) {
      result[key] = parseInt(field.integerValue, 10);
    } else if (field.doubleValue !== undefined) {
      result[key] = parseFloat(field.doubleValue);
    } else if (field.booleanValue !== undefined) {
      result[key] = field.booleanValue;
    } else if (field.arrayValue?.values) {
      result[key] = field.arrayValue.values.map((item: any) => {
        if (item.stringValue !== undefined) return item.stringValue;
        return item;
      });
    } else if (field.timestampValue !== undefined) {
      result[key] = field.timestampValue;
    }
  });
  
  return result;
}

// Check for duplicate services
async function checkForDuplicates(serviceData: any, currentServiceId?: string): Promise<string[]> {
  try {
    const allServices = await firestoreFetch('/services');
    const duplicates: string[] = [];
    
    if (!allServices.documents) return duplicates;
    
    const newTitle = serviceData.fields?.name?.stringValue?.toLowerCase() || '';
    const newCategory = serviceData.fields?.category?.stringValue || '';
    
    allServices.documents.forEach((doc: any) => {
      const serviceId = doc.name.split('/').pop();
      // Skip current service if updating
      if (currentServiceId && serviceId === currentServiceId) return;
      
      const service = transformDocument(doc);
      if (!service) return;
      
      const existingTitle = (service.name || '').toLowerCase();
      const existingCategory = service.category || '';
      
      // Check for exact match
      if (existingTitle === newTitle && existingCategory === newCategory) {
        duplicates.push(serviceId);
      }
      // Check for similar titles (fuzzy match)
      else if (existingCategory === newCategory) {
        const similarity = calculateSimilarity(existingTitle, newTitle);
        if (similarity > 0.8) { // 80% similar
          duplicates.push(serviceId);
        }
      }
    });
    
    return duplicates;
  } catch (error) {
    console.error('Duplicate check error:', error);
    return [];
  }
}

// Simple string similarity (Levenshtein distance based)
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }
  
  return matrix[b.length][a.length];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const phone = searchParams.get('phone');
    const role = searchParams.get('role'); // For role-based filtering

    // Get all services
    if (!type || type === 'services') {
      let endpoint = '/services';
      const result = await firestoreFetch(endpoint);
      
      const services: any[] = [];
      
      if (result.documents) {
        result.documents.forEach((doc: any) => {
          const service = transformDocument(doc);
          if (!service) return;
          
          // Role-based filtering
          let include = true;
          
          // Admin sees all, manager sees only approved/their own pending
          if (role === 'admin') {
            // Admin sees everything
          } else if (role === 'manager') {
            // Manager sees approved services OR their own pending services
            if (service.status === 'pending_approval' && service.createdBy !== phone) {
              include = false;
            }
          } else {
            // Regular users see only approved services
            if (service.status !== 'approved' && service.status !== 'active') {
              include = false;
            }
          }
          
          // Additional filters
          if (include && status && service.status !== status) include = false;
          if (include && category && service.category !== category) include = false;
          
          if (include) {
            services.push(service);
          }
        });
      }
      
      // Sort by createdAt if available (descending)
      services.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
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
    console.error('Firestore REST error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, role, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
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

      // Determine status based on role
      let status = 'active';
      if (role === 'manager') {
        status = 'pending_approval'; // Managers need admin approval
      }

      // Create Firestore document data
      const serviceData = {
        fields: {
          name: { stringValue: name },
          description: { stringValue: description },
          category: { stringValue: category },
          price: { integerValue: price.toString() },
          requirements: { 
            arrayValue: { 
              values: requirements.map((req: string) => ({ stringValue: req }))
            }
          },
          deliveryTime: { stringValue: deliveryTime },
          popular: { booleanValue: popular },
          status: { stringValue: status },
          createdBy: { stringValue: phone },
          createdAt: { timestampValue: new Date().toISOString() },
          updatedAt: { timestampValue: new Date().toISOString() }
        }
      };

      // Check for duplicates
      const duplicateIds = await checkForDuplicates(serviceData);
      
      // Generate a new document ID
      const serviceId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const endpoint = `/services/${serviceId}`;
      
      const result = await firestoreFetch(endpoint, 'PATCH', serviceData);

      return NextResponse.json({
        success: true,
        message: status === 'pending_approval' 
          ? 'Service submitted for admin approval' 
          : 'Service added successfully',
        serviceId,
        status,
        duplicates: duplicateIds.length > 0 ? duplicateIds : undefined,
        duplicateWarning: duplicateIds.length > 0 
          ? `Found ${duplicateIds.length} similar service(s). Admin will review.`
          : undefined,
        service: {
          id: serviceId,
          name,
          description,
          category,
          price,
          requirements,
          deliveryTime,
          popular,
          status,
          createdBy: phone,
          createdAt: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Firestore REST error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, phone, role, serviceId, ...data } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    if (!serviceId) {
      return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Only admin can approve/reject services
    if (role !== 'admin') {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'Only admin can approve/reject services'
      }, { status: 403 });
    }

    // Get current service
    const endpoint = `/services/${serviceId}`;
    const currentService = await firestoreFetch(endpoint);
    
    if (!currentService || !currentService.fields) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const currentStatus = currentService.fields.status?.stringValue;
    
    // Approve service
    if (action === 'approveService') {
      if (currentStatus !== 'pending_approval') {
        return NextResponse.json({ 
          error: 'Invalid action',
          message: 'Only pending services can be approved'
        }, { status: 400 });
      }

      // Check for duplicates before approving
      const duplicateIds = await checkForDuplicates(currentService, serviceId);
      
      const updateData = {
        fields: {
          ...currentService.fields,
          status: { stringValue: 'approved' },
          approvedBy: { stringValue: phone },
          approvedAt: { timestampValue: new Date().toISOString() },
          updatedAt: { timestampValue: new Date().toISOString() }
        }
      };

      await firestoreFetch(endpoint, 'PATCH', updateData);

      return NextResponse.json({
        success: true,
        message: 'Service approved successfully',
        serviceId,
        duplicates: duplicateIds.length > 0 ? duplicateIds : undefined,
        duplicateWarning: duplicateIds.length > 0 
          ? `Approved despite ${duplicateIds.length} similar service(s).`
          : undefined,
        service: {
          id: serviceId,
          status: 'approved',
          approvedBy: phone,
          approvedAt: new Date().toISOString()
        }
      });
    }

    // Reject service
    if (action === 'rejectService') {
      if (currentStatus !== 'pending_approval') {
        return NextResponse.json({ 
          error: 'Invalid action',
          message: 'Only pending services can be rejected'
        }, { status: 400 });
      }

      const { reason = 'No reason provided' } = data;
      
      const updateData = {
        fields: {
          ...currentService.fields,
          status: { stringValue: 'rejected' },
          rejectedBy: { stringValue: phone },
          rejectedAt: { timestampValue: new Date().toISOString() },
          rejectionReason: { stringValue: reason },
          updatedAt: { timestampValue: new Date().toISOString() }
        }
      };

      await firestoreFetch(endpoint, 'PATCH', updateData);

      return NextResponse.json({
        success: true,
        message: 'Service rejected successfully',
        serviceId,
        reason,
        service: {
          id: serviceId,
          status: 'rejected',
          rejectedBy: phone,
          rejectedAt: new Date().toISOString(),
          rejectionReason: reason
        }
      });
    }

    // Update service (admin or manager who created it)
    if (action === 'updateService') {
      const updateData: any = { fields: { ...currentService.fields } };
      const updatedFields: string[] = [];
      
      // Check permissions
      const createdBy = currentService.fields.createdBy?.stringValue;
      if (role !== 'admin' && createdBy !== phone) {
        return NextResponse.json({ 
          error: 'Unauthorized',
          message: 'Only admin or service creator can update'
        }, { status: 403 });
      }

      // Update allowed fields
      if (data.name !== undefined) {
        updateData.fields.name = { stringValue: data.name };
        updatedFields.push('name');
      }
      if (data.description !== undefined) {
        updateData.fields.description = { stringValue: data.description };
        updatedFields.push('description');
      }
      if (data.price !== undefined) {
        updateData.fields.price = { integerValue: data.price.toString() };
        updatedFields.push('price');
      }
      if (data.category !== undefined) {
        updateData.fields.category = { stringValue: data.category };
        updatedFields.push('category');
      }
      if (data.requirements !== undefined) {
        updateData.fields.requirements = { 
          arrayValue: { 
            values: data.requirements.map((req: string) => ({ stringValue: req }))
          }
        };
        updatedFields.push('requirements');
      }

      // If manager updates, needs re-approval
      if (role === 'manager' && currentStatus === 'approved') {
        updateData.fields.status = { stringValue: 'pending_approval' };
        updatedFields.push('status');
      }

      updateData.fields.updatedAt = { timestampValue: new Date().toISOString() };
      
      // Check for duplicates if name/category changed
      if (data.name || data.category) {
        const duplicateIds = await checkForDuplicates(updateData, serviceId);
        if (duplicateIds.length > 0) {
          updateData.fields.duplicateWarning = { 
            stringValue: `Found ${duplicateIds.length} similar service(s)` 
          };
        }
      }

      await firestoreFetch(endpoint, 'PATCH', updateData);

      return NextResponse.json({
        success: true,
        message: 'Service updated successfully',
        serviceId,
        updatedFields,
        status: updateData.fields.status?.stringValue || currentStatus,
        service: {
          id: serviceId,
          updatedAt: new Date().toISOString()
        }
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Firestore REST error:', error);
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message
    }, { status: 500 });
  }
}