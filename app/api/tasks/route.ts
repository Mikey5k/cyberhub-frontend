import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

type Task = {
  id: string;
  [key: string]: any;
};

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

// Convert Firestore timestamp to seconds
function convertTimestamp(timestamp: any): number {
  if (!timestamp) return 0;
  if (timestamp.seconds !== undefined) return Number(timestamp.seconds);
  if (timestamp._seconds !== undefined) return Number(timestamp._seconds);
  if (typeof timestamp === 'string' && timestamp.includes('T')) {
    return Math.floor(new Date(timestamp).getTime() / 1000);
  }
  return 0;
}

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
      // User sees their own tasks - need to list all tasks and filter
      const response = await firestoreRequest('/tasks');
      if (response && response.documents) {
        tasks = response.documents
          .filter((doc: any) => {
            const fields = doc.fields || {};
            return fields.customerPhone?.stringValue === phone;
          })
          .map((doc: any) => {
            const fields = doc.fields || {};
            const task: any = { id: doc.name.split('/').pop() };
            
            // Convert Firestore fields to regular object
            Object.keys(fields).forEach(key => {
              const field = fields[key];
              if (field.stringValue !== undefined) task[key] = field.stringValue;
              else if (field.integerValue !== undefined) task[key] = Number(field.integerValue);
              else if (field.doubleValue !== undefined) task[key] = Number(field.doubleValue);
              else if (field.booleanValue !== undefined) task[key] = field.booleanValue;
              else if (field.timestampValue !== undefined) task[key] = field.timestampValue;
              else if (field.mapValue?.fields) {
                // Handle nested objects
                const nested: any = {};
                Object.keys(field.mapValue.fields).forEach(nestedKey => {
                  const nestedField = field.mapValue.fields[nestedKey];
                  if (nestedField.stringValue !== undefined) nested[nestedKey] = nestedField.stringValue;
                  else if (nestedField.integerValue !== undefined) nested[nestedKey] = Number(nestedField.integerValue);
                  else if (nestedField.doubleValue !== undefined) nested[nestedKey] = Number(nestedField.doubleValue);
                });
                task[key] = nested;
              }
            });
            
            return task;
          });

        // Sort manually by createdAt
        tasks.sort((a, b) => {
          const timeA = convertTimestamp(a.createdAt);
          const timeB = convertTimestamp(b.createdAt);
          return timeB - timeA;
        });
      }
    }
    else if (role === "worker") {
      // Worker sees assigned + available tasks
      const response = await firestoreRequest('/tasks');
      if (response.documents) {
        const allTasks = response.documents.map((doc: any) => {
          const fields = doc.fields || {};
          const task: any = { id: doc.name.split('/').pop() };
          
          Object.keys(fields).forEach(key => {
            const field = fields[key];
            if (field.stringValue !== undefined) task[key] = field.stringValue;
            else if (field.integerValue !== undefined) task[key] = Number(field.integerValue);
            else if (field.doubleValue !== undefined) task[key] = Number(field.doubleValue);
            else if (field.booleanValue !== undefined) task[key] = field.booleanValue;
            else if (field.timestampValue !== undefined) task[key] = field.timestampValue;
          });
          
          return task;
        });

        // Filter assigned tasks
        const assignedTasks = allTasks
          .filter((task: any) => task.assignedWorkerPhone === phone)
          .map((task: any) => ({ ...task, type: "assigned" }));

        // Filter unassigned available tasks
        const unassignedTasks = allTasks
          .filter((task: any) => 
            (!task.assignedWorkerPhone || task.assignedWorkerPhone === "null" || task.assignedWorkerPhone === null) &&
            task.status === "awaiting_worker"
          )
          .map((task: any) => ({ ...task, type: "available" }));

        tasks = [...assignedTasks, ...unassignedTasks];

        // Sort manually
        tasks.sort((a, b) => {
          const timeA = convertTimestamp(a.createdAt);
          const timeB = convertTimestamp(b.createdAt);
          return timeB - timeA;
        });
      }
    }
    else if (role === "admin") {
      // Admin sees all tasks
      const response = await firestoreRequest('/tasks');
      if (response.documents) {
        tasks = response.documents.map((doc: any) => {
          const fields = doc.fields || {};
          const task: any = { id: doc.name.split('/').pop() };
          
          Object.keys(fields).forEach(key => {
            const field = fields[key];
            if (field.stringValue !== undefined) task[key] = field.stringValue;
            else if (field.integerValue !== undefined) task[key] = Number(field.integerValue);
            else if (field.doubleValue !== undefined) task[key] = Number(field.doubleValue);
            else if (field.booleanValue !== undefined) task[key] = field.booleanValue;
            else if (field.timestampValue !== undefined) task[key] = field.timestampValue;
          });
          
          return task;
        });

        // Sort manually by createdAt (descending)
        tasks.sort((a, b) => {
          const timeA = convertTimestamp(a.createdAt);
          const timeB = convertTimestamp(b.createdAt);
          return timeB - timeA;
        });
      }
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
        message: error.message || error.toString()
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

      const taskId = Date.now().toString(); // Simple ID generation
      const now = new Date().toISOString();
      
      const taskData = {
        fields: {
          customerPhone: { stringValue: phone },
          title: { stringValue: title },
          description: { stringValue: description || "" },
          price: { doubleValue: price || 0 },
          status: { stringValue: "awaiting_worker" },
          progress: { integerValue: 0 },
          assignedWorkerPhone: { stringValue: "" },
          createdAt: { timestampValue: now },
          updatedAt: { timestampValue: now }
        }
      };

      await firestoreRequest(`/tasks/${taskId}`, 'PATCH', taskData);

      return NextResponse.json({
        success: true,
        taskId: taskId,
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

      // Check if task exists
      try {
        await firestoreRequest(`/tasks/${taskId}`);
      } catch (error) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }

      const now = new Date().toISOString();
      const updateData = {
        fields: {
          assignedWorkerPhone: { stringValue: workerPhone },
          status: { stringValue: "in-progress" },
          progress: { integerValue: 25 },
          updatedAt: { timestampValue: now }
        }
      };

      await firestoreRequest(`/tasks/${taskId}`, 'PATCH', updateData);

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

      // Check if task exists
      try {
        await firestoreRequest(`/tasks/${taskId}`);
      } catch (error) {
        return NextResponse.json(
          { error: "Task not found" },
          { status: 404 }
        );
      }

      const now = new Date().toISOString();
      const updateData: any = {
        fields: {
          status: { stringValue: status },
          updatedAt: { timestampValue: now }
        }
      };

      // Add progress if provided
      if (progress !== undefined) {
        updateData.fields.progress = { integerValue: progress };
      }

      if (notes) {
        updateData.fields.notes = { stringValue: notes };
      }

      if (status === "completed") {
        updateData.fields.completedAt = { timestampValue: now };
        updateData.fields.progress = { integerValue: 100 };
      }

      if (status === "processing") {
        // Set auto-completion for 24 hours from now
        const autoCompleteTime = new Date();
        autoCompleteTime.setHours(autoCompleteTime.getHours() + 24);
        updateData.fields.autoCompleteAt = { timestampValue: autoCompleteTime.toISOString() };
      }

      await firestoreRequest(`/tasks/${taskId}`, 'PATCH', updateData);

      return NextResponse.json({
        success: true,
        message: `Task ${status} successfully`,
        taskId,
        status,
        progress: progress || (status === "completed" ? 100 : undefined)
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
        message: error.message || error.toString()
      },
      { status: 500 }
    );
  }
}