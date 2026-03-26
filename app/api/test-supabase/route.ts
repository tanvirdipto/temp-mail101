import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test connection by checking auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful!',
      connected: true,
      user: user ? { id: user.id, email: user.email } : null,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false,
    }, { status: 500 })
  }
}
