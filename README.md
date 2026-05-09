# CivicFix

A community-driven civic issue reporting platform that allows neighbors to report, track, and get issues in their community fixed.

## Features

- 📍 **Location-based reporting** - Auto-detect user location or manually enter address
- 📸 **Photo analysis with AI** - Upload photos that get automatically analyzed for issue type, severity, and authenticity
- 🔍 **Duplicate detection** - Prevents spam by detecting similar recent reports nearby
- 📊 **Issue tracking** - View all reported issues on a map or list
- 🔔 **Real-time alerts** - Auto-notify admins for critical/high severity issues
- 🌐 **SEO friendly** - Server-side rendering for search engines

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) with React 19
- **Routing**: TanStack Router (file-based routing)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Maps**: Leaflet + React-Leaflet
- **AI**: Groq Vision (llama-4-scout) + aiautotagging.com fallback
- **Deployment**: Vercel (SSR)

## Getting Started

### Prerequisites

- Node.js 22+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Environment Variables

Create a `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

The app uses Groq for AI photo analysis. Get a free API key at [groq.com](https://groq.com).

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── ui/             # shadcn/ui components
├── functions/          # Server functions (API endpoints)
│   └── analyze-photo.functions.ts
├── lib/                # Utilities and stores
│   ├── issues-store.ts
│   ├── issues.ts
│   └── analyze-photo.functions.ts
├── routes/             # TanStack Router file-based routes
│   ├── index.tsx       # Home page
│   ├── report.tsx      # Report an issue
│   ├── issues.tsx      # Issues list
│   ├── issues.$id.tsx  # Issue details
│   └── ...
└── app.tsx             # App root
```

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repo to Vercel
2. Add environment variable `GROQ_API_KEY`
3. Deploy!

```bash
vercel deploy --prod
```
