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

    // Test connection
    const isConnected = await service.testConnection()

    if (!isConnected) {
      return NextResponse.json(
        { error: 'Failed to connect to IMAP server' },
        { status: 500 }
      )
    }

    // Try to fetch messages for the IMAP account itself (test)
    const messages = await service.fetchMessages(config.username, 5)

    return NextResponse.json({
      success: true,
      message: 'IMAP connection successful!',
      server: {
        name: config.name,
        host: config.host,
        username: config.username,
      },
      connection: 'OK',
      message_count: messages.length,
      sample_messages: messages.map((m) => ({
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
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
