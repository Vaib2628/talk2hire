# Talk2Hire - AI Voice Interview Coach

A Next.js application for practicing job interviews with AI assistance and getting detailed feedback.

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Firebase account (for authentication and database)
- Vapi account (optional, for AI interview features)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables** - See [SETUP.md](./SETUP.md) for detailed instructions

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Setup

**Important:** Before running the app, you need to configure Firebase. See [SETUP.md](./SETUP.md) for complete setup instructions.

Quick setup:
1. Create `.env.local` file in the project root
2. Copy Firebase configuration from `env.example`
3. Add your Firebase credentials
4. Restart the development server

## Features

- 🎤 AI-powered voice interviews
- 📊 Detailed interview feedback
- 🔐 Firebase authentication
- 📱 Responsive design
- ⚡ Optimized performance

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
