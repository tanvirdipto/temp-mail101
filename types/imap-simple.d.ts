declare module 'imap-simple' {
  export interface ImapSimpleOptions {
    imap: {
      user: string
      password: string
      host: string
      port: number
      tls: boolean
      tlsOptions?: {
        rejectUnauthorized: boolean
      }
      authTimeout: number
    }
  }

  export interface Connection {
    openBox(boxName: string): Promise<any>
    search(criteria: any[], fetchOptions: any): Promise<any[]>
    fetch(uids: number[], fetchOptions: any): Promise<any[]>
    end(): void
  }

  export default {
    connect(options: ImapSimpleOptions): Promise<Connection>
  }
}
