import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Browser client using standard anonymous keys
export const supabaseBrowserClient = createClient(supabaseUrl, supabaseAnonKey)

// Server client bypassing Row Level Security, meant for backend/API use only
export const getSupabaseServerClient = () => {
    if (!supabaseServiceKey) {
        throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
    }
    return createClient(supabaseUrl, supabaseServiceKey)
}
