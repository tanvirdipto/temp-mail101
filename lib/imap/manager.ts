import { createClient as createBrowserClient } from '@supabase/supabase-js'
import { ImapService } from './service'
import type { ImapConfig } from '@/lib/types/email'

/**
 * Create Supabase client with service role (bypasses RLS)
 */
function createServiceClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

/**
 * Get IMAP server configuration by tag
 */
export async function getImapServerByTag(tag: string = 'main'): Promise<ImapConfig | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('imap_servers')
    .select('*')
    .eq('tag', tag)
    .eq('status', 'active')
    .single()

  if (error || !data) {
    console.error('Failed to get IMAP server:', error)
    return null
  }

  return data as ImapConfig
}

/**
 * Get IMAP server by domain
 */
export async function getImapServerByDomain(domain: string): Promise<ImapConfig | null> {
  const supabase = createServiceClient()

  // Get domain info with IMAP server
  const { data: domainData, error: domainError } = await supabase
    .from('domains')
    .select('imap_server_id')
    .eq('domain', domain)
    .eq('status', 'active')
    .single()

  if (domainError || !domainData?.imap_server_id) {
    console.error('Failed to get domain:', domainError)
    return null
  }

  // Get IMAP server
  const { data: imapData, error: imapError } = await supabase
    .from('imap_servers')
    .select('*')
    .eq('id', domainData.imap_server_id)
    .eq('status', 'active')
    .single()

  if (imapError || !imapData) {
    console.error('Failed to get IMAP server:', imapError)
    return null
  }

  return imapData as ImapConfig
}

/**
 * Create IMAP service instance
 */
export async function createImapService(email: string): Promise<ImapService | null> {
  // Extract domain from email
  const domain = email.split('@')[1]
  if (!domain) return null

  // Get IMAP server for this domain
  const config = await getImapServerByDomain(domain)
  if (!config) return null

  return new ImapService(config)
}
