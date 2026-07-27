import { supabase } from '@/lib/supabaseClient'

const NOT_CONFIGURED_ERROR = 'Supabase 환경변수가 설정되지 않았습니다.'

export interface VisitNote {
  visited: boolean
  impression: string
}

export async function fetchVisitNote(
  userId: string,
  placeName: string,
  address: string,
): Promise<{ data: VisitNote | null; error: string | null }> {
  if (!supabase) return { data: null, error: NOT_CONFIGURED_ERROR }

  const { data, error } = await supabase
    .from('visit_notes')
    .select('visited, impression')
    .eq('user_id', userId)
    .eq('place_name', placeName)
    .eq('address', address)
    .maybeSingle()

  if (error) return { data: null, error: error.message }

  return {
    data: data ? { visited: data.visited, impression: data.impression ?? '' } : null,
    error: null,
  }
}

export interface VisitedCafeRecord {
  placeName: string
  address: string
  lat: number | null
  lng: number | null
  impression: string
}

export function buildVisitKey(placeName: string, address: string): string {
  return `${placeName}__${address}`
}

export async function fetchVisitedNotes(
  userId: string,
): Promise<{ data: VisitedCafeRecord[]; error: string | null }> {
  if (!supabase) return { data: [], error: NOT_CONFIGURED_ERROR }

  const { data, error } = await supabase
    .from('visit_notes')
    .select('place_name, address, lat, lng, impression')
    .eq('user_id', userId)
    .eq('visited', true)
    .order('updated_at', { ascending: false })

  if (error) return { data: [], error: error.message }

  return {
    data: (data ?? []).map((row) => ({
      placeName: row.place_name,
      address: row.address,
      lat: row.lat,
      lng: row.lng,
      impression: row.impression ?? '',
    })),
    error: null,
  }
}

export async function saveVisitNote(params: {
  userId: string
  placeName: string
  address: string
  lat: number | null
  lng: number | null
  visited: boolean
  impression: string
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: NOT_CONFIGURED_ERROR }

  const { error } = await supabase.from('visit_notes').upsert(
    {
      user_id: params.userId,
      place_name: params.placeName,
      address: params.address,
      lat: params.lat,
      lng: params.lng,
      visited: params.visited,
      impression: params.impression,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,place_name,address' },
  )

  return { error: error?.message ?? null }
}
