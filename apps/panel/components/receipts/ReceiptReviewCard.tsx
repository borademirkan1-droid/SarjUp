'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import {
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  ExternalLink,
  FileText,
  User,
  Cpu,
  CalendarDays,
  MessageSquare,
  Bot,
  AlertTriangle,
  EyeOff,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { approveReceipt, rejectReceipt } from '@/lib/actions/receipts'
import { formatCurrencyTRY, formatDateTR } from '@/lib/format'
import type { PaymentReceiptWithRelations } from '@/lib/supabase/types'

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending') {
    return (
      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
        <Clock className="mr-1 h-3 w-3" />
        Bekliyor
      </Badge>
    )
  }
  if (status === 'approved') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
        <CheckCircle className="mr-1 h-3 w-3" />
        Onaylandı
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
      <XCircle className="mr-1 h-3 w-3" />
      Reddedildi
    </Badge>
  )
}

function AIAnalysisSection({ receipt }: { receipt: PaymentReceiptWithRelations }) {
  const { ai_status, ai_confidence, ai_extracted_amount, amount, ai_analysis_notes } = receipt

  // Analiz tamamlandı, yüksek güven — otomatik onaylandı
  if (ai_status === 'done' && ai_confidence === 'high') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm">
        <Bot className="h-4 w-4 shrink-0 text-emerald-600" />
        <span className="font-medium text-emerald-700">AI Onayladı</span>
        <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
        {ai_extracted_amount != null && (
          <span className="ml-auto text-xs text-emerald-600">
            Okunan: {ai_extracted_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
          </span>
        )}
      </div>
    )
  }

  // Analiz tamamlandı, düşük güven — tutar uyuşmazlığı
  if (ai_status === 'done' && ai_confidence === 'low') {
    const extracted = ai_extracted_amount != null
      ? ai_extracted_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
      : '?'
    const declared = amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })

    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
          <span className="font-medium text-amber-700">AI: Tutar Uyuşmazlığı</span>
        </div>
        <p className="mt-1 text-xs text-amber-600">
          Dekont: {extracted} TL &mdash; Girilen: {declared} TL
        </p>
        {ai_analysis_notes && (
          <p className="mt-0.5 text-xs text-amber-500">{ai_analysis_notes}</p>
        )}
      </div>
    )
  }

  // AI okuyamadı
  if (ai_status === 'failed') {
    return (
      <div className="flex items-center gap-2 rounded-md border border-muted bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
        <EyeOff className="h-4 w-4 shrink-0" />
        <span>AI okuyamadı &mdash; Manuel incele</span>
      </div>
    )
  }

  // Analiz bekleniyor (pending veya null)
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>AI analizi bekleniyor...</span>
    </div>
  )
}

interface ReceiptReviewCardProps {
  receipt: PaymentReceiptWithRelations
  signedUrl: string | null
  onRefresh: () => void
}

