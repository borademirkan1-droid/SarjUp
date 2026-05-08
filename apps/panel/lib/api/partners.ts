import { createClient } from '@/lib/supabase/client'
import { type Partner, type PartnerInsert, type PartnerUpdate } from '@/lib/supabase/types'
import { logActivity } from './activity-logs'

export interface GetPartnersParams {
  page?: number
  limit?: number
  search?: string
  city?: string
  status?: string
  sort?: string
}

export interface PartnersResult {
  data: Partner[]
  count: number
}

export interface PartnerStats {
  total: number
  active: number
  inactive: number
  pending: number
}

export async function getPartners(params: GetPartnersParams = {}): Promise<PartnersResult> {
  const supabase = createClient()
  const { page = 1, limit = 10, search, city, status, sort = 'created_at_desc' } = params

  let query = supabase.from('partners').select('*', { count: 'exact' })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`)
  }
  if (city && city !== 'Tümü') {
    query = query.eq('city', city)
  }
  if (status && status !== 'Tümü') {
    const statusMap: Record<string, string> = {
      'Aktif': 'active',
      'Pasif': 'inactive',
      'Beklemede': 'pending',
    }
    const dbStatus = statusMap[status] ?? status
    query = query.eq('status', dbStatus)
  }

  const [sortField, sortDir] = sort === 'created_at_asc'
    ? ['created_at', 'asc' as const]
    : ['created_at', 'desc' as const]

  query = query.order(sortField, { ascending: sortDir === 'asc' })

  const start = (page - 1) * limit
  query = query.range(start, start + limit - 1)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Partner listesi alınamadı: ${error.message}`)
  }

  return { data: data ?? [], count: count ?? 0 }
}

export async function getPartnerById(id: string): Promise<Partner> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Partner bulunamadı: ${error.message}`)
  }

  return data
}

export async function createPartner(partnerData: PartnerInsert): Promise<Partner> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('partners')
    .insert(partnerData)
    .select()
    .single()

  if (error) {
    throw new Error(`Partner oluşturulamadı: ${error.message}`)
  }

  await logActivity({
    actorId: data.id,
    actorType: 'admin',
    action: 'create',
    resourceType: 'partner',
    resourceId: data.id,
    details: { full_name: data.full_name },
  })

  return data
}

export async function updatePartner(id: string, partnerData: PartnerUpdate): Promise<Partner> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('partners')
    .update(partnerData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Partner güncellenemedi: ${error.message}`)
  }

  await logActivity({
    actorId: id,
    actorType: 'admin',
    action: 'update',
    resourceType: 'partner',
    resourceId: id,
    details: { updated_fields: Object.keys(partnerData) },
  })

  return data
}

export async function deletePartner(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('partners')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`Partner silinemedi: ${error.message}`)
  }

  await logActivity({
    actorId: id,
    actorType: 'admin',
    action: 'delete',
    resourceType: 'partner',
    resourceId: id,
    details: {},
  })
}

export async function getPartnerStats(): Promise<PartnerStats> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('partners')
    .select('status')

  if (error) {
    throw new Error(`Partner istatistikleri alınamadı: ${error.message}`)
  }

  const stats: PartnerStats = { total: 0, active: 0, inactive: 0, pending: 0 }
  for (const row of (data ?? [])) {
    stats.total++
    if (row.status === 'active') stats.active++
    else if (row.status === 'inactive') stats.inactive++
    else if (row.status === 'pending') stats.pending++
  }

  return stats
}
