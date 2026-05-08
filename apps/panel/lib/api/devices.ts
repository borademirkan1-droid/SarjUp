import { createClient } from '@/lib/supabase/client'
import { type Device, type DeviceInsert, type DeviceUpdate, type DeviceWithRelations } from '@/lib/supabase/types'
import { logActivity } from './activity-logs'

export interface GetDevicesParams {
  page?: number
  limit?: number
  search?: string
  businessId?: string
  partnerId?: string
  status?: string
  batteryFilter?: string
}

export interface DevicesResult {
  data: DeviceWithRelations[]
  count: number
}

export interface DeviceStats {
  total: number
  active: number
  stock: number
  maintenance: number
  broken: number
  retired: number
}

export async function getNextDeviceSequence(year: number): Promise<number> {
  const supabase = createClient()
  const prefix = `ŞRJ-${year}-`

  const { data, error } = await supabase
    .from('devices')
    .select('device_id')
    .ilike('device_id', `${prefix}%`)
    .order('device_id', { ascending: false })
    .limit(1)

  if (error) {
    throw new Error(`Cihaz sıra numarası alınamadı: ${error.message}`)
  }

  const lastId = data?.[0]?.device_id
  if (!lastId) {
    return 1
  }

  const lastPart = lastId.split('-').pop()
  const lastNumber = Number(lastPart)

  if (Number.isNaN(lastNumber)) {
    return 1
  }

  return lastNumber + 1
}

export async function getDevices(params: GetDevicesParams = {}): Promise<DevicesResult> {
  const supabase = createClient()
  const { page = 1, limit = 15, search, businessId, partnerId, status, batteryFilter } = params

  let query = supabase
    .from('devices')
    .select('*, business:businesses(id, name, city), partner:partners(id, full_name)', { count: 'exact' })

  if (search) {
    query = query.or(`device_id.ilike.%${search}%,serial_number.ilike.%${search}%`)
  }
  if (businessId && businessId !== 'Tümü') {
    query = query.eq('business_id', businessId)
  }
  if (partnerId && partnerId !== 'Tümü') {
    query = query.eq('partner_id', partnerId)
  }
  if (status && status !== 'Tümü') {
    const statusMap: Record<string, string> = {
      'Aktif': 'active',
      'Stokta': 'stock',
      'Bakımda': 'maintenance',
      'Arızalı': 'broken',
      'Hurda': 'retired',
    }
    const dbStatus = statusMap[status] ?? status
    query = query.eq('status', dbStatus)
  }
  if (batteryFilter === 'İyi') {
    query = query.gt('battery_health', 80)
  } else if (batteryFilter === 'Orta') {
    query = query.gte('battery_health', 50).lte('battery_health', 80)
  } else if (batteryFilter === 'Düşük') {
    query = query.lt('battery_health', 50)
  }

  query = query.order('created_at', { ascending: false })

  const start = (page - 1) * limit
  query = query.range(start, start + limit - 1)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Cihaz listesi alınamadı: ${error.message}`)
  }

  return { data: (data ?? []) as DeviceWithRelations[], count: count ?? 0 }
}

export async function getDeviceById(id: string): Promise<DeviceWithRelations> {
  const supabase = createClient()
  const baseQuery = supabase
    .from('devices')
    .select('*, business:businesses(id, name, city), partner:partners(id, full_name)')

  let { data, error } = await baseQuery.eq('id', id).maybeSingle()

  if (!data) {
    const byDeviceId = await baseQuery.eq('device_id', id).maybeSingle()
    data = byDeviceId.data
    error = byDeviceId.error
  }

  if (error || !data) {
    throw new Error(`Cihaz bulunamadı: ${error?.message ?? 'Kayıt yok'}`)
  }

  return data as DeviceWithRelations
}

export async function createDevice(deviceData: DeviceInsert): Promise<Device> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('devices')
    .insert(deviceData)
    .select()
    .single()

  if (error) {
    throw new Error(`Cihaz oluşturulamadı: ${error.message}`)
  }

  await logActivity({
    actorId: data.partner_id ?? data.id,
    actorType: 'admin',
    action: 'create',
    resourceType: 'device',
    resourceId: data.id,
    details: { device_id: data.device_id, serial_number: data.serial_number },
  })

  return data
}

export async function updateDevice(id: string, deviceData: DeviceUpdate): Promise<Device> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('devices')
    .update(deviceData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Cihaz güncellenemedi: ${error.message}`)
  }

  await logActivity({
    actorId: data.partner_id ?? data.id,
    actorType: 'admin',
    action: 'update',
    resourceType: 'device',
    resourceId: id,
    details: { updated_fields: Object.keys(deviceData) },
  })

  return data
}

export async function getDeviceStats(): Promise<DeviceStats> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('devices')
    .select('status')

  if (error) {
    throw new Error(`Cihaz istatistikleri alınamadı: ${error.message}`)
  }

  const stats: DeviceStats = { total: 0, active: 0, stock: 0, maintenance: 0, broken: 0, retired: 0 }
  for (const row of (data ?? [])) {
    stats.total++
    if (row.status === 'active') stats.active++
    else if (row.status === 'stock') stats.stock++
    else if (row.status === 'maintenance') stats.maintenance++
    else if (row.status === 'broken') stats.broken++
    else if (row.status === 'retired') stats.retired++
  }

  return stats
}
