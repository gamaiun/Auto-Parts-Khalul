import { kv } from "@vercel/kv";

// Use Vercel KV for persistent storage in production
// Fallback to in-memory for local development
const ORDERS_KEY = "auto-parts:orders";
let localOrders = []; // Fallback for local development

// Check if KV is available
const isKVAvailable = () => {
  return process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN;
};

// Exported function to store orders (reusable)
export async function storeOrder(order) {
  // Add timestamp if not present
  if (!order.timestamp) {
    order.timestamp = new Date().toISOString();
  }

  if (isKVAvailable()) {
    // Production: Use Vercel KV
    const orders = (await kv.get(ORDERS_KEY)) || [];
    orders.unshift(order);
    const updatedOrders = orders.slice(0, 100);
    await kv.set(ORDERS_KEY, updatedOrders);
  } else {
    // Local development: Use in-memory
    localOrders.unshift(order);
    if (localOrders.length > 100) {
      localOrders = localOrders.slice(0, 100);
    }
  }

  console.log("New order stored:", order);
  return order;
}

export async function GET() {
  try {
    let orders;

    if (isKVAvailable()) {
      // Production: Use Vercel KV
      orders = (await kv.get(ORDERS_KEY)) || [];
    } else {
      // Local development: Use in-memory
      orders = localOrders;
    }

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
    await storeOrder(order);
    return Response.json({ success: true, order });
  } catch (error) {
    console.error("Error storing order:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
