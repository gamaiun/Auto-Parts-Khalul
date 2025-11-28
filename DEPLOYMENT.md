# Deploying to Vercel

This guide will help you deploy your Auto Parts website to Vercel.

## Prerequisites

- GitHub account with the `Auto-Parts-Khalul` repository
- Vercel account (sign up at [vercel.com](https://vercel.com))

## Step 1: Create Vercel KV Database

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **KV (Redis)**
5. Enter a name: `auto-parts-orders`
6. Click **Create**

## Step 2: Deploy Your Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select `Auto-Parts-Khalul` from your GitHub repos
4. Click **Import**

## Step 3: Configure Environment Variables

Before deploying, add your environment variables:

1. In the deployment page, scroll to **Environment Variables**
2. Add these variables:
   ```
   TELEGRAM_BOT_TOKEN = 8513694409:AAGFcLp3zIgPNeVaWAXHb1-K4MNez9V7WM4
   TELEGRAM_CHAT_ID = 1172043337
   ```
3. The KV variables will be added automatically when you connect the database

## Step 4: Connect KV Database to Project

1. Click on your project after it's created
2. Go to **Storage** tab
3. Click **Connect Store**
4. Select your `auto-parts-orders` KV database
5. Click **Connect**
6. This will automatically add the KV environment variables

## Step 5: Deploy

1. Click **Deploy**
2. Wait for deployment to complete (usually 1-2 minutes)
3. You'll get a URL like: `https://auto-parts-khalul.vercel.app`

## Step 6: Test Your Site

1. Visit your Vercel URL
2. Test the chat by entering a plate number
3. Open the dashboard: `https://auto-parts-khalul.vercel.app/dashboard`
4. Click "Enable Sound"
5. Test an order and verify it shows up on the dashboard

## Automatic Deployments

Every time you push to GitHub, Vercel will automatically:

- Deploy your changes
- Run tests
- Update your live site

## Custom Domain (Optional)

Want to use your own domain?

1. Go to project **Settings** → **Domains**
2. Add your domain
3. Update DNS records as instructed

## Troubleshooting

### Orders not saving

- Make sure KV database is connected
- Check **Deployments** → **Functions** logs for errors

### Telegram not sending

- Verify environment variables are set correctly
- Check bot token hasn't expired

### Dashboard not updating

- Hard refresh: `Ctrl + Shift + R`
- Check browser console for errors

## Local Development with KV

To test KV locally:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel env pull .env.local`
3. This downloads your KV credentials locally
4. Run: `npm run dev`

Note: Without KV credentials, the app will work but orders won't persist between server restarts (same as before).
