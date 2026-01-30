import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

// Helper functions
function generateToken(userId: string, email: string, role: string) {
  const JWT_SECRET = process.env.JWT_SECRET || 'veritas-secret-key-change-in-production';
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Convert Firestore document to user object
function convertFirestoreUser(doc: any): any {
  const fields = doc.fields || {};
  const user: any = { id: doc.name.split('/').pop() };
  
  Object.keys(fields).forEach(key => {
    const field = fields[key];
    if (field.stringValue !== undefined) user[key] = field.stringValue;
    else if (field.integerValue !== undefined) user[key] = Number(field.integerValue);
    else if (field.doubleValue !== undefined) user[key] = Number(field.doubleValue);
    else if (field.booleanValue !== undefined) user[key] = field.booleanValue;
    else if (field.timestampValue !== undefined) user[key] = field.timestampValue;
    else if (field.arrayValue?.values) {
      user[key] = field.arrayValue.values.map((val: any) => {
        if (val.mapValue?.fields) {
          // Handle nested objects
          const nestedObj: any = {};
          Object.keys(val.mapValue.fields).forEach(nestedKey => {
            const nestedField = val.mapValue.fields[nestedKey];
            if (nestedField.stringValue !== undefined) nestedObj[nestedKey] = nestedField.stringValue;
            else if (nestedField.integerValue !== undefined) nestedObj[nestedKey] = Number(nestedField.integerValue);
            else if (nestedField.doubleValue !== undefined) nestedObj[nestedKey] = Number(nestedField.doubleValue);
            else if (nestedField.booleanValue !== undefined) nestedObj[nestedKey] = nestedField.booleanValue;
          });
          return nestedObj;
        } else if (val.stringValue !== undefined) {
          return val.stringValue;
        } else if (val.integerValue !== undefined) {
          return Number(val.integerValue);
        } else if (val.doubleValue !== undefined) {
          return Number(val.doubleValue);
        }
        return val;
      });
    }
  });
  
  // Ensure default values for admin dashboard
  if (!user.role) user.role = 'user';
  if (!user.status) user.status = 'active';
  if (user.balance === undefined) user.balance = 0;
  if (user.totalEarnings === undefined) user.totalEarnings = 0;
  if (!user.joinDate) user.joinDate = user.createdAt || new Date().toISOString();
  if (!user.transactions) user.transactions = [];
  if (!user.withdrawalRequests) user.withdrawalRequests = [];
  
  // Fix ID: remove leading/trailing spaces
  if (user.id) user.id = user.id.trim();
  
  return user;
}

// Convert user object to Firestore fields
function convertToFirestoreFields(data: any): any {
  const fields: any = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    
    if (value === null || value === undefined) {
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
            if (typeof item === 'object' && item !== null) {
              // Handle nested objects (transactions, withdrawal requests)
              const mapFields: any = {};
              Object.keys(item).forEach(itemKey => {
                const itemValue = item[itemKey];
                if (typeof itemValue === 'string') {
                  mapFields[itemKey] = { stringValue: itemValue };
                } else if (typeof itemValue === 'number') {
                  if (Number.isInteger(itemValue)) {
                    mapFields[itemKey] = { integerValue: itemValue.toString() };
                  } else {
                    mapFields[itemKey] = { doubleValue: itemValue };
                  }
                } else if (typeof itemValue === 'boolean') {
                  mapFields[itemKey] = { booleanValue: itemValue };
                }
              });
              return { mapValue: { fields: mapFields } };
            } else if (typeof item === 'string') {
              return { stringValue: item };
            } else if (typeof item === 'number') {
              if (Number.isInteger(item)) {
                return { integerValue: item.toString() };
              }
              return { doubleValue: item };
            }
            return { stringValue: String(item) };
          })
        }
      };
    }
  });
  
  return fields;
}

