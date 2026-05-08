'use client'

import { useCallback, useEffect, useState } from 'react'
import { FileText, Clock, CheckCircle, XCircle, Search, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReceiptReviewCard } from '@/components/receipts/ReceiptReviewCard'
import { getReceipts, getReceiptSignedUrl, getReceiptStats } from '@/lib/api/receipts'
import type { PaymentReceiptWithRelations, ReceiptStatus } from '@/lib/supabase/types'
import type { ReceiptStats } from '@/lib/api/receipts'

const PAGE_SIZE = 12

type FilterStatus = ReceiptStatus | 'all'

interface ReceiptWithUrl {
  receipt: PaymentReceiptWithRelations
  signedUrl: string | null
}

const paraFormatter = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 0,
})

export default function DekontlarPage() {
  const [items, setItems] = useState<ReceiptWithUrl[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterStatus>('pending')
  const [page, setPage] = useState(1)
  const [pendingCount, setPendingCount] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [stats, setStats] = useState<ReceiptStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data, count } = await getReceipts({
        status: filter,
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
      })
      const withUrls = await Promise.all(
        data.map(async (r) => ({
          receipt: r,
          signedUrl: r.payment_method === 'mail_order'
            ? null
            : await getReceiptSignedUrl(r.receipt_url),
        }))
      )
      setItems(withUrls)
      setTotalCount(count)

      if (filter !== 'pending') {
        const { count: pc } = await getReceipts({ status: 'pending', page: 1, limit: 1 })
        setPendingCount(pc)
      } else {
        setPendingCount(count)
      }
    } catch (err) {
      toast.error('Dekontlar yüklenemedi')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter, page, debouncedSearch])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    getReceiptStats()
      .then(setStats)
      .catch(() => null)
      .finally(() => setStatsLoading(false))
  }, [])

  function handleFilterChange(val: string) {
    setFilter(val as FilterStatus)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dekontlar</h2>
          <p className="text-muted-foreground">Partner ödeme dekontlarını inceleyin ve onaylayın</p>
        </div>
        {pendingCount > 0 && (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-sm px-3 py-1">
            <Clock className="mr-1 h-3 w-3" />
            {pendingCount} bekliyor
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Bekleyen</p>
            {statsLoading ? (
              <Skeleton className="mt-1 h-7 w-16" />
            ) : (
              <p className="mt-1 text-xl font-bold text-orange-600">
                {stats?.pendingCount ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Bekleyen Tutar</p>
            {statsLoading ? (
              <Skeleton className="mt-1 h-7 w-24" />
            ) : (
              <p className="mt-1 text-xl font-bold text-orange-500">
                {paraFormatter.format(stats?.pendingTotal ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Bu Ay Onaylanan</p>
            {statsLoading ? (
              <Skeleton className="mt-1 h-7 w-12" />
            ) : (
              <p className="mt-1 text-xl font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                {stats?.thisMonthApprovedCount ?? 0}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Bu Ay Onaylanan Tutar</p>
            {statsLoading ? (
              <Skeleton className="mt-1 h-7 w-24" />
            ) : (
              <p className="mt-1 text-xl font-bold text-emerald-700">
                {paraFormatter.format(stats?.thisMonthApprovedTotal ?? 0)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Partner adı ara..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs value={filter} onValueChange={handleFilterChange}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Bekliyor
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-1.5">
            <CheckCircle className="h-3.5 w-3.5" />
            Onaylanan
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-1.5">
            <XCircle className="h-3.5 w-3.5" />
            Reddedilen
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Tümü
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-muted/30 py-20 text-center">
          <FileText className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="font-medium text-muted-foreground">Bu kategoride dekont yok</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map(({ receipt, signedUrl }) => (
            <ReceiptReviewCard
              key={receipt.id}
              receipt={receipt}
              signedUrl={signedUrl}
              onRefresh={fetchData}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Toplam {totalCount} dekont</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Önceki
          </Button>
          <span className="text-sm">{page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Sonraki
          </Button>
        </div>
      </div>
    </div>
  )
}
