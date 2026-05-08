import { createClient } from '@/lib/supabase/client'
import { type Payment, type PaymentInsert, type PaymentStatus, type PaymentWithRelations } from '@/lib/supabase/types'
import { logActivity } from './activity-logs'

export interface GetPaymentsParams {
  page?: number
  limit?: number
  dateFrom?: string
  dateTo?: string
  partnerId?: string
  businessId?: string
  status?: string
  method?: string
  minAmount?: number
  maxAmount?: number
}

export interface PaymentsResult {
  data: PaymentWithRelations[]
  count: number
}

export interface PaymentStats {
  monthlyTotal: number
  pending: number
  overdue: number
  commission: number
  pendingCount: number
  overdueCount: number
}

export async function getPayments(params: GetPaymentsParams = {}): Promise<PaymentsResult> {
  const supabase = createClient()
  const { page = 1, limit = 15, dateFrom, dateTo, partnerId, businessId, status, method, minAmount, maxAmount } = params

  let query = supabase
    .from('payments')
    .select('*, business:businesses(id, name), partner:partners(id, full_name)', { count: 'exact' })

  if (dateFrom) {
    query = query.gte('created_at', `${dateFrom}T00:00:00`)
  }
  if (dateTo) {
    query = query.lte('created_at', `${dateTo}T23:59:59`)
  }
  if (partnerId && partnerId !== 'Tümü') {
    query = query.eq('partner_id', partnerId)
  }
  if (businessId && businessId !== 'Tümü') {
    query = query.eq('business_id', businessId)
  }
  if (status && status !== 'Tümü') {
    const statusMap: Record<string, string> = {
      'Tamamlandı': 'completed',
      'Bekliyor': 'pending',
      'İptal': 'failed',
      'İade': 'refunded',
    }
    const dbStatus = statusMap[status] ?? status
    query = query.eq('status', dbStatus)
  }
  if (method && method !== 'Tümü') {
    const methodMap: Record<string, string> = {
      'iyzico': 'iyzico',
      'Banka': 'bank',
      'Nakit': 'cash',
      'Diğer': 'other',
    }
    const dbMethod = methodMap[method] ?? method
    query = query.eq('method', dbMethod)
  }
  if (minAmount !== undefined) {
    query = query.gte('amount', minAmount)
  }
  if (maxAmount !== undefined) {
    query = query.lte('amount', maxAmount)
  }

  query = query.order('created_at', { ascending: false })

  const start = (page - 1) * limit
  query = query.range(start, start + limit - 1)

  const { data, count, error } = await query

  if (error) {
    throw new Error(`Ödeme listesi alınamadı: ${error.message}`)
  }

  return { data: (data ?? []) as PaymentWithRelations[], count: count ?? 0 }
}

export async function getPaymentById(id: string): Promise<PaymentWithRelations> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*, business:businesses(id, name), partner:partners(id, full_name)')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Ödeme bulunamadı: ${error.message}`)
  }

  return data as PaymentWithRelations
}

export async function createPayment(paymentData: PaymentInsert): Promise<Payment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()

  if (error) {
    throw new Error(`Ödeme oluşturulamadı: ${error.message}`)
  }

  await logActivity({
    actorId: paymentData.partner_id,
    actorType: 'admin',
    action: 'create',
    resourceType: 'payment',
    resourceId: data.id,
    details: { transaction_no: data.transaction_no, amount: data.amount },
  })

  return data
}

export async function updatePaymentStatus(id: string, status: PaymentStatus): Promise<Payment> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .update({ status, paid_at: status === 'completed' ? new Date().toISOString() : undefined })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Ödeme durumu güncellenemedi: ${error.message}`)
  }

  await logActivity({
    actorId: data.partner_id,
    actorType: 'admin',
    action: 'update_status',
    resourceType: 'payment',
    resourceId: id,
    details: { new_status: status },
  })

  return data
}

export async function getPaymentStats(): Promise<PaymentStats> {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('payments')
    .select('status, amount, commission_amount, created_at, paid_at')

  if (error) {
    throw new Error(`Ödeme istatistikleri alınamadı: ${error.message}`)
  }

  const rows = data ?? []
  let monthlyTotal = 0
  let pending = 0
  let pendingCount = 0
  let overdue = 0
  let overdueCount = 0
  let commission = 0

  for (const row of rows) {
    if (row.status === 'completed' && row.paid_at && row.paid_at >= startOfMonth) {
      monthlyTotal += row.amount
      commission += row.commission_amount
    }
    if (row.status === 'pending') {
      pending += row.amount
      pendingCount++
      if (row.created_at < twoWeeksAgo) {
        overdue += row.amount
        overdueCount++
      }
    }
  }

  return { monthlyTotal, pending, overdue, commission, pendingCount, overdueCount }
}
