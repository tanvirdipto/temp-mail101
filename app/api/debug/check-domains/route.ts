import { NextResponse } from 'next/server'
import { createBrowserClient } from '@supabase/ssr'

export async function GET() {
  try {
    // Create client with service role key
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Try to get all domains (no filter)
    const { data: allDomains, error: allError } = await supabase
      .from('domains')
      .select('*')

    // Try to get active domains only
    const { data: activeDomains, error: activeError } = await supabase
      .from('domains')
      .select('*')
      .eq('status', 'active')

    // Try to get IMAP servers
    const { data: imapServers, error: imapError } = await supabase
      .from('imap_servers')
      .select('*')

    return NextResponse.json({
      allDomains: {
        success: !allError,
        error: allError?.message,
        count: allDomains?.length || 0,
        data: allDomains
      },
      activeDomains: {
        success: !activeError,
        error: activeError?.message,
        count: activeDomains?.length || 0,
        data: activeDomains
      },
      imapServers: {
        success: !imapError,
        error: imapError?.message,
        count: imapServers?.length || 0,
        data: imapServers
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