// GET - Get user by email, ID, referredBy, or get all users for admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const id = searchParams.get('id');
    const referredBy = searchParams.get('referredBy');
    const status = searchParams.get('status');
    const getAll = searchParams.get('getAll');
    const adminKey = searchParams.get('adminKey');
    const phone = searchParams.get('phone'); // Added phone parameter

    // ADMIN: Get all users (for admin dashboard)
    if (getAll === 'true' && adminKey === 'veritas-admin-2024') {
      try {
        const response = await firestoreRequest('/users');
        if (response && response.documents) {
          const allUsers = response.documents.map(convertFirestoreUser);

          // Apply filters if provided
          let filteredUsers = allUsers;
          
          if (referredBy) {
            filteredUsers = filteredUsers.filter((user: any) => 
              user.referredBy && user.referredBy.trim() === referredBy.trim()
            );
          }
          
          if (status) {
            filteredUsers = filteredUsers.filter((user: any) => 
              user.status && user.status.toLowerCase() === status.toLowerCase()
            );
          }

          // Remove password hashes and add default values
          const usersWithoutPasswords = filteredUsers.map((user: any) => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });

          return NextResponse.json({
            success: true,
            data: usersWithoutPasswords,
            count: usersWithoutPasswords.length
          });
        } else {
          return NextResponse.json({
            success: true,
            data: [],
            count: 0
          });
        }
      } catch (error) {
        console.error('Error fetching all users:', error);
        return NextResponse.json({
          success: true,
          data: [],
          count: 0,
          message: 'No users found or collection empty'
        });
      }
    }

    // Get users by referredBy (for manager dashboard)
    if (referredBy) {
      try {
        const response = await firestoreRequest('/users');
        if (response && response.documents) {
          const allUsers = response.documents.map(convertFirestoreUser);
          
          // Filter by referredBy (with trim to handle spaces)
          const referredUsers = allUsers.filter((user: any) => 
            user.referredBy && user.referredBy.trim() === referredBy.trim()
          );
          
          // Apply status filter if provided
          let filteredUsers = referredUsers;
          if (status) {
            filteredUsers = filteredUsers.filter((user: any) => 
              user.status && user.status.toLowerCase() === status.toLowerCase()
            );
          }

          // Remove password hashes
          const usersWithoutPasswords = filteredUsers.map((user: any) => {
            const { passwordHash, ...userWithoutPassword } = user;
            return userWithoutPassword;
          });

          return NextResponse.json({
            success: true,
            data: usersWithoutPasswords,
            count: usersWithoutPasswords.length
          });
        }
      } catch (error) {
        console.error('Error fetching users by referredBy:', error);
        return NextResponse.json({
          success: true,
          data: [],
          count: 0
        });
      }
    }

    // Get single user by ID, email, or phone
    if (!email && !id && !phone) {
      return NextResponse.json(
        { success: false, error: 'Email, ID, phone, or referredBy parameter required. Use getAll=true&adminKey=veritas-admin-2024 for all users.' },
        { status: 400 }
      );
    }

    let user: any = null;
    
    if (id) {
      // Get user by ID
      try {
        const response = await firestoreRequest(`/users/${id.trim()}`);
        if (response && response.fields) {
          user = convertFirestoreUser(response);
        }
      } catch (error) {
        // User not found, continue to other searches
      }
    }
    
    if (!user && phone) {
      // Search user by phone
      try {
        const response = await firestoreRequest('/users');
        if (response && response.documents) {
          const users = response.documents.map(convertFirestoreUser);
          user = users.find((u: any) => u.phone && u.phone.trim() === phone.trim());
        }
      } catch (error) {
        console.error('Error searching user by phone:', error);
      }
    }
    
    if (!user && email) {
      // Search user by email
      try {
        const response = await firestoreRequest('/users');
        if (response && response.documents) {
          const users = response.documents.map(convertFirestoreUser);
          user = users.find((u: any) => u.email === email);
        }
      } catch (error) {
        console.error('Error searching user by email:', error);
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in users API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new user (sign up)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      password, 
      name, 
      phone, 
      role = 'user', 
      status = 'active', 
      balance = 0, 
      referredBy = '',
      referralCode = ''
    } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists by email
    try {
      const response = await firestoreRequest('/users');
      if (response && response.documents) {
        const users = response.documents.map(convertFirestoreUser);
        const existingUser = users.find((u: any) => u.email === email);
        if (existingUser) {
          return NextResponse.json(
            { success: false, error: 'User with this email already exists' },
            { status: 409 }
          );
        }
      }
    } catch (error) {
      // If collection doesn't exist yet, that's fine
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const userData = {
      id: userId,
      email,
      passwordHash,
      name,
      phone: phone || '',
      role,
      balance: Number(balance) || 0,
      totalEarnings: 0,
      status: status || 'active',
      referralCode: referralCode || generateReferralCode(name),
      referredBy: referredBy || '',
      createdAt: now,
      updatedAt: now,
      joinDate: now,
      lastActive: now,
      transactions: [],
      withdrawalRequests: [],
      agentSince: role === 'worker' ? now : '',
      teamSize: role === 'manager' ? 0 : undefined,
      totalTeamEarnings: role === 'manager' ? 0 : undefined
    };

    const firestoreData = {
      fields: convertToFirestoreFields(userData)
    };

    await firestoreRequest(`/users/${userId}`, 'PATCH', firestoreData);

    // Generate JWT token
    const token = generateToken(userId, email, role);

    // Don't return password hash
    const { passwordHash: _, ...userWithoutPassword } = userData;

    // If user has a referrer, update referrer's team size
    if (referredBy && role === 'worker') {
      try {
        // Find referrer
        const allUsersResponse = await firestoreRequest('/users');
        if (allUsersResponse && allUsersResponse.documents) {
          const allUsers = allUsersResponse.documents.map(convertFirestoreUser);
          const referrer = allUsers.find((u: any) => 
            u.id && u.id.trim() === referredBy.trim() || 
            u.phone && u.phone.trim() === referredBy.trim()
          );
          
          if (referrer && (referrer.role === 'manager' || referrer.role === 'admin')) {
            // Update referrer's team size
            const updatedTeamSize = (referrer.teamSize || 0) + 1;
            const updateData = {
              teamSize: updatedTeamSize,
              updatedAt: now
            };
            
            const updateFields = convertToFirestoreFields(updateData);
            await firestoreRequest(`/users/${referrer.id}`, 'PATCH', {
              fields: updateFields
            });
          }
        }
      } catch (error) {
        console.error('Error updating referrer team size:', error);
        // Don't fail the user creation if this fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: userWithoutPassword,
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Login user (email/password) OR update user status/fields
export async function PATCH(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const action = searchParams.get('action');
    
    // If no ID parameter, assume it's a login request
    if (!id && !action) {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json(
          { success: false, error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Find user by email
      let user: any = null;
      try {
        const response = await firestoreRequest('/users');
        if (response && response.documents) {
          const users = response.documents.map(convertFirestoreUser);
          user = users.find((u: any) => u.email === email);
        }
      } catch (error) {
        console.error('Error searching user by email:', error);
      }

      if (!user) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { success: false, error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken(user.id, user.email, user.role);

      // Don't return password hash
      const { passwordHash, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    }
    
    // If ID parameter exists, it's an update request
    const body = await request.json();
    const { status, balance, totalEarnings, teamSize, totalTeamEarnings } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required for updates' },
        { status: 400 }
      );
    }

    // Check if user exists
    let user: any = null;
    try {
      const response = await firestoreRequest(`/users/${id.trim()}`);
      if (response && response.fields) {
        user = convertFirestoreUser(response);
      } else {
        return NextResponse.json(
          { success: false, error: 'User not found' },
          { status: 404 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    if (status !== undefined) updateData.status = status;
    if (balance !== undefined) updateData.balance = Number(balance);
    if (totalEarnings !== undefined) updateData.totalEarnings = Number(totalEarnings);
    if (teamSize !== undefined) updateData.teamSize = Number(teamSize);
    if (totalTeamEarnings !== undefined) updateData.totalTeamEarnings = Number(totalTeamEarnings);

    // Special handling for balance increments/decrements
    if (body.$increment && body.$increment.balance !== undefined) {
      updateData.balance = (user.balance || 0) + Number(body.$increment.balance);
    }

    const firestoreData = {
      fields: convertToFirestoreFields(updateData)
    };

    await firestoreRequest(`/users/${id.trim()}`, 'PATCH', firestoreData);

    // Get updated user
    const updatedResponse = await firestoreRequest(`/users/${id.trim()}`);
    const updatedUser = convertFirestoreUser(updatedResponse);
    const { passwordHash, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error in PATCH:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user (compatible with existing code)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, phone, status, balance, teamSize } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    try {
      await firestoreRequest(`/users/${id.trim()}`);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update user data
    const updateData: any = {
      updatedAt: new Date().toISOString(),
      lastActive: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (status !== undefined) updateData.status = status;
    if (balance !== undefined) updateData.balance = Number(balance);
    if (teamSize !== undefined) updateData.teamSize = Number(teamSize);

    const firestoreData = {
      fields: convertToFirestoreFields(updateData)
    };

    await firestoreRequest(`/users/${id.trim()}`, 'PATCH', firestoreData);

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

// Helper function to generate referral code
function generateReferralCode(name: string): string {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `${initials}${randomNum}`;
}