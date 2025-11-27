// Simple in-memory storage for orders
// In production, you'd use a real database
let orders = [];

export async function GET() {
  return Response.json({
    success: true,
    orders: orders.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    ),
  });
}

export async function POST(request) {
  try {
    const order = await request.json();

    // Add timestamp if not present
    if (!order.timestamp) {
      order.timestamp = new Date().toISOString();
    }

    // Add to orders array
    orders.unshift(order);

    // Keep only last 100 orders to prevent memory issues
    if (orders.length > 100) {
      orders = orders.slice(0, 100);
    }

    console.log("New order stored:", order);

    return Response.json({ success: true, order });
  } catch (error) {
    console.error("Error storing order:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
