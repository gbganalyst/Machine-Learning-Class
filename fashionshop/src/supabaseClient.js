import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'YOUR_SUPABASE_URL') {
    console.warn('Supabase credentials not found. Please update your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
