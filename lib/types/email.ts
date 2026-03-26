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
