export async function GET() {
  return Response.json({
    success: true,
    message: "Test endpoint working",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    status: "All systems operational"
  });
}