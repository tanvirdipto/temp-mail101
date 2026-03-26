import { createClient } from '@/lib/supabase/server'

/**
 * Generate random email address
 */
export function generateRandomEmail(domain: string, length: number = 8): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let username = ''

  for (let i = 0; i < length; i++) {
    username += characters.charAt(Math.floor(Math.random() * characters.length))
  }

  return `${username}@${domain}`
}

/**
 * Get available domains from database
 */
export async function getAvailableDomains(): Promise<string[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('domains')
    .select('domain')
    .eq('status', 'active')

  if (error || !data) {
    console.error('Failed to get domains:', error)
    return []
  }

  return data.map(d => d.domain)
}

/**
 * Get user's IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return 'unknown'
}

/**
 * Generate fingerprint for guest users (based on IP)
 */
export function generateFingerprint(ip: string): string {
  // Simple hash of IP for now
  // In production, you might want to include User-Agent, etc.
  return Buffer.from(ip).toString('base64')
}

/**
 * Save temp email to database
 */
export async function saveTempEmail(
  email: string,
  domain: string,
  fingerprint: string,
  ipAddress: string,
  expiresInHours: number = 1
): Promise<{ id: string; email: string } | null> {
  const supabase = await createClient()

  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)

  const { data, error } = await supabase
    .from('temp_emails')
    .insert({
      email,
      domain,
      fingerprint,
      ip_address: ipAddress,
      expires_at: expiresAt.toISOString(),
      user_id: null, // Guest user for now
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save temp email:', error)
    return null
  }

  return data
}