export function ReceiptReviewCard({ receipt, signedUrl, onRefresh }: ReceiptReviewCardProps) {
  const [isPending, startTransition] = useTransition()
  const [approveOpen, setApproveOpen] = useState(false)
  const [adminNote, setAdminNote] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const isPdf =
    receipt.receipt_url.toLowerCase().includes('.pdf') ||
    receipt.receipt_filename?.toLowerCase().endsWith('.pdf')

  function handleApprove() {
    startTransition(async () => {
      const result = await approveReceipt(receipt.id, adminNote || undefined)
      if (result.success) {
        toast.success('Dekont onaylandı. NFC token üretimi başlatıldı.')
        setApproveOpen(false)
        setAdminNote('')
        onRefresh()
      } else {
        toast.error(result.error ?? 'Onaylama başarısız.')
      }
    })
  }

  function handleReject() {
    if (!rejectReason.trim()) {
      toast.warning('Red gerekçesi zorunludur.')
      return
    }
    startTransition(async () => {
      const result = await rejectReceipt(receipt.id, rejectReason)
      if (result.success) {
        toast.success('Dekont reddedildi.')
        setRejectOpen(false)
        setRejectReason('')
        onRefresh()
      } else {
        toast.error(result.error ?? 'Red işlemi başarısız.')
      }
    })
  }

  return (
    <Card className="overflow-hidden">
      <div
        className={`h-1 w-full ${
          receipt.status === 'pending'
            ? 'bg-orange-400'
            : receipt.status === 'approved'
              ? 'bg-emerald-500'
              : 'bg-red-500'
        }`}
      />

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-mono text-xs text-muted-foreground">
              #{receipt.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-lg font-bold">{formatCurrencyTRY(receipt.amount)}</p>
          </div>
          <StatusBadge status={receipt.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span className="font-medium text-foreground">
              {receipt.partner?.full_name ?? '—'}
            </span>
            <span>{receipt.partner?.phone ?? ''}</span>
          </div>

          {receipt.device && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cpu className="h-4 w-4 shrink-0" />
              <span>
                Cihaz:{' '}
                <span className="font-medium text-foreground">{receipt.device.device_id}</span>
                {' '}/ SN: {receipt.device.serial_number}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>Yüklenme: {formatDateTR(receipt.created_at)}</span>
          </div>

          {receipt.reviewed_at && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>İnceleme: {formatDateTR(receipt.reviewed_at)}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="rounded-lg border bg-muted/40 p-2">
          {receipt.payment_method === 'mail_order' ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <CreditCard className="h-10 w-10 text-blue-500" />
              <p className="text-sm font-medium text-blue-700">iyzico Mail Order</p>
              <p className="text-xs text-muted-foreground">Kart ödemesi — dekont yok</p>
              {receipt.receipt_filename && (
                <p className="font-mono text-xs text-muted-foreground break-all text-center px-2">
                  {receipt.receipt_filename}
                </p>
              )}
            </div>
          ) : isPdf ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">PDF Dekont</p>
              {signedUrl ? (
                <a
                  href={signedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: 'outline', size: 'sm' })}
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  PDF Aç
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">URL yüklenemedi</p>
              )}
            </div>
          ) : signedUrl ? (
            <div className="relative">
              <a href={signedUrl} target="_blank" rel="noopener noreferrer">
                <div className="relative h-48 w-full overflow-hidden rounded">
                  <Image
                    src={signedUrl}
                    alt="Dekont görseli"
                    fill
                    className="object-cover transition-opacity hover:opacity-90"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  Tam boyut için tıklayın
                </div>
              </a>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-4">
              <FileText className="h-10 w-10 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Görsel yüklenemedi</p>
            </div>
          )}
        </div>

        <AIAnalysisSection receipt={receipt} />

        {receipt.rejection_reason && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
            <p className="mb-1 font-semibold text-red-700">Red Gerekçesi</p>
            <p className="text-red-600">{receipt.rejection_reason}</p>
          </div>
        )}

        {receipt.admin_note && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm">
            <div className="mb-1 flex items-center gap-1 font-semibold text-blue-700">
              <MessageSquare className="h-3 w-3" />
              Admin Notu
            </div>
            <p className="text-blue-600">{receipt.admin_note}</p>
          </div>
        )}
      </CardContent>

      {receipt.status === 'pending' && (
        <CardFooter className="flex gap-2 border-t pt-4">
          <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
            <DialogTrigger asChild>
              <Button
                className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
                disabled={isPending}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Onayla
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dekontu Onayla</DialogTitle>
                <DialogDescription>
                  {receipt.partner?.full_name} partnerin{' '}
                  <strong>{formatCurrencyTRY(receipt.amount)}</strong> tutarındaki dekontunu
                  onaylıyorsunuz.
                  {receipt.device_id
                    ? ' Onay sonrası NFC token üretimi otomatik başlar.'
                    : ' (Cihaz bağlı değil — NFC token üretilmeyecek.)'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="admin-note">Admin Notu (opsiyonel)</Label>
                <Textarea
                  id="admin-note"
                  placeholder="Partnere veya kendinize not bırakabilirsiniz..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setApproveOpen(false)} disabled={isPending}>
                  Vazgeç
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleApprove}
                  disabled={isPending}
                >
                  {isPending ? 'İşleniyor...' : 'Evet, Onayla'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex-1" disabled={isPending}>
                <XCircle className="mr-2 h-4 w-4" />
                Reddet
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Dekontu Reddet</DialogTitle>
                <DialogDescription>
                  Red gerekçesi partnere iletilecektir. Lütfen açık bir açıklama yazın.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <Label htmlFor="reject-reason">
                  Red Gerekçesi <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-reason"
                  placeholder="Örn: Dekont tutarı uyumsuz, görüntü okunaksız..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setRejectOpen(false)} disabled={isPending}>
                  Vazgeç
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isPending || !rejectReason.trim()}
                >
                  {isPending ? 'İşleniyor...' : 'Reddet'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  )
}
