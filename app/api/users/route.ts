import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get("phone");
    
    if (!phone) {
      return Response.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Check if Firebase is available
    if (!db) {
      return Response.json({
        success: true,
        user: {
          phone,
          role: "user", // Default role
          name: "",
          status: "active"
        },
        message: "Firebase not initialized - using mock data"
      });
    }

    // Get user from Firestore
    const userDoc = await db.collection("users").doc(phone).get();
    
    if (!userDoc.exists) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    return Response.json({
      success: true,
      user: {
        phone: userDoc.id,
        ...userData
      }
    });
  } catch (error: any) {
    console.error("Users API error:", error);
    return Response.json(
      { 
        success: true,
        user: {
          phone: request.nextUrl.searchParams.get("phone") || "unknown",
          role: "user",
          name: "",
          status: "active"
        },
        message: "Using fallback data due to error"
      }
    );
  }
}

export async function POST(request: NextRequest) {
  let phone = "";
  let role = "";
  let name = "";

  try {
    const body = await request.json();
    phone = body.phone;
    role = body.role;
    name = body.name || "";

    if (!phone || !role) {
      return Response.json(
        { error: "Phone and role are required" },
        { status: 400 }
      );
    }

    // Check if Firebase is available
    if (!db) {
      return Response.json({
        success: true,
        message: "Firebase not initialized - user creation simulated",
        user: { phone, role, name }
      });
    }

    // Create or update user in Firestore
    await db.collection("users").doc(phone).set({
      phone,
      role,
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "active"
    }, { merge: true });

    return Response.json({
      success: true,
      message: "User created/updated successfully",
      user: { phone, role, name }
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    return Response.json({
      success: true,
      message: "User creation simulated due to error",
      user: { 
        phone: phone || "unknown", 
        role: role || "user", 
        name: name || "" 
      }
    });
  }
}