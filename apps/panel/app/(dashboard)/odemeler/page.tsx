"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarIcon, Search, Wallet } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPayments, getPaymentStats, updatePaymentStatus } from "@/lib/api/payments";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import type { PaymentWithRelations, PaymentStatus } from "@/lib/supabase/types";

const PAGE_SIZE = 15;

const statusMapToTr: Record<string, string> = {
  completed: "Tamamlandı",
  pending: "Bekliyor",
  failed: "İptal",
  refunded: "İade",
};

const methodMapToTr: Record<string, string> = {
  iyzico: "iyzico",
  bank: "Banka",
  cash: "Nakit",
  other: "Diğer",
};

function durumClass(status: string) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (status === "pending") return "bg-orange-100 text-orange-700 hover:bg-orange-100";
  if (status === "failed") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
}

interface Stats {
  monthlyTotal: number;
  pending: number;
  commission: number;
  pendingCount: number;
}

export default function OdemelerPage() {
  const [payments, setPayments] = useState<PaymentWithRelations[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("Tümü");
  const [yontem, setYontem] = useState("Tümü");
  const [baslangicTarih, setBaslangicTarih] = useState("");
  const [bitisTarih, setBitisTarih] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [payResult, statsResult] = await Promise.all([
        getPayments({
          page,
          limit: PAGE_SIZE,
          status: durum !== "Tümü" ? durum : undefined,
          method: yontem !== "Tümü" ? yontem : undefined,
          dateFrom: baslangicTarih || undefined,
          dateTo: bitisTarih || undefined,
        }),
        getPaymentStats(),
      ]);
      setPayments(payResult.data);
      setTotalCount(payResult.count);
      setStats(statsResult);
    } catch (err) {
      toast.error("Ödeme listesi yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, durum, yontem, baslangicTarih, bitisTarih]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function handleStatusChange(id: string, newStatus: string) {
    try {
      await updatePaymentStatus(id, newStatus as PaymentStatus);
      toast.success("Ödeme durumu güncellendi");
      fetchData();
    } catch {
      toast.error("Durum güncellenemedi");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ödemeler</h2>
        <p className="text-muted-foreground">Tüm finansal işlemleri buradan takip edin</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            baslik: "Bu Ay Toplam",
            deger: stats ? formatCurrencyTRY(stats.monthlyTotal) : "—",
            renk: "text-emerald-700",
          },
          {
            baslik: "Bekleyen Ödemeler",
            deger: stats ? `${stats.pendingCount} işlem` : "—",
            alt: stats ? formatCurrencyTRY(stats.pending) : "",
            renk: "text-orange-600",
          },
          {
            baslik: "Toplam Komisyon",
            deger: stats ? formatCurrencyTRY(stats.commission) : "—",
            renk: "text-blue-600",
          },
        ].map((kart) => (
          <Card key={kart.baslik}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{kart.baslik}</p>
              <p className={`mt-1 text-2xl font-bold ${kart.renk}`}>{kart.deger}</p>
              {kart.alt ? <p className="text-xs text-muted-foreground">{kart.alt}</p> : null}
            </CardContent>
          </Card>
        ))}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Toplam İşlem</p>
            <p className="mt-1 text-2xl font-bold">{loading ? "—" : totalCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="İşlem No, partner..." value={arama} onChange={(e) => { setArama(e.target.value); setPage(1); }} />
            </div>
            <Select value={durum} onValueChange={(v) => { setDurum(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tümü">Tümü</SelectItem>
                <SelectItem value="Tamamlandı">Tamamlandı</SelectItem>
                <SelectItem value="Bekliyor">Bekliyor</SelectItem>
                <SelectItem value="İptal">İptal</SelectItem>
                <SelectItem value="İade">İade</SelectItem>
              </SelectContent>
            </Select>
            <Select value={yontem} onValueChange={(v) => { setYontem(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Ödeme Yöntemi" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tümü">Tümü</SelectItem>
                <SelectItem value="iyzico">iyzico</SelectItem>
                <SelectItem value="Banka">Banka</SelectItem>
                <SelectItem value="Nakit">Nakit</SelectItem>
                <SelectItem value="Diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input type="date" value={baslangicTarih} onChange={(e) => setBaslangicTarih(e.target.value)} className="text-sm" />
              <span className="shrink-0 text-muted-foreground">-</span>
              <Input type="date" value={bitisTarih} onChange={(e) => setBitisTarih(e.target.value)} className="text-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead>İşlem No</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>İşletme</TableHead>
                  <TableHead>Tutar</TableHead>
                  <TableHead>Komisyon</TableHead>
                  <TableHead>Net Tutar</TableHead>
                  <TableHead>Yöntem</TableHead>
                  <TableHead>Ödeme Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 10 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                    ))
                  : payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10}>
                        <EmptyState icon={Wallet} title="Ödeme kaydı bulunamadı" description="Filtrelerinize uygun bir ödeme kaydı yok." />
                      </TableCell>
                    </TableRow>
                  ) : payments.map((pay) => (
                      <TableRow key={pay.id}>
                        <TableCell className="font-mono text-xs">{pay.transaction_no}</TableCell>
                        <TableCell>{pay.partner?.full_name ?? "-"}</TableCell>
                        <TableCell>{pay.business?.name ?? "-"}</TableCell>
                        <TableCell className="font-semibold">{formatCurrencyTRY(pay.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{formatCurrencyTRY(pay.commission_amount)}</TableCell>
                        <TableCell className="font-semibold text-emerald-700">{formatCurrencyTRY(pay.net_amount)}</TableCell>
                        <TableCell>{methodMapToTr[pay.method] ?? pay.method}</TableCell>
                        <TableCell>{pay.paid_at ? formatDateTR(pay.paid_at) : "-"}</TableCell>
                        <TableCell><Badge className={durumClass(pay.status)}>{statusMapToTr[pay.status] ?? pay.status}</Badge></TableCell>
                        <TableCell>
                          {pay.status === "pending" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => handleStatusChange(pay.id, "completed")}
                            >
                              Onayla
                            </Button>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Toplam {totalCount} işlem</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Önceki</Button>
              <span className="text-sm">{page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sonraki</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
