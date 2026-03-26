# Phase 1: IMAP Email Server Setup

## 🎯 Goal
Set up IMAP email server (Gmail initially) and create email fetching service.

## ⏱️ Estimated Time
3-4 hours

## 📋 Prerequisites
- Phase 0 completed (Supabase setup)
- Gmail account (or willing to create one for testing)

---

## Step 1: Gmail IMAP Configuration

### 1.1 Create/Use Gmail Account

You have two options:

#### Option A: Create New Gmail Account (Recommended for Testing)
1. Go to https://accounts.google.com/signup
2. Create new account: `yourtempmail@gmail.com`
3. Complete verification
4. This will be your IMAP server email

#### Option B: Use Existing Gmail Account
- Use any Gmail account you have access to
- Make sure you're comfortable using it for temporary email testing

### 1.2 Enable IMAP in Gmail
1. Login to Gmail
2. Click ⚙️ (Settings) > See all settings
3. Go to "Forwarding and POP/IMAP" tab
4. Under "IMAP access" section:
   - Select **"Enable IMAP"**
   - Click "Save Changes"

### 1.3 Enable 2-Factor Authentication (2FA)
1. Go to https://myaccount.google.com/security
2. Under "Signing in to Google" section
3. Click "2-Step Verification"
4. Click "Get Started"
5. Follow prompts to set up (use phone number or authenticator app)

### 1.4 Generate App Password
1. Go to https://myaccount.google.com/apppasswords
   - (Or: Google Account > Security > 2-Step Verification > App passwords)
2. Click "Select app" → Choose "Mail"
3. Click "Select device" → Choose "Other (Custom name)"
4. Enter name: "Temp Mail System"
5. Click "Generate"
6. **IMPORTANT**: Copy the 16-character password shown
   - It looks like: `abcd efgh ijkl mnop`
   - Remove spaces: `abcdefghijklmnop`
   - Save this securely - you won't see it again!

### 1.5 Update Environment Variables

Add to `.env.local`:
```env
# Gmail IMAP Configuration
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=yourtempmail@gmail.com
IMAP_PASSWORD=abcdefghijklmnop
IMAP_TLS=true
IMAP_AUTH_TIMEOUT=10000
```

---

## Step 2: Alternative IMAP Providers (Optional)

If you don't want to use Gmail, here are alternatives:

### Option 1: Zoho Mail (Free tier available)
```env
IMAP_HOST=imap.zoho.com
IMAP_PORT=993
IMAP_USER=your-email@zoho.com
IMAP_PASSWORD=your-password
IMAP_TLS=true
```

### Option 2: Outlook/Hotmail
```env
IMAP_HOST=outlook.office365.com
IMAP_PORT=993
IMAP_USER=your-email@outlook.com
IMAP_PASSWORD=your-password
IMAP_TLS=true
```

### Option 3: Custom Domain (cPanel/Plesk)
```env
IMAP_HOST=mail.yourdomain.com
IMAP_PORT=993
IMAP_USER=info@yourdomain.com
IMAP_PASSWORD=your-password
IMAP_TLS=true
```

---

## Step 3: Add Initial IMAP Server to Database

### 3.1 Go to Supabase Dashboard
1. Open your Supabase project
2. Go to "Table Editor" > "imap_servers"
3. Click "Insert row"

### 3.2 Insert IMAP Configuration
Fill in the form:
- **id**: (auto-generated UUID)
- **name**: `Gmail Primary Server`
- **host**: `imap.gmail.com`
- **port**: `993`
- **username**: `yourtempmail@gmail.com`
- **password**: `abcdefghijklmnop` (your app password)
- **encryption**: `tls`
- **validate_cert**: `true`
- **tag**: `main`
- **status**: `active`

Click "Save"

