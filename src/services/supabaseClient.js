import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()
const fallbackUrl = 'https://example.supabase.co'
const fallbackAnonKey = 'public-anon-key'

export const supabaseConfigError =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === fallbackUrl ||
  supabaseAnonKey === fallbackAnonKey
    ? 'Supabase configuration is missing. Add your real VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.'
    : null

// Use safe placeholder values when env vars are missing so the app can render
// a helpful configuration error instead of crashing during module import.
export const supabase = createClient(
  supabaseConfigError ? fallbackUrl : supabaseUrl,
  supabaseConfigError ? fallbackAnonKey : supabaseAnonKey,
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  },
)
