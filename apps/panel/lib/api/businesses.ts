import { createClient } from '@/lib/supabase/client'
import { type Business, type BusinessInsert, type BusinessUpdate, type BusinessWithPartner } from '@/lib/supabase/types'
import { logActivity } from './activity-logs'

export interface GetBusinessesParams {
  page?: number
  limit?: number
  search?: string
  partnerId?: string
  city?: string
  type?: string
  status?: string
}

export interface BusinessesResult {
  data: BusinessWithPartner[]
  count: number
}

export async function getBusinesses(params: GetBusinessesParams = {}): Promise<BusinessesResult> {
  const supabase = createClient()
  const { page = 1, limit = 10, search, partnerId, city, type, status } = params

  let query = supabase
    .from('businesses')
    .select('*, partner:partners(id, full_name, email, phone)', { count: 'exact' })

  if (search) {
    query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`)
  }
  if (partnerId && partnerId !== 'Tümü') {
    query = query.eq('partner_id', partnerId)
  }
  if (city && city !== 'Tümü') {
    query = query.eq('city', city)
  }
  if (type && type !== 'Tümü') {
    const typeMap: Record<string, string> = {
      'Cafe': 'cafe',
      'Restoran': 'restaurant',
      'Otel': 'hotel',
      'AVM': 'mall',
      'Hastane': 'hospital',
      'Diğer': 'other',
    }
    const dbType = typeMap[type] ?? type
    query = query.eq('business_type', dbType)
  }
  if (status && status !== 'Tümü') {
    const statusMap: Record<string, string> = {
      'Aktif': 'active',
      'Pasif': 'inactive',
      'Borçlu': 'debt',
    }
    const dbStatus = statusMap[status] ?? status
    query = query.eq('status', dbStatus)
  }

  query = query.order('created_at', { ascending: false })

  const start = (page - 1) * limit
  query = query.range(start, start + limit - 1)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`İşletme listesi alınamadı: ${error.message}`)
  }

  return { data: (data ?? []) as BusinessWithPartner[], count: count ?? 0 }
}

export async function getBusinessById(id: string): Promise<BusinessWithPartner> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .select('*, partner:partners(id, full_name, email, phone)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`İşletme bulunamadı: ${error.message}`)
  }

  return data as BusinessWithPartner
}

export async function createBusiness(businessData: BusinessInsert): Promise<Business> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .insert(businessData)
    .select()
    .single()

  if (error) {
    throw new Error(`İşletme oluşturulamadı: ${error.message}`)
  }

  await logActivity({
    actorId: businessData.partner_id,
    actorType: 'admin',
    action: 'create',
    resourceType: 'business',
    resourceId: data.id,
    details: { name: data.name },
  })

  return data
}

export async function updateBusiness(id: string, businessData: BusinessUpdate): Promise<Business> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('businesses')
    .update(businessData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`İşletme güncellenemedi: ${error.message}`)
  }

  await logActivity({
    actorId: data.partner_id,
    actorType: 'admin',
    action: 'update',
    resourceType: 'business',
    resourceId: id,
    details: { updated_fields: Object.keys(businessData) },
  })

  return data
}

export async function deleteBusiness(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', id)

  if (error) {
    throw new Error(`İşletme silinemedi: ${error.message}`)
  }
}
