import { NextRequest, NextResponse } from 'next/server'
import { createImapService } from '@/lib/imap/manager'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get email from query params or cookie
    const searchParams = request.nextUrl.searchParams
    let email = searchParams.get('email')

    if (!email) {
      const cookieStore = await cookies()
      email = cookieStore.get('temp_email')?.value || null
    }

    if (!email) {
      return NextResponse.json(
        { error: 'No email provided' },
        { status: 400 }
      )
    }

    // For catch-all setup: fetch from the main mailbox (tempmail@domain.com)
    // but we'll filter for messages sent TO the specific email
    const domain = email.split('@')[1]
    const catchAllEmail = `tempmail@${domain}`

    // Create IMAP service for the catch-all mailbox
    const imapService = await createImapService(catchAllEmail)

    if (!imapService) {
      return NextResponse.json(
        { error: 'IMAP service not available for this domain' },
        { status: 500 }
      )
    }

    // Fetch messages sent to the specific email address
    const messages = await imapService.fetchMessages(email, 50)

    return NextResponse.json({
      success: true,
      email,
      count: messages.length,
      messages: messages.map(msg => ({
        id: msg.id,
        from: msg.from,
        from_name: msg.from_name,
        subject: msg.subject,
        received_at: msg.received_at,
        is_seen: msg.is_seen,
        has_attachments: msg.has_attachments,
      })),
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch messages',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
