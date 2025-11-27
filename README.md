# WhatsApp Chat Clone

A single-page WhatsApp-like chat interface built with Next.js, React, and CSS.

## Features

- 💬 Real-time chat interface
- 🤖 Automated response system
- 📱 Responsive design
- 🎨 WhatsApp-inspired dark theme
- ⌨️ Keyboard shortcuts (Enter to send)
- ⏰ Message timestamps

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm

### Installation

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

- Type your message in the input field at the bottom
- Press Enter or click the send button to send
- The bot will automatically respond to your message
- Try messages like "hello", "how are you", "help", or "bye" for different responses

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Tech Stack

- **Next.js 14** - React framework
- **React 18** - UI library
- **CSS Modules** - Styling
- **npm** - Package manager

## Project Structure

```
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Main chat page
│   ├── page.module.css    # Page-specific styles
│   └── globals.css        # Global styles
├── .github/
│   └── copilot-instructions.md
├── package.json
├── next.config.js
└── README.md
```

## License

MIT
