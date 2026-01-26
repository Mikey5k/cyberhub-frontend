import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const FIRESTORE_URL = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents`;
    const apiKey = process.env.FIREBASE_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const url = `${FIRESTORE_URL}/tasks?key=${apiKey}`;
    const response = await fetch(url);
    const responseText = await response.text();
    
    return NextResponse.json({
      status: response.status,
      ok: response.ok,
      url: url.replace(apiKey, 'REDACTED'),
      firestoreResponse: responseText ? JSON.parse(responseText) : null,
      apiKeyPresent: !!apiKey,
      projectId: process.env.FIREBASE_PROJECT_ID
    });
  } catch (error: any) {
    return NextResponse.json({
      error: "Test failed",
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}