import { NextResponse } from 'next/server'
import { ImapService } from '@/lib/imap/service'
import type { ImapConfig } from '@/lib/types/email'

export async function GET() {
  try {
    // Use environment variables directly for testing
    const config: ImapConfig = {
      id: 'test-server',
      name: 'Test cPanel Server',
      host: process.env.IMAP_HOST!,
      port: parseInt(process.env.IMAP_PORT || '993'),
      username: process.env.IMAP_USER!,
      password: process.env.IMAP_PASSWORD!,
      encryption: 'tls',
      validate_cert: true,
      tag: 'main',
      status: 'active',
    }

    // Test connection with detailed error
    const service = new ImapService(config)
    let isConnected = false
    let connectionError = null

    try {
      isConnected = await service.testConnection()
    } catch (err) {
      connectionError = err instanceof Error ? err.message : String(err)
    }

    if (!isConnected) {
      return NextResponse.json(
        {
          error: 'Failed to connect to IMAP server',
          details: connectionError,
          config: {
            host: config.host,
            port: config.port,
            user: config.username,
          }
        },
        { status: 500 }
      )
    }

    // Try to fetch messages
    const messages = await service.fetchMessages(config.username, 5)

    return NextResponse.json({
      success: true,
      message: 'IMAP connection successful!',
      server: {
        host: config.host,
        username: config.username,
      },
      connection: 'OK',
      message_count: messages.length,
      messages: messages.map((m) => ({
        from: m.from,
        subject: m.subject,
        date: m.received_at,
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
