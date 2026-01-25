export async function GET() {
  return Response.json({
    status: "ok",
    runtime: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    message: "CyberHub API is working"
  });
}