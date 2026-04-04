# Temp Mail - Temporary Email System

A fully-featured temporary email system built with Next.js, Supabase, and IMAP.

## Features

- ✅ Generate random temporary email addresses
- ✅ Real-time email inbox via IMAP  
- ✅ View emails with HTML/text rendering
- ✅ Multi-domain support
- ✅ Admin panel for managing domains
- ✅ Blog system with SEO

## Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript, Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Email**: IMAP (cPanel, Gmail, or custom)
- **Deployment**: Vercel

## Quick Start

1. Clone and install:
```bash
npm install
cp .env.example .env.local
```

2. Configure `.env.local` with your Supabase and IMAP credentials

3. Set up database (see docs/implementation/)

4. Run:
```bash
npm run dev
```

## Documentation

See `/docs/implementation/` for complete setup guides.

## Deployment

Auto-deploys to Vercel on push to main branch.
Environment variables configured via Vercel CLI.

## License

Private - All rights reserved
