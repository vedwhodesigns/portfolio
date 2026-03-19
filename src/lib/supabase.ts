import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazy singletons — only instantiated on first access so the build
// doesn't throw when env vars are absent during static analysis.
let _supabase: SupabaseClient | null = null
let _supabaseAdmin: SupabaseClient | null = null

function makeProxy(getter: () => SupabaseClient): SupabaseClient {
  return new Proxy({} as SupabaseClient, {
    get: (_t, prop) => {
      const client = getter()
      const val = client[prop as keyof SupabaseClient]
      return typeof val === 'function' ? (val as Function).bind(client) : val
    },
  })
}

// Browser client
export const supabase: SupabaseClient = makeProxy(() => {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
    _supabase = createClient(url, key)
  }
  return _supabase
})

// Server/admin client (service role)
export const supabaseAdmin: SupabaseClient = makeProxy(() => {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
    _supabaseAdmin = createClient(url, key)
  }
  return _supabaseAdmin
})

// ── Database types ─────────────────────────────────────────

export interface DBFolder {
  id: string
  name: string
  parent_id: string | null
  icon_url: string | null
  created_at: string
}

export interface DBFile {
  id: string
  name: string
  kind: 'Image' | 'Video' | 'PDF' | 'Application' | 'Folder'
  file_url: string
  thumbnail_url: string | null
  icon_url: string | null
  folder_id: string | null
  size: string | null
  date_modified: string
  created_at: string
  tags?: DBTag[]
}

export interface DBTag {
  id: string
  name: string
  color: string | null
}

export interface DBTrack {
  id: string
  title: string
  artist: string
  duration: number
  url: string
  album_art: string | null
  sort_order: number
  created_at: string
}
