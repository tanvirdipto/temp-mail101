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
          rejectUnauthorized: false, // Allow self-signed certificates for now
        },
        authTimeout: 30000,
      },
    }

    try {
      const connection = await imaps.connect(options)
      return connection
    } catch (error) {
      console.error('IMAP connection failed:', error)
      throw new Error(`Failed to connect to IMAP server: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      throw new Error(`Failed to fetch emails: ${error instanceof Error ? error.message : 'Unknown error'}`)
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
      // Extract UID from message ID (first 32 chars are hash, rest is server ID)
      const hash = messageId.substring(0, 32)
      const serverId = messageId.substring(32)

      if (serverId !== this.config.id) {
        return null
      }

      connection = await this.connect()
      await connection.openBox('INBOX')

      // For now, we'll search by email and find the matching message
      // TODO: Implement proper UID mapping via database
      const messages = await this.fetchMessages(email, 100)
      return messages.find(m => m.id === messageId) || null

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
   * Test IMAP connection
   */
  async testConnection(): Promise<boolean> {
    let connection
    try {
      connection = await this.connect()
      await connection.openBox('INBOX')
      return true
    } catch (error) {
      console.error('IMAP connection test failed:', error)
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
}
