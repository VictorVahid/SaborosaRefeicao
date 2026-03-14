import { createClient } from '@supabase/supabase-js';

// Pegamos as variáveis do seu arquivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);