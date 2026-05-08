import { createClient } from '@/lib/supabase/client'
import { type PaymentWithRelations } from '@/lib/supabase/types'

export interface DashboardStats {
  totalDevices: number
  activeDevices: number
  stockDevices: number
  totalPartners: number
  activePartners: number
  totalBusinesses: number
  activeBusinesses: number
  monthlyRevenue: number
  monthlyCommission: number
}

export interface DashboardTrends {
  devicesChangePct: number | null
  partnersChangePct: number | null
  businessesChangePct: number | null
  revenueChangePct: number | null
}

export interface MonthlyRevenueItem {
  ay: string
  gelir: number
}

export interface DeviceStatusItem {
  ad: string
  deger: number
  renk: string
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createClient()

  const [devicesRes, partnersRes, businessesRes, paymentsRes] = await Promise.all([
    supabase.from('devices').select('status'),
    supabase.from('partners').select('status'),
    supabase.from('businesses').select('status'),
    supabase.from('payments').select('amount, commission_amount, status, paid_at'),
  ])

  const devices = devicesRes.data ?? []
  const partners = partnersRes.data ?? []
  const businesses = businessesRes.data ?? []
  const payments = paymentsRes.data ?? []

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  let monthlyRevenue = 0
  let monthlyCommission = 0
  for (const p of payments) {
    if (p.status === 'completed' && p.paid_at && p.paid_at >= startOfMonth) {
      monthlyRevenue += p.amount
      monthlyCommission += p.commission_amount
    }
  }

  return {
    totalDevices: devices.length,
    activeDevices: devices.filter((d) => d.status === 'active').length,
    stockDevices: devices.filter((d) => d.status === 'stock').length,
    totalPartners: partners.length,
    activePartners: partners.filter((p) => p.status === 'active').length,
    totalBusinesses: businesses.length,
    activeBusinesses: businesses.filter((b) => b.status === 'active').length,
    monthlyRevenue,
    monthlyCommission,
  }
}

function calculatePct(current: number, previous: number): number | null {
  if (previous === 0) {
    return null
  }
  return ((current - previous) / previous) * 100
}

export async function getDashboardTrends(): Promise<DashboardTrends> {
  const supabase = createClient()
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [devicesRes, partnersRes, businessesRes, paymentsRes] = await Promise.all([
    supabase.from('devices').select('created_at'),
    supabase.from('partners').select('created_at'),
    supabase.from('businesses').select('created_at'),
    supabase.from('payments').select('amount, status, paid_at'),
  ])

  if (devicesRes.error || partnersRes.error || businessesRes.error || paymentsRes.error) {
    throw new Error('Dashboard trend verileri alınamadı.')
  }

  const countCurrentMonth = (rows: Array<{ created_at: string }>) =>
    rows.filter((row) => new Date(row.created_at) >= startOfMonth).length
  const countPrevMonth = (rows: Array<{ created_at: string }>) =>
    rows.filter((row) => {
      const date = new Date(row.created_at)
      return date >= startOfPrevMonth && date < startOfMonth
    }).length

  const devicesCurrent = countCurrentMonth(devicesRes.data ?? [])
  const devicesPrev = countPrevMonth(devicesRes.data ?? [])
  const partnersCurrent = countCurrentMonth(partnersRes.data ?? [])
  const partnersPrev = countPrevMonth(partnersRes.data ?? [])
  const businessesCurrent = countCurrentMonth(businessesRes.data ?? [])
  const businessesPrev = countPrevMonth(businessesRes.data ?? [])

  const completedPayments = (paymentsRes.data ?? []).filter((row) => row.status === 'completed' && row.paid_at)
  const revenueCurrent = completedPayments
    .filter((row) => row.paid_at && new Date(row.paid_at) >= startOfMonth)
    .reduce((sum, row) => sum + row.amount, 0)
  const revenuePrev = completedPayments
    .filter((row) => row.paid_at && new Date(row.paid_at) >= startOfPrevMonth && new Date(row.paid_at) < startOfMonth)
    .reduce((sum, row) => sum + row.amount, 0)

  return {
    devicesChangePct: calculatePct(devicesCurrent, devicesPrev),
    partnersChangePct: calculatePct(partnersCurrent, partnersPrev),
    businessesChangePct: calculatePct(businessesCurrent, businessesPrev),
    revenueChangePct: calculatePct(revenueCurrent, revenuePrev),
  }
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenueItem[]> {
  const supabase = createClient()
  const now = new Date()
  const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1).toISOString()

  const { data, error } = await supabase
    .from('payments')
    .select('amount, paid_at')
    .eq('status', 'completed')
    .gte('paid_at', twelveMonthsAgo)

  if (error) {
    throw new Error(`Aylık gelir verisi alınamadı: ${error.message}`)
  }

  const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
  const monthlyMap: Record<string, number> = {}

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = 0
  }

  for (const row of (data ?? [])) {
    if (!row.paid_at) continue
    const d = new Date(row.paid_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (key in monthlyMap) {
      monthlyMap[key] += row.amount
    }
  }

  return Object.entries(monthlyMap).map(([key, gelir]) => {
    const [, month] = key.split('-')
    return { ay: monthNames[parseInt(month, 10) - 1] ?? month, gelir }
  })
}

