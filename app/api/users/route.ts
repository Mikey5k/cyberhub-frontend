import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type User = {
  id: string;
  phone: string;
  role: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  [key: string]: any;
};

// Firestore REST API helper (same as tasks API)
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

  const response = await fetch(`${url}?key=${apiKey}`, options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Firestore request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get('phone');

    if (!phone) {
      return NextResponse.json({ 
        success: false, 
        error: 'Phone number is required' 
      }, { status: 400 });
    }

    // Normalize phone
    let searchPhone = decodeURIComponent(phone);
    if (searchPhone.startsWith(' ')) {
      searchPhone = '+' + searchPhone.substring(1);
    }
    
    // Clean phone for document ID (Firestore doesn't allow + in doc IDs)
    const docId = searchPhone.replace(/\+/g, '_plus_');

    console.log('GET User lookup - Phone:', { original: phone, normalized: searchPhone, docId });

    // Try to get user from users collection
    try {
      const result = await firestoreRequest(`/users/${docId}`);
      
      if (result && result.fields) {
        const userData = {
          id: docId,
          phone: searchPhone,
          ...Object.fromEntries(
            Object.entries(result.fields).map(([key, value]: [string, any]) => [
              key,
              value.stringValue || value.integerValue || value.doubleValue || 
              value.booleanValue || value.timestampValue || value.arrayValue || 
              value.mapValue || value.nullValue || value
            ])
          )
        };

        return NextResponse.json({
          success: true,
          user: userData
        });
      }
    } catch (error: any) {
      // User not found in users collection
      console.log('User not found in main collection, trying role collections:', error.message);
    }

    // If not found in users, try role collections
    const roleCollections = ['clients', 'workers', 'admins', 'managers'];
    for (const collection of roleCollections) {
      try {
        const result = await firestoreRequest(`/${collection}/${docId}`);
        
        if (result && result.fields) {
          const userData = {
            id: docId,
            phone: searchPhone,
            ...Object.fromEntries(
              Object.entries(result.fields).map(([key, value]: [string, any]) => [
                key,
                value.stringValue || value.integerValue || value.doubleValue || 
                value.booleanValue || value.timestampValue || value.arrayValue || 
                value.mapValue || value.nullValue || value
              ])
            )
          };

          return NextResponse.json({
            success: true,
            user: userData
          });
        }
      } catch (error) {
        // Continue to next collection
        continue;
      }
    }

    // User not found
    return NextResponse.json({
      success: false,
      error: 'User not found',
      phone: searchPhone
    }, { status: 404 });

  } catch (error: any) {
    console.error('Users API GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, role, name = '' } = body;

    if (!phone || !role) {
      return NextResponse.json({ 
        success: false,
        error: 'Phone and role are required' 
      }, { status: 400 });
    }

    const normalizedPhone = phone.trim().replace(/\s+/g, '');
    // Clean phone for document ID
    const docId = normalizedPhone.replace(/\+/g, '_plus_');

    console.log('POST User creation - Phone:', normalizedPhone, 'Role:', role, 'DocID:', docId);

    // Determine primary collection based on role
    const primaryCollection = role.toLowerCase() === 'user' ? 'clients' :
                             role.toLowerCase() === 'worker' ? 'workers' :
                             role.toLowerCase() === 'agent' ? 'workers' :
                             role.toLowerCase() === 'manager' ? 'managers' : 'admins';

    const userData = {
      fields: {
        phone: { stringValue: normalizedPhone },
        role: { stringValue: role.toLowerCase() },
        name: { stringValue: name },
        createdAt: { timestampValue: new Date().toISOString() },
        updatedAt: { timestampValue: new Date().toISOString() },
        status: { stringValue: 'active' },
        primaryCollection: { stringValue: primaryCollection }
      }
    };

    // Store in main users collection
    await firestoreRequest(`/users/${docId}`, 'PATCH', {
      fields: userData.fields
    });

    // Also store in role-specific collection
    await firestoreRequest(`/${primaryCollection}/${docId}`, 'PATCH', {
      fields: userData.fields
    });

    const responseData = {
      id: docId,
      phone: normalizedPhone,
      role: role.toLowerCase(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      primaryCollection
    };

    return NextResponse.json({
      success: true,
      message: 'User created/updated successfully',
      user: responseData
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}