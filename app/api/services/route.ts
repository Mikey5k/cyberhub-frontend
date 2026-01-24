import { NextRequest } from "next/server";
import { db } from "@/lib/firebaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const category = searchParams.get("category");

    if (!db) {
      return Response.json({
        success: true,
        type: "services",
        count: 0,
        services: [],
        message: "Firebase not initialized - mock data"
      });
    }

    // Get all services
    if (!type || type === "services") {
      let query: any = db.collection("services");
      
      if (status) {
        query = query.where("status", "==", status);
      }
      
      if (category) {
        query = query.where("category", "==", category);
      }
      
      const snapshot = await query.orderBy("createdAt", "desc").get();
      const services: any[] = [];
      
      snapshot.forEach((doc: any) => {
        services.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return Response.json({
        success: true,
        type: "services",
        count: services.length,
        services
      });
    }
    
    return Response.json(
      { error: "Invalid type parameter" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Services API error:", error);
    return Response.json(
      { error: "Database error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, category, price, requirements, phone } = body;
    
    if (!db) {
      return Response.json({
        success: true,
        message: "Firebase not initialized - mock data",
        serviceId: "mock-" + Date.now()
      });
    }
    
    // Basic validation
    if (!name || !description || !category || price === undefined) {
      return Response.json(
        { error: "Name, description, category, and price are required" },
        { status: 400 }
      );
    }
    
    // Create service in Firestore
    const serviceRef = db.collection("services").doc();
    const serviceData = {
      id: serviceRef.id,
      name,
      description,
      category,
      price: Number(price),
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await serviceRef.set(serviceData);
    
    return Response.json({
      success: true,
      message: "Service added successfully",
      serviceId: serviceRef.id,
      service: serviceData
    });
  } catch (error: any) {
    console.error("Create service error:", error);
    return Response.json(
      { error: "Failed to create service", message: error.message },
      { status: 500 }
    );
  }
}