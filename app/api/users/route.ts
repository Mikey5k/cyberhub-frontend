import { NextRequest } from "next/server";

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const API_KEY = process.env.FIREBASE_API_KEY;

if (!PROJECT_ID || !API_KEY) {
  console.error('Missing Firebase environment variables for Users API');
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

// Helper to transform Firestore document to object
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
    } else if (field.mapValue?.fields) {
      result[key] = transformDocument({ fields: field.mapValue.fields });
    }
  });
  
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phoneEncoded = searchParams.get("phone") || "";
    const phone = decodeURIComponent(phoneEncoded);

    if (!phone) {
      return Response.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Handle + sign converted to space in URL
    let searchPhone = phone;
    if (phone.startsWith(" ") && phone.length > 1) {
      searchPhone = "+" + phone.substring(1);
    }

    console.log("GET User lookup - Phone:", {
      original: phone,
      searchPhone,
      encoded: phoneEncoded
    });

    // Try multiple collection names with detailed logging
    const collections = ["users", "clients", "workers", "admins", "managers"];
    let userData = null;
    let foundCollection = "";
    const debugResults = [];

    for (const collection of collections) {
      try {
        const endpoint = `/${collection}/${searchPhone}`;
        const result = await firestoreFetch(endpoint, 'GET');
        
        // Check if document exists (has fields property)
        const exists = result && result.fields;
        debugResults.push({ collection, exists, id: searchPhone });

        if (exists) {
          userData = transformDocument(result);
          foundCollection = collection;
          break;
        }
      } catch (error: any) {
        // If document doesn't exist, Firestore returns 404
        if (error.message.includes('404')) {
          debugResults.push({ collection, exists: false, error: 'Not found' });
        } else {
          debugResults.push({ collection, error: error.message, exists: false });
        }
      }
    }

    console.log("User lookup debug:", { searchPhone, debugResults });

    if (!userData) {
      return Response.json({
        error: "User not found",
        debug: {
          originalPhone: phone,
          searchPhone,
          phoneEncoded,
          collectionsChecked: debugResults,
          totalCollections: collections.length,
          message: `Checked ${collections.length} collections, none contained user`
        }
      }, { status: 404 });
    }

    console.log("User found in collection:", foundCollection);
    return Response.json({
      success: true,
      user: {
        phone: searchPhone,
        ...userData
      },
      foundIn: foundCollection,
      debug: debugResults
    });
  } catch (error: any) {
    console.error("Users API GET error:", error);
    return Response.json(
      {
        error: "Server error",
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone;
    const role = body.role;
    const name = body.name || "";

    if (!phone || !role) {
      return Response.json(
        { error: "Phone and role are required" },
        { status: 400 }
      );
    }

    console.log("POST User creation - Phone:", phone, "Role:", role);

    // Determine collection based on role
    let collectionName = "users";
    if (["client", "user"].includes(role.toLowerCase())) {
      collectionName = "clients";
    } else if (["worker", "agent"].includes(role.toLowerCase())) {
      collectionName = "workers";
    } else if (role.toLowerCase() === "admin") {
      collectionName = "admins";
    } else if (role.toLowerCase() === "manager") {
      collectionName = "managers";
    }

    console.log("Saving to collection:", collectionName);

    // Create user data for Firestore
    const userData = {
      fields: {
        phone: { stringValue: phone },
        role: { stringValue: role },
        name: { stringValue: name },
        createdAt: { timestampValue: new Date().toISOString() },
        updatedAt: { timestampValue: new Date().toISOString() },
        status: { stringValue: "active" }
      }
    };

    // Save to specific collection
    const endpoint = `/${collectionName}/${phone}`;
    await firestoreFetch(endpoint, 'PATCH', userData);

    // Also save to generic users collection for easy lookup
    const userGenericData = {
      fields: {
        phone: { stringValue: phone },
        role: { stringValue: role },
        name: { stringValue: name },
        primaryCollection: { stringValue: collectionName },
        createdAt: { timestampValue: new Date().toISOString() },
        updatedAt: { timestampValue: new Date().toISOString() },
        status: { stringValue: "active" }
      }
    };
    
    const genericEndpoint = `/users/${phone}`;
    await firestoreFetch(genericEndpoint, 'PATCH', userGenericData);

    return Response.json({
      success: true,
      message: "User created/updated successfully",
      user: { phone, role, name },
      savedTo: [collectionName, "users"]
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    return Response.json({
      success: false,
      error: "Failed to create user",
      message: error.message
    }, { status: 500 });
  }
}