import { NextRequest, NextResponse } from 'next/server'
import { createImapService } from '@/lib/imap/manager'
import { cookies } from 'next/headers'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params

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

    // For catch-all: use the main mailbox
    const domain = email.split('@')[1]
    const catchAllEmail = `tempmail@${domain}`

    // Create IMAP service for the catch-all mailbox
    const imapService = await createImapService(catchAllEmail)

    if (!imapService) {
      return NextResponse.json(
        { error: 'IMAP service not available' },
        { status: 500 }
      )
    }

    // Fetch specific message
    const message = await imapService.fetchMessageById(messageId, email)

    if (!message) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message,
    })

  } catch (error) {
    console.error('Error fetching message:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch message',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
