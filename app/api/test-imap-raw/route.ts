import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Dynamic import to avoid build issues
    const imaps = (await import('imap-simple')).default

    const config = {
      imap: {
        user: process.env.IMAP_USER!,
        password: process.env.IMAP_PASSWORD!,
        host: process.env.IMAP_HOST!,
        port: parseInt(process.env.IMAP_PORT || '993'),
        tls: true,
        authTimeout: 30000,
        tlsOptions: {
          rejectUnauthorized: false // Try with relaxed TLS first
        }
      }
    }

    console.log('Attempting IMAP connection with config:', {
      host: config.imap.host,
      port: config.imap.port,
      user: config.imap.user,
    })

    const connection = await imaps.connect(config)
    console.log('IMAP connection successful!')

    await connection.openBox('INBOX')
    console.log('INBOX opened successfully!')

    connection.end()

    return NextResponse.json({
      success: true,
      message: 'Raw IMAP connection successful!',
      server: {
        host: config.imap.host,
        port: config.imap.port,
        user: config.imap.user,
      }
    })

  } catch (error: any) {
    console.error('IMAP connection error:', error)

    return NextResponse.json(
      {
        error: 'IMAP connection failed',
        message: error.message || String(error),
        code: error.code,
        source: error.source,
        stack: error.stack?.split('\n').slice(0, 5),
      },
      { status: 500 }
    )
  }
}
