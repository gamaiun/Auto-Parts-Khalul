# Telegram Integration - Simple & Automatic Setup

## How It Works

When a customer completes the form (plate number → part → phone), the app **automatically sends a Telegram message** to the salesperson containing:

- Vehicle information
- Part requested
- Customer's phone number

**No popups, no user action needed - completely automatic!**

## Setup (5 minutes)

### Step 1: Create a Telegram Bot

1. Open Telegram and search for **@BotFather**
2. Send `/newbot` command
3. Follow the instructions:
   - Choose a name for your bot (e.g., "Auto Parts Bot")
   - Choose a username (e.g., "autoparts_requests_bot")
4. **Copy the Bot Token** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your Chat ID

1. Search for **@userinfobot** in Telegram
2. Start a chat with it
3. It will send you your **Chat ID** (a number like: `123456789`)

### Step 3: Start Your Bot

1. Search for your bot username in Telegram
2. Click "Start" to activate it

### Step 4: Configure Your App

1. Create `.env.local` file in your project root:

```bash
touch .env.local
```

2. Add your credentials:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

3. Restart your dev server:

```bash
npm run dev
```

## That's It!

Now when customers complete the form, you'll receive an instant Telegram message with all the details - completely automatic!

## Testing

1. Open http://localhost:3001
2. Enter a vehicle plate number
3. Enter a part needed
4. Enter a phone number
5. Check your Telegram - you should receive the message instantly!

## Advantages over WhatsApp

✅ **Truly automatic** - no user clicks needed  
✅ **Free forever** - unlimited messages  
✅ **No registration complexity** - just create a bot  
✅ **Instant delivery** - faster than email  
✅ **No phone verification** - works immediately  
✅ **Easy setup** - 5 minutes total

## Troubleshooting

**Not receiving messages?**

- Make sure you clicked "Start" on your bot
- Verify the Bot Token is correct
- Verify the Chat ID is correct
- Check browser console for errors

**Wrong Chat ID?**

- Use @userinfobot to get your personal Chat ID
- Or use @RawDataBot - send it any message and it shows your chat_id
