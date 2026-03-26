# Phase 0: Foundation Setup

## 🎯 Goal
Set up Supabase project, install dependencies, and create database schema.

## ⏱️ Estimated Time
1-2 hours

## 📋 Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (sign up at https://supabase.com)

---

## Step 1: Create Supabase Project

### 1.1 Sign Up / Login to Supabase
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub or email

### 1.2 Create New Project
1. Click "New Project"
2. Fill in details:
   - **Name**: `temp-mail-system` (or your choice)
   - **Database Password**: Generate a strong password (save it securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier
3. Click "Create new project"
4. Wait 2-3 minutes for project to initialize

### 1.3 Get Project Credentials
1. Go to Project Settings > API
2. Copy these values (we'll need them):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGc...` (public key)
   - **service_role**: `eyJhbGc...` (secret key - keep secure!)

---

## Step 2: Install Dependencies

### 2.1 Install Supabase SDK
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 2.2 Install IMAP Libraries
```bash
npm install imap-simple mailparser
npm install -D @types/mailparser
```

### 2.3 Install Utility Libraries
```bash
npm install date-fns uuid
npm install -D @types/uuid
```

### 2.4 Verify Installation
Check `package.json` includes:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "imap-simple": "^5.x",
    "mailparser": "^3.x",
    "date-fns": "^3.x",
    "uuid": "^9.x"
  }
}
```

---

## Step 3: Configure Environment Variables

### 3.1 Update `.env.local`
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# IMAP Configuration (will be filled in Phase 1)
IMAP_HOST=
IMAP_PORT=
IMAP_USER=
IMAP_PASSWORD=
IMAP_TLS=true

# Security
SESSION_SECRET=your-random-secret-here
```

### 3.2 Add to `.gitignore`
Ensure `.env.local` is in `.gitignore`:
```
.env*.local
.env.local
```

---

## Step 4: Create Database Schema

### 4.1 Database Tables Overview

We need these tables:
1. **users** - Managed by Supabase Auth (auto-created)
2. **user_profiles** - Extended user information
3. **imap_servers** - IMAP server configurations
4. **domains** - Available email domains
5. **temp_emails** - Generated temporary emails
6. **saved_messages** - Favorited emails
7. **email_attachments** - Attachment metadata
8. **subscriptions** - User subscription/plans (optional for MVP)

### 4.2 Create Tables in Supabase

Go to Supabase Dashboard > SQL Editor > New Query

#### Table 1: user_profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, premium, pro
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

#### Table 2: imap_servers
```sql
CREATE TABLE imap_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- e.g., "Gmail Server 1"
  host TEXT NOT NULL, -- e.g., "imap.gmail.com"
  port INTEGER NOT NULL DEFAULT 993,
  username TEXT NOT NULL, -- IMAP username/email
  password TEXT NOT NULL, -- Encrypted password
  encryption TEXT NOT NULL DEFAULT 'tls', -- tls, ssl, none
  validate_cert BOOLEAN DEFAULT true,
  tag TEXT DEFAULT 'main', -- Used to route emails (main, gmail, custom)
  status TEXT DEFAULT 'active', -- active, inactive
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE imap_servers ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can read (for now)
-- Later we'll restrict to admins only
CREATE POLICY "Authenticated users can view IMAP servers"
  ON imap_servers FOR SELECT
  USING (auth.role() = 'authenticated');
```

#### Table 3: domains
```sql
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL UNIQUE, -- e.g., "tempmail.com"
  type TEXT NOT NULL DEFAULT 'free', -- free, premium, custom
  imap_server_id UUID REFERENCES imap_servers(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- For custom domains
  status TEXT DEFAULT 'active', -- active, inactive
  dns_verified BOOLEAN DEFAULT false, -- For custom domains
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active domains
CREATE POLICY "Anyone can view active domains"
  ON domains FOR SELECT
  USING (status = 'active');

-- Policy: Users can view their own custom domains
CREATE POLICY "Users can view own custom domains"
  ON domains FOR SELECT
  USING (user_id = auth.uid());
```

