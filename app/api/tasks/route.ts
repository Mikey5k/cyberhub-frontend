import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export const runtime = "nodejs";

type Task = {
  id: string;
  [key: string]: any; // Allow other Firestore fields
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");
    const role = searchParams.get("role");

    if (!phone || !role) {
      return NextResponse.json(
        { error: "Phone and role are required" },
        { status: 400 }
      );
    }

    let tasks: Task[] = [];

    if (role === "user") {
      // User sees their own tasks
      const tasksSnapshot = await db
        .collection("tasks")
        .where("customerPhone", "==", phone)
        .get();

      tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort manually
      tasks.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        return timeB - timeA;
      });
    }
    else if (role === "worker") {
      // Worker sees assigned + available tasks
      const assignedTasksSnapshot = await db
        .collection("tasks")
        .where("assignedWorkerPhone", "==", phone)
        .get();

      const unassignedTasksSnapshot = await db
        .collection("tasks")
        .where("assignedWorkerPhone", "==", null)
        .where("status", "==", "awaiting_worker")
        .get();

      const assignedTasks = assignedTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: "assigned"
      }));

      const unassignedTasks = unassignedTasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        type: "available"
      }));

      tasks = [...assignedTasks, ...unassignedTasks];

      // Sort manually
      tasks.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        return timeB - timeA;
      });
    }
    else if (role === "admin") {
      // Admin sees all tasks
      const tasksSnapshot = await db
        .collection("tasks")
        .orderBy("createdAt", "desc")
        .get();

      tasks = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    return NextResponse.json({
      success: true,
      tasks,
      count: tasks.length
    });
  } catch (error: any) {
    console.error("Tasks API GET error:", error);
    return NextResponse.json(
      {
        error: "Database error",
        message: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, ...data } = body;

    if (!operation) {
      return NextResponse.json(
        { error: "Operation type is required: create, assign, or update" },
        { status: 400 }
      );
    }

    // SUB-MODE: Create task
    if (operation === "create") {
      const { phone, title, description, price } = data;

      if (!phone || !title) {
        return NextResponse.json(
          { error: "Phone and title are required" },
          { status: 400 }
        );
      }

      const taskRef = db.collection("tasks").doc();

      await taskRef.set({
        customerPhone: phone,
        title: title,
        description: description || "",
        price: price || 0,
        status: "awaiting_worker",
        progress: 0,
        assignedWorkerPhone: null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      });

      return NextResponse.json({
        success: true,
        taskId: taskRef.id,
        phone,
        title,
        price: price || 0,
        status: "awaiting_worker"
      });
    }

    // SUB-MODE: Assign task
    if (operation === "assign") {
      const { taskId, workerPhone } = data;

      if (!taskId || !workerPhone) {
        return NextResponse.json(
          { error: "Task ID and worker phone are required" },
          { status: 400 }
        );
      }

      const taskRef = db.collection("tasks").doc(taskId);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }

      await taskRef.update({
        assignedWorkerPhone: workerPhone,
        status: "in-progress",
        progress: 25,
        updatedAt: FieldValue.serverTimestamp()
      });

      return NextResponse.json({
        success: true,
        message: "Task assigned successfully",
        taskId,
        workerPhone,
        status: "in-progress",
        progress: 25
      });
    }

    // SUB-MODE: Update task
    if (operation === "update") {
      const { taskId, status, progress, notes } = data;

      if (!taskId || !status) {
        return NextResponse.json(
          { error: "Task ID and status are required" },
          { status: 400 }
        );
      }

      const taskRef = db.collection("tasks").doc(taskId);
      const taskDoc = await taskRef.get();

      if (!taskDoc.exists) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }

      const updateData: any = {
        status,
        updatedAt: FieldValue.serverTimestamp()
      };

      // Add progress if provided
      if (progress !== undefined) {
        updateData.progress = progress;
      }

      if (notes) {
        updateData.notes = notes;
      }

      if (status === "completed") {
        updateData.completedAt = FieldValue.serverTimestamp();
        updateData.progress = 100;
      }

      if (status === "processing") {
        // Set auto-completion for 24 hours from now
        const autoCompleteTime = new Date();
        autoCompleteTime.setHours(autoCompleteTime.getHours() + 24);
        updateData.autoCompleteAt = autoCompleteTime;
      }

      await taskRef.update(updateData);

      return NextResponse.json({
        success: true,
        message: `Task ${status} successfully`,
        taskId,
        status,
        progress: updateData.progress
      });
    }

    return NextResponse.json(
      { error: "Invalid operation. Use: create, assign, or update" },
      { status: 400 }
    );

  } catch (error: any) {
    console.error("Tasks API POST error:", error);
    return NextResponse.json(
      {
        error: "Database error",
        message: error.message
      },
      { status: 500 }
    );
  }
}