import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Check each table exists by querying it
    const tables = [
      'user_profiles',
      'imap_servers',
      'domains',
      'temp_emails',
      'saved_messages',
      'email_attachments'
    ]

    const results: Record<string, boolean> = {}

    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('*')
        .limit(1)

      results[table] = !error
    }

    const allTablesExist = Object.values(results).every(v => v === true)

    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist ? 'All tables exist!' : 'Some tables are missing',
      tables: results
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
