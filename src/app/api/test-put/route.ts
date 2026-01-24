export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    return NextResponse.json({ 
      success: true, 
      message: 'PUT works',
      received: body 
    });
  } catch (error) {
    return NextResponse.json({ error: 'PUT failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint' });
}