#### Table 4: temp_emails
```sql
CREATE TABLE temp_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL, -- Full email address
  domain TEXT NOT NULL, -- Domain part
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for guests
  fingerprint TEXT, -- For guest users (IP-based hash)
  ip_address TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_temp_emails_email ON temp_emails(email);
CREATE INDEX idx_temp_emails_user_id ON temp_emails(user_id);
CREATE INDEX idx_temp_emails_fingerprint ON temp_emails(fingerprint);
CREATE INDEX idx_temp_emails_expires_at ON temp_emails(expires_at);

-- Enable RLS
ALTER TABLE temp_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own emails
CREATE POLICY "Users can view own temp emails"
  ON temp_emails FOR SELECT
  USING (
    user_id = auth.uid() OR
    (user_id IS NULL AND fingerprint = current_setting('request.jwt.claims', true)::json->>'fingerprint')
  );

-- Policy: Users can delete their own emails
CREATE POLICY "Users can delete own temp emails"
  ON temp_emails FOR DELETE
  USING (user_id = auth.uid());
```

#### Table 5: saved_messages
```sql
CREATE TABLE saved_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id TEXT NOT NULL, -- Unique hash ID from IMAP
  from_email TEXT NOT NULL,
  from_name TEXT,
  to_email TEXT NOT NULL,
  subject TEXT,
  received_at TIMESTAMP WITH TIME ZONE NOT NULL,
  eml_file_path TEXT, -- Path in Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_saved_messages_user_id ON saved_messages(user_id);
CREATE INDEX idx_saved_messages_message_id ON saved_messages(message_id);

-- Enable RLS
ALTER TABLE saved_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own saved messages
CREATE POLICY "Users can view own saved messages"
  ON saved_messages FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can delete their own saved messages
CREATE POLICY "Users can delete own saved messages"
  ON saved_messages FOR DELETE
  USING (user_id = auth.uid());
```

#### Table 6: email_attachments
```sql
CREATE TABLE email_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT NOT NULL, -- Links to IMAP message
  filename TEXT NOT NULL,
  content_type TEXT,
  size_bytes INTEGER,
  storage_path TEXT, -- Path in Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Auto-delete after X days
);

-- Index
CREATE INDEX idx_attachments_message_id ON email_attachments(message_id);
CREATE INDEX idx_attachments_expires_at ON email_attachments(expires_at);

-- Enable RLS
ALTER TABLE email_attachments ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone with message access can view attachments
CREATE POLICY "Users can view attachments"
  ON email_attachments FOR SELECT
  USING (true); -- We'll secure via API routes
```

### 4.3 Create Storage Buckets

Go to Supabase Dashboard > Storage > Create Bucket

#### Bucket 1: saved-messages
- **Name**: `saved-messages`
- **Public**: No (private)
- **File size limit**: 25 MB
- **Allowed MIME types**: `message/rfc822` (.eml files)

#### Bucket 2: attachments
- **Name**: `attachments`
- **Public**: No (private)
- **File size limit**: 25 MB
- **Allowed MIME types**: (common safe types)

---

## Step 5: Create Supabase Client Utilities

### 5.1 Create `lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 5.2 Create `lib/supabase/server.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server component, can't set cookies
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server component, can't remove cookies
          }
        },
      },
    }
  )
}
```

### 5.3 Create `lib/supabase/middleware.ts`
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return response
}
```

### 5.4 Update `middleware.ts` (root level)
```typescript
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## Step 6: Test Supabase Connection

### 6.1 Create Test API Route
Create `app/api/test-supabase/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test connection by fetching domains
    const { data, error } = await supabase
      .from('domains')
      .select('*')
      .limit(1)

    if (error) throw error

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

### 6.2 Test the Connection
```bash
# Start dev server
npm run dev

# Visit in browser or curl
curl http://localhost:3000/api/test-supabase
```

Expected response:
```json
{
  "success": true,
  "message": "Supabase connection successful",
  "data": []
}
```

---

## ✅ Phase 0 Checklist

- [ ] Supabase project created
- [ ] Project credentials saved securely
- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Database schema created (all 6 tables)
- [ ] Storage buckets created (2 buckets)
- [ ] Supabase client utilities created
- [ ] Middleware configured
- [ ] Connection test successful

---

## 🚀 Next Steps

Once Phase 0 is complete, we'll move to:
**Phase 1: IMAP Setup** - Configure Gmail IMAP server and test email fetching

---

## 📝 Notes

- Keep your Supabase credentials secure (never commit to git)
- Database schema can be modified later if needed
- RLS policies ensure data security
- We'll add admin-only policies in Phase 6

---

**Status**: ⏳ Ready to implement
**Dependencies**: None
**Estimated Time**: 1-2 hours
