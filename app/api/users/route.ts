import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";

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

    // Check if Firebase is available
    if (!db) {
      console.log("GET - Firebase not initialized");
      return Response.json({
        success: true,
        user: {
          phone: searchPhone,
          role: "user",
          name: "",
          status: "active"
        },
        message: "Firebase not initialized - using mock data"
      });
    }

    // Try multiple collection names with detailed logging
    const collections = ["users", "clients", "workers", "admins", "managers"];
    let userData = null;
    let foundCollection = "";
    const debugResults = [];
    
    for (const collection of collections) {
      try {
        const doc = await db.collection(collection).doc(searchPhone).get();
        const exists = doc.exists;
        debugResults.push({ collection, exists, id: doc.id });
        
        if (doc.exists) {
          userData = doc.data();
          foundCollection = collection;
          break;
        }
      } catch (error: any) {
        debugResults.push({ collection, error: error.message, exists: false });
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

    // Check if Firebase is available
    if (!db) {
      console.log("POST - Firebase not initialized");
      return Response.json({
        success: true,
        message: "Firebase not initialized - user creation simulated",
        user: { phone, role, name }
      });
    }

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

    // Create or update user
    await db.collection(collectionName).doc(phone).set({
      phone,
      role,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active"
    }, { merge: true });

    // Also save to generic users collection for easy lookup
    await db.collection("users").doc(phone).set({
      phone,
      role,
      name,
      primaryCollection: collectionName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active"
    }, { merge: true });

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