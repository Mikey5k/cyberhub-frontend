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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const phone = searchParams.get('phone');

    // Get all services
    if (!type || type === 'services') {
      // Base endpoint
      let endpoint = '/services';
      
      // Note: Firestore REST API doesn't support complex queries like Admin SDK
      // For simplicity, we'll get all and filter client-side for now
      const result = await firestoreFetch(endpoint);
      
      // Transform Firestore REST response to our format
      const services: any[] = [];
      
      if (result.documents) {
        result.documents.forEach((doc: any) => {
          const serviceId = doc.name.split('/').pop();
          const fields = doc.fields || {};
          
          // Convert Firestore fields to regular object
          const service: any = { id: serviceId };
          
          Object.keys(fields).forEach(key => {
            const field = fields[key];
            // Extract value based on field type
            if (field.stringValue !== undefined) {
              service[key] = field.stringValue;
            } else if (field.integerValue !== undefined) {
              service[key] = parseInt(field.integerValue, 10);
            } else if (field.doubleValue !== undefined) {
              service[key] = parseFloat(field.doubleValue);
            } else if (field.booleanValue !== undefined) {
              service[key] = field.booleanValue;
            } else if (field.arrayValue?.values) {
              service[key] = field.arrayValue.values.map((item: any) => {
                if (item.stringValue !== undefined) return item.stringValue;
                return item;
              });
            } else if (field.timestampValue !== undefined) {
              service[key] = field.timestampValue;
            }
          });
          
          // Apply filters if provided
          let include = true;
          if (status && service.status !== status) include = false;
          if (category && service.category !== category) include = false;
          
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
    const { action, phone, ...data } = body;

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
          status: { stringValue: 'active' },
          createdBy: { stringValue: phone },
          createdAt: { timestampValue: new Date().toISOString() },
          updatedAt: { timestampValue: new Date().toISOString() }
        }
      };

      // Generate a new document ID
      const serviceId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const endpoint = `/services/${serviceId}`;
      
      const result = await firestoreFetch(endpoint, 'PATCH', serviceData);

      return NextResponse.json({
        success: true,
        message: 'Service added successfully',
        serviceId,
        service: {
          id: serviceId,
          name,
          description,
          category,
          price,
          requirements,
          deliveryTime,
          popular,
          status: 'active',
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