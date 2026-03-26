import { NextResponse } from 'next/server'
import { createBrowserClient } from '@supabase/ssr'

export async function GET() {
  try {
    // Check env vars
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    // Try with anon key
    const anonClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: anonData, error: anonError } = await anonClient
      .from('domains')
      .select('*')

    // Try with service key
    let serviceData = null
    let serviceError = null

    if (hasServiceKey) {
      const serviceClient = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      )

      const result = await serviceClient.from('domains').select('*')
      serviceData = result.data
      serviceError = result.error
    }

    return NextResponse.json({
      environment: {
        hasUrl,
        hasAnonKey,
        hasServiceKey,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
      },
      anonQuery: {
        success: !anonError,
        error: anonError?.message,
        count: anonData?.length || 0,
        data: anonData
      },
      serviceQuery: {
        success: !serviceError,
        error: serviceError?.message,
        count: serviceData?.length || 0,
        data: serviceData
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
