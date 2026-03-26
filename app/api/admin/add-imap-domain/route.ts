import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { host, port, username, password, domain, name } = body

    if (!host || !port || !username || !password || !domain) {
      return NextResponse.json(
        { error: 'Missing required fields: host, port, username, password, domain' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Step 1: Add IMAP server
    const { data: imapServer, error: imapError } = await supabase
      .from('imap_servers')
      .insert({
        name: name || `${domain} IMAP Server`,
        host,
        port: parseInt(port),
        username,
        password,
        encryption: body.encryption || 'tls',
        validate_cert: body.validate_cert !== false,
        tag: body.tag || 'main',
        status: 'active',
      })
      .select()
      .single()

    if (imapError) {
      return NextResponse.json(
        { error: 'Failed to add IMAP server', details: imapError.message },
        { status: 500 }
      )
    }

    // Step 2: Add domain and link to IMAP server
    const { data: domainData, error: domainError } = await supabase
      .from('domains')
      .insert({
        domain,
        type: body.type || 'free',
        imap_server_id: imapServer.id,
        status: 'active',
        dns_verified: false,
      })
      .select()
      .single()

    if (domainError) {
      // If domain creation fails, delete the IMAP server we just created
      await supabase.from('imap_servers').delete().eq('id', imapServer.id)

      return NextResponse.json(
        { error: 'Failed to add domain', details: domainError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Successfully added ${domain} with IMAP server`,
      imap_server: {
        id: imapServer.id,
        name: imapServer.name,
        host: imapServer.host,
      },
      domain: {
        id: domainData.id,
        domain: domainData.domain,
      },
    })

  } catch (error) {
    return NextResponse.json(
      {
        error: 'Server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
