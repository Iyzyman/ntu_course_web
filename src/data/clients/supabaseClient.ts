import { env } from '@/env'
import { createClient } from '@supabase/supabase-js'

export const supabaseClient = createClient(
  env.VITE_SUPABASE_URL,
  env.VITE_SUPABASE_KEY,
)
