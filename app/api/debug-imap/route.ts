import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check domains table
    const { data: domains, error: domainError } = await supabase
      .from('domains')
      .select('*')

    // Check imap_servers table
    const { data: imapServers, error: imapError } = await supabase
      .from('imap_servers')
      .select('*')

    return NextResponse.json({
      domains: {
        count: domains?.length || 0,
        data: domains,
        error: domainError?.message,
      },
      imap_servers: {
        count: imapServers?.length || 0,
        data: imapServers,
        error: imapError?.message,
      },
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
