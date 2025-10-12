export async function POST(request) {
  try {
    const body = await request.json();
    console.log('End call request received:', body);

    // This endpoint is called when the assistant wants to end the call
    // The actual call ending is handled by the frontend
    
    return Response.json({
      success: true,
      message: "Call ended successfully",
      reason: body.reason || "Interview generated successfully"
    });

  } catch (error) {
    console.error("Error ending call:", error);
    return Response.json({
      success: false,
      message: "Failed to end call",
      error: error.message
    }, { status: 500 });
  }
}
