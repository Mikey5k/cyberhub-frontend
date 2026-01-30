import { NextRequest, NextResponse } from 'next/server';

export const runtime = "nodejs";

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

  // Add API key as query parameter
  const finalUrl = `${url}?key=${apiKey}`;
  const response = await fetch(finalUrl, options);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Firestore API error (${response.status}):`, errorText);
    throw new Error(`Firestore request failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

// Convert Firestore document to plain object
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
    else if (field.arrayValue?.values) {
      result[key] = field.arrayValue.values.map((val: any) =>
        val.stringValue !== undefined ? val.stringValue :
        val.integerValue !== undefined ? Number(val.integerValue) :
        val.doubleValue !== undefined ? Number(val.doubleValue) :
        val
      );
    } else if (field.mapValue?.fields) {
      // Handle nested objects
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

// Convert object to Firestore fields format
function convertToFirestoreFields(data: any): any {
  const fields: any = {};

  Object.keys(data).forEach(key => {
    const value = data[key];

    if (value === null || value === undefined) {
      // Skip null/undefined values
      return;
    }

    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        fields[key] = { integerValue: value.toString() };
      } else {
        fields[key] = { doubleValue: value };
      }
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') {
              if (Number.isInteger(item)) return { integerValue: item.toString() };
              return { doubleValue: item };
            }
            if (typeof item === 'boolean') return { booleanValue: item };
            if (typeof item === 'object' && item !== null && item.id !== undefined) {
              // Handle transaction objects with id field
              return { mapValue: { fields: convertToFirestoreFields(item) } };
            }
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof value === 'object' && value !== null) {
      if (value instanceof Date) {
        fields[key] = { timestampValue: value.toISOString() };
      } else {
        // Convert nested object (like transaction objects)
        fields[key] = { mapValue: { fields: convertToFirestoreFields(value) } };
      }
    }
  });

  return fields;
}

