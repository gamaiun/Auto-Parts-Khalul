export async function POST(request) {
  try {
    const { vehicleInfo, part, phone } = await request.json();

    // Format the message
    const message = `🚗 *New Auto Parts Request*\n\n*Vehicle Information:*\n${vehicleInfo}\n\n*Part Requested:* ${part}\n*Customer Phone:* ${phone}`;

    // Telegram Bot Token and Chat ID (from environment variables)
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Telegram credentials not configured");
      console.log("Message would be sent:", message);
      return Response.json({
        success: false,
        error: "Telegram not configured. See TELEGRAM_SETUP.md",
      });
    }

    // Send message via Telegram Bot API
    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    const data = await response.json();

    if (!data.ok) {
      throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
    }

    console.log("Telegram message sent successfully!");
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Error sending Telegram:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
