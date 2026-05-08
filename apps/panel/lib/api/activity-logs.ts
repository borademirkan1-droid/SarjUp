import { createClient } from '@/lib/supabase/client'
import { type ActivityLog, type ActivityLogInsert, type ActorType } from '@/lib/supabase/types'

export interface LogActivityParams {
  actorId: string
  actorType: ActorType
  action: string
  resourceType: string
  resourceId?: string
  details?: Record<string, unknown>
  ipAddress?: string
}

export interface GetActivityLogsParams {
  resourceType?: string
  resourceId?: string
  actorId?: string
  page?: number
  limit?: number
}

export interface ActivityLogsResult {
  data: ActivityLog[]
  count: number
}

export interface NotificationActivityItem extends ActivityLog {
  isUnread: boolean
}

export async function logActivity(params: LogActivityParams): Promise<void> {
  const supabase = createClient()
  const insert: ActivityLogInsert = {
    actor_id: params.actorId,
    actor_type: params.actorType,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId ?? null,
    details: params.details ?? null,
    ip_address: params.ipAddress ?? null,
  }

  const { error } = await supabase.from('activity_logs').insert(insert)
  if (error) {
    console.error('Activity log kaydedilemedi:', error.message)
  }
}

export async function getActivityLogs(params: GetActivityLogsParams = {}): Promise<ActivityLogsResult> {
  const supabase = createClient()
  const { resourceType, resourceId, actorId, page = 1, limit = 20 } = params

  let query = supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (resourceType) {
    query = query.eq('resource_type', resourceType)
  }
  if (resourceId) {
    query = query.eq('resource_id', resourceId)
  }
  if (actorId) {
    query = query.eq('actor_id', actorId)
  }

  const start = (page - 1) * limit
  query = query.range(start, start + limit - 1)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Aktivite logları alınamadı: ${error.message}`)
  }

  return { data: data ?? [], count: count ?? 0 }
}

export async function getNotificationActivities(limit = 8): Promise<NotificationActivityItem[]> {
  const supabase = createClient()
  const unreadSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Bildirimler alınamadı: ${error.message}`)
  }

  return (data ?? []).map((row) => ({
    ...row,
    isUnread: row.created_at >= unreadSince,
  }))
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = createClient()
  const unreadSince = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', unreadSince)

  if (error) {
    throw new Error(`Okunmamış bildirim sayısı alınamadı: ${error.message}`)
  }

  return count ?? 0
}