// GET user(s)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');
    const referredBy = searchParams.get('referredBy');
    const getAll = searchParams.get('getAll');
    const adminKey = searchParams.get('adminKey');

    // Get all users (admin only)
    if (getAll === 'true') {
      if (adminKey !== process.env.ADMIN_SECRET) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const response = await firestoreRequest('/users');
      const users = response.documents?.map(convertFirestoreDoc) || [];
      
      return NextResponse.json({
        success: true,
        data: users,
        count: users.length
      });
    }

    // Get single user by ID
    if (id) {
      try {
        const response = await firestoreRequest(`/users/${id.trim()}`);
        const user = convertFirestoreDoc(response);
        return NextResponse.json({ success: true, user });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Get user by phone
    if (phone) {
      // Firestore doesn't support querying by phone directly via REST API
      // We need to get all users and filter in memory
      const response = await firestoreRequest('/users');
      const users = response.documents?.map(convertFirestoreDoc) || [];
      const user = users.find(u => u.phone === phone);
      
      if (user) {
        return NextResponse.json({ success: true, user });
      } else {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }

    // Get users by referredBy
    if (referredBy) {
      const response = await firestoreRequest('/users');
      const users = response.documents?.map(convertFirestoreDoc) || [];
      const referredUsers = users.filter(u => u.referredBy === referredBy);
      
      return NextResponse.json({
        success: true,
        data: referredUsers,
        count: referredUsers.length
      });
    }

    // If no parameters, require email for lookup
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email, ID, phone, or referredBy parameter required. Use getAll=true&adminKey=veritas-admin-2024 for all users.' },
        { status: 400 }
      );
    }

    // Get user by email (original logic)
    const response = await firestoreRequest('/users');
    const users = response.documents?.map(convertFirestoreDoc) || [];
    const user = users.find(u => u.email === email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error('Error in GET handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user (signup) - FIXED REFERRAL BUG
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, phone, password, referralCode, role } = body;

    if (!email || !name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Email, name, and phone are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const response = await firestoreRequest('/users');
    const users = response.documents?.map(convertFirestoreDoc) || [];
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User already exists' },
        { status: 400 }
      );
    }

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Find referrer if referral code provided - FIXED BUG
    let referredBy = '';
    if (referralCode) {
      const referrer = users.find(u => u.referralCode === referralCode);
      if (referrer) {
        referredBy = referrer.id; // Set to referrer's ID, not empty string
        console.log(`Referral found: ${referrer.name} (${referrer.id}) referred new user ${name}`);
        
        // Update referrer's team size
        try {
          const referrerUpdate = {
            ...referrer,
            teamSize: (referrer.teamSize || 0) + 1,
            updatedAt: new Date().toISOString(),
            lastActive: new Date().toISOString()
          };
          delete referrerUpdate.id;
          delete referrerUpdate.name;
          delete referrerUpdate.fields;
          
          await firestoreRequest(`/users/${referrer.id}`, 'PATCH', {
            fields: convertToFirestoreFields(referrerUpdate)
          });
          console.log(`Updated referrer ${referrer.id} team size to ${referrerUpdate.teamSize}`);
        } catch (error) {
          console.error('Error updating referrer team size:', error);
        }
      } else {
        console.log(`Referral code ${referralCode} not found`);
      }
    }

    // Generate NEW referral code for this user - FIXED BUG (was using referrer's code)
    const userReferralCode = `USER${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create user data - FIXED: Use userReferralCode, not referralCode
    const userData: any = {
      email,
      name,
      phone,
      role: role || 'user',
      status: 'active',
      balance: 0,
      totalEarnings: 0,
      referredBy, // This is now correctly set to referrer's ID or empty string
      referralCode: userReferralCode, // User gets their OWN referral code
      joinDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      transactions: [],
      withdrawalRequests: []
    };

    // Add password only if provided (for non-OAuth users)
    if (password) {
      // In production, you should hash the password!
      userData.password = password;
    }

    const firestoreData = {
      fields: convertToFirestoreFields(userData)
    };

    await firestoreRequest(`/users/${userId}`, 'PATCH', firestoreData);

    console.log(`Created user ${userId} with referredBy: ${referredBy || 'none'}, referralCode: ${userReferralCode}`);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId,
      user: {
        id: userId,
        ...userData
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user (FIXED to properly merge all fields)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists and get current data
    let existingData: any = {};
    try {
      const existingUser = await firestoreRequest(`/users/${id.trim()}`);
      existingData = convertFirestoreDoc(existingUser);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create update object starting with existing data
    const updateData = { ...existingData };

    // Update all fields from body (overwrite existing ones)
    Object.keys(body).forEach(key => {
      if (key !== 'id' && key !== 'name' && key !== 'fields') { // Don't overwrite internal fields
        const value = body[key];
        
        // Handle special field conversions
        if (key === 'balance' || key === 'totalEarnings' || key === 'teamSize') {
          updateData[key] = Number(value) || 0;
        } else if (key === 'transactions' || key === 'withdrawalRequests') {
          // Preserve array structure
          updateData[key] = Array.isArray(value) ? value : [];
        } else if (value !== null && value !== undefined) {
          updateData[key] = value;
        }
      }
    });

    // Always update timestamps
    updateData.updatedAt = new Date().toISOString();
    updateData.lastActive = new Date().toISOString();

    // Remove Firestore internal fields before saving
    const saveData = { ...updateData };
    delete saveData.id;
    delete saveData.fields;

    const firestoreData = {
      fields: convertToFirestoreFields(saveData)
    };

    await firestoreRequest(`/users/${id.trim()}`, 'PATCH', firestoreData);

    console.log(`Updated user ${id} with referredBy: ${saveData.referredBy || 'not set'}`);

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Remove user (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const adminKey = searchParams.get('adminKey');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (adminKey !== process.env.ADMIN_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user exists
    try {
      await firestoreRequest(`/users/${id}`);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user
    await firestoreRequest(`/users/${id}`, 'DELETE');

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Partial update (for login, balance updates, etc.)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, amount, type, userId } = body;

    // Handle login
    if (email && password) {
      const response = await firestoreRequest('/users');
      const users = response.documents?.map(convertFirestoreDoc) || [];
      const user = users.find(u => u.email === email && u.password === password);

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Update last active
      const updateData = {
        ...user,
        lastActive: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      delete updateData.id;
      delete updateData.fields;

      await firestoreRequest(`/users/${user.id}`, 'PATCH', {
        fields: convertToFirestoreFields(updateData)
      });

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          balance: user.balance,
          referralCode: user.referralCode,
          referredBy: user.referredBy
        }
      });
    }

    // Handle balance update (for transactions)
    if (userId && amount !== undefined && type) {
      try {
        const userResponse = await firestoreRequest(`/users/${userId}`);
        const userData = convertFirestoreDoc(userResponse);
        
        const transaction = {
          id: `tx_${Date.now()}`,
          amount: Number(amount),
          type,
          date: new Date().toISOString()
        };

        const transactions = [...(userData.transactions || []), transaction];
        
        const updateData = {
          ...userData,
          balance: (userData.balance || 0) + Number(amount),
          totalEarnings: type === 'earning' ? (userData.totalEarnings || 0) + Number(amount) : (userData.totalEarnings || 0),
          transactions,
          updatedAt: new Date().toISOString(),
          lastActive: new Date().toISOString()
        };

        delete updateData.id;
        delete updateData.fields;

        await firestoreRequest(`/users/${userId}`, 'PATCH', {
          fields: convertToFirestoreFields(updateData)
        });

        return NextResponse.json({
          success: true,
          message: 'Balance updated successfully',
          newBalance: updateData.balance
        });
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in PATCH handler:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}