### 3.3 Note the Server ID
- Copy the UUID of the created server (we'll need it)

---

## Step 4: Add Test Domain to Database

### 4.1 Go to "domains" Table
1. Table Editor > domains
2. Click "Insert row"

### 4.2 Insert Domain
Fill in:
- **id**: (auto-generated)
- **domain**: `gmail.com` (or your domain)
- **type**: `free`
- **imap_server_id**: (paste the UUID from Step 3.3)
- **user_id**: `null`
- **status**: `active`
- **dns_verified**: `false`

Click "Save"

---

## Step 5: Create IMAP Service Layer

### 5.1 Create Types File
Create `lib/types/email.ts`:
```typescript
export interface ImapConfig {
  id: string
  name: string
  host: string
  port: number
  username: string
  password: string
  encryption: 'tls' | 'ssl' | 'none'
  validate_cert: boolean
  tag: string
  status: 'active' | 'inactive'
}

export interface EmailMessage {
  id: string // Unique hash ID
  from: string // Sender email
  from_name: string // Sender name
  to: string // Recipient email
  subject: string
  text: string // Plain text content
  html: string // HTML content
  received_at: string // ISO timestamp
  is_seen: boolean
  has_attachments: boolean
  attachments: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content_type: string
  size: number
  download_url?: string
}

export interface ImapConnectionOptions {
  imap: {
    user: string
    password: string
    host: string
    port: number
    tls: boolean
    tlsOptions?: {
      rejectUnauthorized: boolean
    }
    authTimeout: number
  }
}
```

### 5.2 Create IMAP Service
Create `lib/imap/service.ts`:
```typescript
import imaps from 'imap-simple'
import { simpleParser } from 'mailparser'
import type { ImapConfig, EmailMessage, ImapConnectionOptions } from '@/lib/types/email'
import { createHash } from 'crypto'

export class ImapService {
  private config: ImapConfig

  constructor(config: ImapConfig) {
    this.config = config
  }

  /**
   * Create IMAP connection
   */
  private async connect(): Promise<any> {
    const options: ImapConnectionOptions = {
      imap: {
        user: this.config.username,
        password: this.config.password,
        host: this.config.host,
        port: this.config.port,
        tls: this.config.encryption === 'tls',
        tlsOptions: {
          rejectUnauthorized: this.config.validate_cert,
        },
        authTimeout: 10000,
      },
    }

    try {
      const connection = await imaps.connect(options)
      return connection
    } catch (error) {
      console.error('IMAP connection failed:', error)
      throw new Error('Failed to connect to IMAP server')
    }
  }

  /**
   * Fetch all emails for a specific email address
   */
  async fetchMessages(email: string, limit: number = 50): Promise<EmailMessage[]> {
    let connection
    const messages: EmailMessage[] = []

    try {
      connection = await this.connect()
      await connection.openBox('INBOX')

      // Search for messages sent to this email address
      const searchCriteria = [['TO', email]]
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: false,
        struct: true,
      }

      const results = await connection.search(searchCriteria, fetchOptions)

      // Limit results
      const limitedResults = results.slice(0, limit)

      for (const item of limitedResults) {
        try {
          const all = item.parts.find((part: any) => part.which === '')
          if (!all || !all.body) continue

          const parsed = await simpleParser(all.body)

          // Generate unique ID for this message
          const uid = item.attributes.uid
          const messageId = this.generateMessageId(uid, this.config.id)

          // Check if message is seen
          const isSeen = item.attributes.flags.includes('\\Seen')

          // Extract attachments
          const attachments = parsed.attachments?.map((att) => ({
            filename: att.filename || 'unnamed',
            content_type: att.contentType,
            size: att.size,
          })) || []

          const message: EmailMessage = {
            id: messageId,
            from: parsed.from?.value[0]?.address || '',
            from_name: parsed.from?.value[0]?.name || '',
            to: parsed.to?.value[0]?.address || email,
            subject: parsed.subject || '(no subject)',
            text: parsed.text || '',
            html: parsed.html || '',
            received_at: parsed.date?.toISOString() || new Date().toISOString(),
            is_seen: isSeen,
            has_attachments: attachments.length > 0,
            attachments,
          }

          messages.push(message)
        } catch (parseError) {
          console.error('Failed to parse message:', parseError)
          continue
        }
      }

      return messages.sort(
        (a, b) => new Date(b.received_at).getTime() - new Date(a.received_at).getTime()
      )
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      throw new Error('Failed to fetch emails from IMAP server')
    } finally {
      if (connection) {
        connection.end()
      }
    }
  }

  /**
   * Fetch a single message by ID
   */
  async fetchMessageById(messageId: string, email: string): Promise<EmailMessage | null> {
    let connection

    try {
      // Extract UID from message ID
      const uid = this.extractUidFromMessageId(messageId)
      if (!uid) return null

      connection = await this.connect()
      await connection.openBox('INBOX')

      const fetchOptions = {
        bodies: ['HEADER', 'TEXT', ''],
        markSeen: true, // Mark as read when viewing
        struct: true,
      }

      const results = await connection.fetch([uid], fetchOptions)
      if (results.length === 0) return null

      const item = results[0]
      const all = item.parts.find((part: any) => part.which === '')
      if (!all || !all.body) return null

      const parsed = await simpleParser(all.body)

      const attachments = parsed.attachments?.map((att) => ({
        filename: att.filename || 'unnamed',
        content_type: att.contentType,
        size: att.size,
      })) || []

      return {
        id: messageId,
        from: parsed.from?.value[0]?.address || '',
        from_name: parsed.from?.value[0]?.name || '',
        to: parsed.to?.value[0]?.address || email,
        subject: parsed.subject || '(no subject)',
        text: parsed.text || '',
        html: parsed.html || '',
        received_at: parsed.date?.toISOString() || new Date().toISOString(),
        is_seen: true,
        has_attachments: attachments.length > 0,
        attachments,
      }
    } catch (error) {
      console.error('Failed to fetch message by ID:', error)
      return null
    } finally {
      if (connection) {
        connection.end()
      }
    }
  }

  /**
   * Delete a message by ID
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    let connection

    try {
      const uid = this.extractUidFromMessageId(messageId)
      if (!uid) return false

      connection = await this.connect()
      await connection.openBox('INBOX')

      await connection.addFlags([uid], '\\Deleted')
      await connection.expunge()

      return true
    } catch (error) {
      console.error('Failed to delete message:', error)
      return false
    } finally {
      if (connection) {
        connection.end()
      }
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(uid: number, serverId: string): string {
    // Create hash from UID
    const hash = createHash('sha256')
      .update(`${uid}-${serverId}`)
      .digest('hex')
      .substring(0, 32)
    return `${hash}${serverId}`
  }

  /**
   * Extract UID from message ID
   */
  private extractUidFromMessageId(messageId: string): number | null {
    try {
      // Message ID format: {32-char-hash}{server-uuid}
      // We need to store UID mapping in database for production
      // For now, this is a simplified version
      // TODO: Implement proper UID mapping via database
      return null
    } catch {
      return null
    }
  }
}
```

### 5.3 Create IMAP Manager
Create `lib/imap/manager.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { ImapService } from './service'
import type { ImapConfig } from '@/lib/types/email'

/**
 * Get IMAP server configuration by tag
 */
export async function getImapServerByTag(tag: string = 'main'): Promise<ImapConfig | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('imap_servers')
    .select('*')
    .eq('tag', tag)
    .eq('status', 'active')
    .single()

  if (error || !data) return null

  return data as ImapConfig
}

/**
 * Get IMAP server by domain
 */
export async function getImapServerByDomain(domain: string): Promise<ImapConfig | null> {
  const supabase = await createClient()

  // Get domain info with IMAP server
  const { data: domainData, error: domainError } = await supabase
    .from('domains')
    .select('imap_server_id')
    .eq('domain', domain)
    .eq('status', 'active')
    .single()

  if (domainError || !domainData?.imap_server_id) return null

  // Get IMAP server
  const { data: imapData, error: imapError } = await supabase
    .from('imap_servers')
    .select('*')
    .eq('id', domainData.imap_server_id)
    .eq('status', 'active')
    .single()

  if (imapError || !imapData) return null

  return imapData as ImapConfig
}

/**
 * Create IMAP service instance
 */
export async function createImapService(email: string): Promise<ImapService | null> {
  // Extract domain from email
  const domain = email.split('@')[1]

  // Get IMAP server for this domain
  const config = await getImapServerByDomain(domain)
  if (!config) return null

  return new ImapService(config)
}
```

---

## Step 6: Create Test API Routes

### 6.1 Test IMAP Connection
Create `app/api/test-imap/route.ts`:
```typescript
import { NextResponse } from 'next/server'
import { getImapServerByTag } from '@/lib/imap/manager'
import { ImapService } from '@/lib/imap/service'

export async function GET() {
  try {
    // Get IMAP config
    const config = await getImapServerByTag('main')
    if (!config) {
      return NextResponse.json(
        { error: 'IMAP server not configured' },
        { status: 500 }
      )
    }

    // Create service and test connection
    const service = new ImapService(config)

    // Try to fetch messages for the IMAP account itself (test)
    const messages = await service.fetchMessages(config.username, 5)

    return NextResponse.json({
      success: true,
      server: {
        name: config.name,
        host: config.host,
        username: config.username,
      },
      message_count: messages.length,
      messages: messages.map((m) => ({
        id: m.id,
        from: m.from,
        subject: m.subject,
        received_at: m.received_at,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
```

### 6.2 Test the IMAP Connection
```bash
# Send yourself a test email first
# From any email account, send an email to: yourtempmail@gmail.com
# Subject: Test IMAP Integration
# Body: This is a test email

# Wait 1-2 minutes for email to arrive

# Then test the API
curl http://localhost:3000/api/test-imap
```

Expected response:
```json
{
  "success": true,
  "server": {
    "name": "Gmail Primary Server",
    "host": "imap.gmail.com",
    "username": "yourtempmail@gmail.com"
  },
  "message_count": 1,
  "messages": [
    {
      "id": "abc123...",
      "from": "sender@example.com",
      "subject": "Test IMAP Integration",
      "received_at": "2024-03-25T10:30:00.000Z"
    }
  ]
}
```

---

## Step 7: Troubleshooting IMAP Connection

### Common Issues

#### Issue 1: "Invalid credentials"
**Solution**:
- Double-check app password (no spaces)
- Ensure 2FA is enabled
- Regenerate app password if needed

#### Issue 2: "Connection timeout"
**Solution**:
- Check firewall settings
- Verify port 993 is open
- Try different network (some networks block IMAP)

#### Issue 3: "IMAP not enabled"
**Solution**:
- Go to Gmail settings
- Enable IMAP again
- Wait 5-10 minutes and retry

#### Issue 4: No messages returned (but you sent test email)
**Solution**:
- Check spam/junk folder in Gmail
- Verify email was sent to correct address
- Wait 2-3 minutes for email to sync

---

## ✅ Phase 1 Checklist

- [ ] Gmail account created/configured
- [ ] IMAP enabled in Gmail
- [ ] 2FA enabled
- [ ] App password generated and saved
- [ ] Environment variables updated with IMAP credentials
- [ ] IMAP server added to Supabase database
- [ ] Test domain added to database
- [ ] Email types created (`lib/types/email.ts`)
- [ ] IMAP service created (`lib/imap/service.ts`)
- [ ] IMAP manager created (`lib/imap/manager.ts`)
- [ ] Test API route created
- [ ] Test email sent and received
- [ ] IMAP connection test successful

---

## 🚀 Next Steps

Once Phase 1 is complete, move to:
**Phase 2: User Authentication** - Implement login/register with Supabase Auth

---

## 📝 Notes

- Keep Gmail app password secure
- For production, consider using dedicated email server
- Gmail has rate limits (be mindful of frequent polling)
- IMAP connections should be pooled/cached for performance

---

**Status**: ⏳ Ready to implement
**Dependencies**: Phase 0 (Supabase setup)
**Estimated Time**: 3-4 hours
