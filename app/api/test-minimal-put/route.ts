console.log("API ROUTE LOADED"); // force Turbopack to register the file

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ step: 2, method: "GET" });
}

export async function PUT() {
  return NextResponse.json({ step: 2, method: "PUT" });
}