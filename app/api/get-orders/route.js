import { kv } from "@vercel/kv";

// Use Vercel KV for persistent storage
const ORDERS_KEY = "auto-parts:orders";

export async function GET() {
  try {
    const orders = (await kv.get(ORDERS_KEY)) || [];
    return Response.json({
      success: true,
      orders: orders.sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      ),
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const order = await request.json();

    // Add timestamp if not present
    if (!order.timestamp) {
      order.timestamp = new Date().toISOString();
    }

    // Get existing orders
    const orders = (await kv.get(ORDERS_KEY)) || [];

    // Add new order to the beginning
    orders.unshift(order);

    // Keep only last 100 orders to prevent memory issues
    const updatedOrders = orders.slice(0, 100);

    // Save back to KV
    await kv.set(ORDERS_KEY, updatedOrders);

    console.log("New order stored:", order);

    return Response.json({ success: true, order });
  } catch (error) {
    console.error("Error storing order:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: "500" }
    );
  }
}
