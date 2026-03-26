import { NextRequest, NextResponse } from 'next/server'
import {
  generateRandomEmail,
  getAvailableDomains,
  getClientIP,
  generateFingerprint,
  saveTempEmail,
} from '@/lib/email-generator'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { domain: requestedDomain } = body

    // Get available domains
    const domains = await getAvailableDomains()

    if (domains.length === 0) {
      return NextResponse.json(
        { error: 'No domains available' },
        { status: 500 }
      )
    }

    // Use requested domain or pick first available
    const domain = requestedDomain && domains.includes(requestedDomain)
      ? requestedDomain
      : domains[0]

    // Generate random email
    const email = generateRandomEmail(domain)

    // Get client info
    const ip = getClientIP(request)
    const fingerprint = generateFingerprint(ip)

    // Save to database
    const saved = await saveTempEmail(email, domain, fingerprint, ip, 1)

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to create temp email' },
        { status: 500 }
      )
    }

    // Set cookie to remember this email
    const cookieStore = await cookies()
    cookieStore.set('temp_email', email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hour
    })

    return NextResponse.json({
      success: true,
      email,
      domain,
      expires_at: saved.id,
      available_domains: domains,
    })

  } catch (error) {
    console.error('Error creating temp email:', error)
    return NextResponse.json(
      {
        error: 'Failed to create temp email',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