export async function getDeviceStatusDistribution(): Promise<DeviceStatusItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('devices')
    .select('status')

  if (error) {
    throw new Error(`Cihaz durum dağılımı alınamadı: ${error.message}`)
  }

  const counts: Record<string, number> = { active: 0, stock: 0, maintenance: 0, broken: 0, retired: 0 }
  for (const row of (data ?? [])) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }

  const labels: Record<string, { ad: string; renk: string }> = {
    active: { ad: 'Aktif', renk: '#22c55e' },
    stock: { ad: 'Stokta', renk: '#3b82f6' },
    maintenance: { ad: 'Bakımda', renk: '#f97316' },
    broken: { ad: 'Arızalı', renk: '#ef4444' },
    retired: { ad: 'Hurda', renk: '#94a3b8' },
  }

  return Object.entries(counts)
    .filter(([, deger]) => deger > 0)
    .map(([key, deger]) => ({
      ad: labels[key]?.ad ?? key,
      deger,
      renk: labels[key]?.renk ?? '#94a3b8',
    }))
}

export interface LeadStats {
  total: number
  newThisWeek: number
  converted: number
  conversionRate: number
}

export async function getLeadStats(): Promise<LeadStats> {
  const supabase = createClient()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('leads')
    .select('status, created_at')

  if (error) throw new Error(`Lead istatistikleri alınamadı: ${error.message}`)

  const leads = data ?? []
  const total = leads.length
  const newThisWeek = leads.filter((l) => l.created_at >= weekAgo).length
  const converted = leads.filter((l) => l.status === 'converted').length
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0

  return { total, newThisWeek, converted, conversionRate }
}

export interface PaymentMethodStat {
  method: string
  methodTr: string
  count: number
  total: number
}

export async function getPaymentMethodDistribution(): Promise<PaymentMethodStat[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('method, amount, status')
    .eq('status', 'completed')

  if (error) throw new Error(error.message)

  const map: Record<string, { count: number; total: number }> = {}
  for (const row of (data ?? [])) {
    if (!map[row.method]) map[row.method] = { count: 0, total: 0 }
    map[row.method]!.count++
    map[row.method]!.total += row.amount
  }

  const trMap: Record<string, string> = { iyzico: 'iyzico', bank: 'Banka', cash: 'Nakit', other: 'Diğer' }
  return Object.entries(map).map(([method, s]) => ({
    method,
    methodTr: trMap[method] ?? method,
    count: s.count,
    total: s.total,
  }))
}

export interface PartnerRevenueStat {
  partner_name: string
  revenue: number
  commission: number
  payment_count: number
}

export async function getTopPartnersByRevenue(limit = 5): Promise<PartnerRevenueStat[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('partner_id, amount, commission_amount, status, partner:partners(full_name)')
    .eq('status', 'completed')

  if (error) throw new Error(error.message)

  const map: Record<string, PartnerRevenueStat & { partner_id: string }> = {}
  for (const row of (data ?? [])) {
    const name = (row.partner as unknown as { full_name: string } | null)?.full_name ?? row.partner_id
    if (!map[row.partner_id]) {
      map[row.partner_id] = { partner_id: row.partner_id, partner_name: name, revenue: 0, commission: 0, payment_count: 0 }
    }
    map[row.partner_id]!.revenue += row.amount
    map[row.partner_id]!.commission += row.commission_amount
    map[row.partner_id]!.payment_count++
  }

  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
    .map(({ partner_id: _pid, ...rest }) => rest)
}

export interface LeadFunnelItem {
  status: string
  label: string
  count: number
  color: string
}

export async function getLeadFunnel(): Promise<LeadFunnelItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from('leads').select('status')

  if (error) throw new Error(error.message)

  const counts: Record<string, number> = {}
  for (const row of (data ?? [])) {
    counts[row.status] = (counts[row.status] ?? 0) + 1
  }

  return [
    { status: 'new', label: 'Yeni', count: counts['new'] ?? 0, color: '#3b82f6' },
    { status: 'contacted', label: 'İletişime Geçildi', count: counts['contacted'] ?? 0, color: '#f59e0b' },
    { status: 'interested', label: 'İlgileniyor', count: counts['interested'] ?? 0, color: '#8b5cf6' },
    { status: 'converted', label: 'Partner Oldu', count: counts['converted'] ?? 0, color: '#10b981' },
    { status: 'rejected', label: 'Reddedildi', count: counts['rejected'] ?? 0, color: '#ef4444' },
  ]
}

export async function getRecentTransactions(): Promise<PaymentWithRelations[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*, business:businesses(id, name), partner:partners(id, full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    throw new Error(`Son işlemler alınamadı: ${error.message}`)
  }

  return (data ?? []) as PaymentWithRelations[]
}
