import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// .env에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY가 비어 있어도
// 지도/마커 조회 등 로그인 없이 쓰는 기능은 계속 동작해야 하므로,
// 설정이 없으면 null을 두고 인증 관련 기능만 비활성화한다.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
