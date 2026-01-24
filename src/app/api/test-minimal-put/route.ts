export const runtime = "nodejs";

import { NextRequest, NextResponse } from 'next/server';

export async function PUT(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'PUT method works',
    method: 'PUT'
  });
}

export async function GET() {
  return NextResponse.json({ message: 'Test endpoint works' });
}