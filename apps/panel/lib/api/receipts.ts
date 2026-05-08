'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  PaymentReceiptWithRelations,
  ReceiptStatus,
} from '@/lib/supabase/types'

export async function getReceipts(opts: {
  status?: ReceiptStatus | 'all'
  page?: number
  limit?: number
  search?: string
}): Promise<{ data: PaymentReceiptWithRelations[]; count: number }> {
  const supabase = createClient()
  const page = opts.page ?? 1
  const limit = opts.limit ?? 15
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('payment_receipts')
    .select(
      `*, partner:partners(id, full_name, email, phone), device:devices(id, device_id, serial_number)`,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(from, to)

  if (opts.status && opts.status !== 'all') {
    query = query.eq('status', opts.status)
  }

  if (opts.search?.trim()) {
    const { data: matched } = await supabase
      .from('partners')
      .select('id')
      .ilike('full_name', `%${opts.search.trim()}%`)
    const ids = (matched ?? []).map((p: { id: string }) => p.id)
    if (ids.length === 0) return { data: [], count: 0 }
    query = query.in('partner_id', ids)
  }

  const { data, error, count } = await query
  if (error) throw new Error(error.message)

  return {
    data: (data ?? []) as PaymentReceiptWithRelations[],
    count: count ?? 0,
  }
}

export interface ReceiptStats {
  pendingCount: number
  pendingTotal: number
  thisMonthApprovedCount: number
  thisMonthApprovedTotal: number
}

export async function getReceiptStats(): Promise<ReceiptStats> {
  const supabase = createClient()
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const { data, error } = await supabase
    .from('payment_receipts')
    .select('status, amount, reviewed_at')

  if (error) throw new Error(error.message)

  const rows = data ?? []
  const pending = rows.filter((r) => r.status === 'pending')
  const approvedThisMonth = rows.filter(
    (r) => r.status === 'approved' && r.reviewed_at && r.reviewed_at >= startOfMonth
  )

  return {
    pendingCount: pending.length,
    pendingTotal: pending.reduce((s, r) => s + (r.amount as number), 0),
    thisMonthApprovedCount: approvedThisMonth.length,
    thisMonthApprovedTotal: approvedThisMonth.reduce((s, r) => s + (r.amount as number), 0),
  }
}

export async function getPendingReceiptCount(): Promise<number> {
  const supabase = createClient()
  const { count, error } = await supabase
    .from('payment_receipts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  if (error) return 0
  return count ?? 0
}

export async function getReceiptSignedUrl(receiptUrl: string): Promise<string | null> {
  const supabase = createClient()
  const path = receiptUrl.replace(/^.*\/storage\/v1\/object\/private\/receipts\//, '')

  const { data, error } = await supabase.storage
    .from('receipts')
    .createSignedUrl(path, 3600)

  if (error) return null
  return data.signedUrl
}
