"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getMonthlyRevenue,
  getDashboardStats,
  getDeviceStatusDistribution,
  getPaymentMethodDistribution,
  getTopPartnersByRevenue,
  getLeadFunnel,
} from "@/lib/api/dashboard";
import type {
  MonthlyRevenueItem,
  DeviceStatusItem,
  DashboardStats,
  PaymentMethodStat,
  PartnerRevenueStat,
  LeadFunnelItem,
} from "@/lib/api/dashboard";
import { exportRaporExcel } from "@/lib/export-utils";

const paraFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const DEVICE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#94a3b8"];

export default function RaporlarPage() {
  const [gelirVerisi, setGelirVerisi] = useState<MonthlyRevenueItem[]>([]);
  const [cihazDurum, setCihazDurum] = useState<DeviceStatusItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [odemeYontemleri, setOdemeYontemleri] = useState<PaymentMethodStat[]>([]);
  const [topPartners, setTopPartners] = useState<PartnerRevenueStat[]>([]);
  const [leadFunnel, setLeadFunnel] = useState<LeadFunnelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("12");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [gelir, cihaz, dashStats, odeme, partners, funnel] = await Promise.all([
          getMonthlyRevenue(),
          getDeviceStatusDistribution(),
          getDashboardStats(),
          getPaymentMethodDistribution(),
          getTopPartnersByRevenue(10),
          getLeadFunnel(),
        ]);
        setGelirVerisi(gelir);
        setCihazDurum(cihaz);
        setStats(dashStats);
        setOdemeYontemleri(odeme);
        setTopPartners(partners);
        setLeadFunnel(funnel);
      } catch {
        toast.error("Rapor verileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredGelir = gelirVerisi.slice(-Number(period));

  const totalRevenue = filteredGelir.reduce((acc, item) => acc + item.gelir, 0);
  const avgRevenue = filteredGelir.length > 0 ? totalRevenue / filteredGelir.length : 0;
  const maxRevenue = filteredGelir.length > 0 ? Math.max(...filteredGelir.map((i) => i.gelir)) : 0;

  function handleExport() {
    setExporting(true);
    try {
      exportRaporExcel({
        gelir: filteredGelir,
        odemeYontemleri: odemeYontemleri.map((o) => ({
          methodTr: o.methodTr,
          count: o.count,
          total: o.total,
        })),
        topPartners,
        leadFunnel: leadFunnel.map((l) => ({ label: l.label, count: l.count })),
      });
    } catch {
      toast.error("Excel oluşturulamadı");
    } finally {
      setExporting(false);
    }
  }

  const maxPartnerRevenue = topPartners.length > 0 ? topPartners[0]!.revenue : 1;
  const totalLeads = leadFunnel.reduce((a, b) => a + b.count, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Raporlar</h2>
          <p className="text-muted-foreground">Detaylı analiz ve raporlar</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Son 3 Ay</SelectItem>
              <SelectItem value="6">Son 6 Ay</SelectItem>
              <SelectItem value="12">Son 12 Ay</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || exporting}
          >
            <Download className="mr-1.5 h-4 w-4" />
            Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Toplam Gelir</p>
            <p className="mt-1 text-2xl font-bold text-blue-700">
              {loading ? <Skeleton className="h-8 w-28 inline-block" /> : paraFormatter.format(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Aylık Ortalama</p>
            <p className="mt-1 text-2xl font-bold text-emerald-700">
              {loading ? <Skeleton className="h-8 w-28 inline-block" /> : paraFormatter.format(avgRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">En Yüksek Ay</p>
            <p className="mt-1 text-2xl font-bold text-orange-600">
              {loading ? <Skeleton className="h-8 w-28 inline-block" /> : paraFormatter.format(maxRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Aylık Gelir Trendi</CardTitle></CardHeader>
          <CardContent className="h-80">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={filteredGelir}>
                  <defs>
                    <linearGradient id="gelirGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="ay" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => paraFormatter.format(Number(v))} />
                  <Area type="monotone" dataKey="gelir" stroke="#2563eb" strokeWidth={2} fill="url(#gelirGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Aylık Gelir Karşılaştırması</CardTitle></CardHeader>
          <CardContent className="h-80">
            {loading ? <Skeleton className="h-full w-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredGelir}>
                  <XAxis dataKey="ay" />
                  <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v) => paraFormatter.format(Number(v))} />
                  <Bar dataKey="gelir" name="Gelir" radius={[4, 4, 0, 0]}>
                    {filteredGelir.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 3}, 80%, ${55 - index * 1.5}%)`} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cihaz Durumu Dağılımı</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <div className="space-y-3">
                {cihazDurum.map((item, i) => {
                  const total = cihazDurum.reduce((a, b) => a + b.deger, 0);
                  const pct = total > 0 ? (item.deger / total) * 100 : 0;
                  return (
                    <div key={item.ad}>
                      <div className="flex justify-between text-sm">
                        <span>{item.ad}</span>
                        <span className="font-medium">{item.deger} cihaz (%{pct.toFixed(1)})</span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Genel Özet</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : stats ? (
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Toplam Cihaz</span><span className="font-semibold">{stats.totalDevices}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Aktif Cihaz</span><span className="font-semibold text-emerald-700">{stats.activeDevices}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Toplam Partner</span><span className="font-semibold">{stats.totalPartners}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Aktif Partner</span><span className="font-semibold text-emerald-700">{stats.activePartners}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground">Toplam İşletme</span><span className="font-semibold">{stats.totalBusinesses}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Aktif İşletme</span><span className="font-semibold text-emerald-700">{stats.activeBusinesses}</span></div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Ödeme Yöntemi Dağılımı</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : odemeYontemleri.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Henüz tamamlanan ödeme yok</p>
            ) : (
              <div className="space-y-3">
                {odemeYontemleri.map((item, i) => {
                  const totalCount = odemeYontemleri.reduce((a, b) => a + b.count, 0);
                  const pct = totalCount > 0 ? (item.count / totalCount) * 100 : 0;
                  return (
                    <div key={item.method}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{item.methodTr}</span>
                        <span className="text-muted-foreground">
                          {item.count} işlem · {paraFormatter.format(item.total)}
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Lead Hunisi</CardTitle></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : (
              <div className="space-y-2.5">
                {leadFunnel.map((stage) => {
                  const pct = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0;
                  return (
                    <div key={stage.status}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{stage.label}</span>
                        <span className="font-medium">{stage.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: stage.color }}
                        />
                      </div>
                    </div>
                  );
                })}
                {totalLeads > 0 && (
                  <p className="pt-1 text-xs text-muted-foreground text-right">
                    Toplam {totalLeads} başvuru
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Partnerler (Gelire Göre)</CardTitle></CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-64 w-full" /> : topPartners.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Henüz tamamlanan ödeme yok</p>
          ) : (
            <div className="space-y-3">
              {topPartners.map((partner, i) => {
                const pct = (partner.revenue / maxPartnerRevenue) * 100;
                return (
                  <div key={partner.partner_name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                    <span className="w-5 text-center text-sm font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-sm font-medium">{partner.partner_name}</span>
                        <span className="text-sm font-bold text-emerald-700">
                          {paraFormatter.format(partner.revenue)}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted">
                        <div
                          className="h-1.5 rounded-full bg-emerald-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {partner.payment_count} işlem
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
