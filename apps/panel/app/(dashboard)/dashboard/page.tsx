"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Area,
  AreaChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  FileText,
  Inbox,
  Smartphone,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { getDashboardStats, getDashboardTrends, getMonthlyRevenue, getDeviceStatusDistribution, getRecentTransactions, getLeadStats } from "@/lib/api/dashboard";
import type { DashboardStats, DashboardTrends, MonthlyRevenueItem, DeviceStatusItem, LeadStats } from "@/lib/api/dashboard";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import type { PaymentWithRelations } from "@/lib/supabase/types";

const paymentStatusTr: Record<string, string> = {
  completed: "Tamamlandı",
  pending: "Bekliyor",
  failed: "İptal",
  refunded: "İade",
};

function durumRozeti(durum: string) {
  if (durum === "completed" || durum === "Tamamlandı") {
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Tamamlandı</Badge>;
  }
  if (durum === "pending" || durum === "Bekliyor") {
    return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Bekliyor</Badge>;
  }
  return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">{paymentStatusTr[durum] ?? durum}</Badge>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [gelirVerisi, setGelirVerisi] = useState<MonthlyRevenueItem[]>([]);
  const [cihazDurumuVerisi, setCihazDurumuVerisi] = useState<DeviceStatusItem[]>([]);
  const [islemler, setIslemler] = useState<PaymentWithRelations[]>([]);
  const [leadStats, setLeadStats] = useState<LeadStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, trendData, gelir, cihazDurum, sonIslemler, leadStatsData] = await Promise.all([
          getDashboardStats(),
          getDashboardTrends(),
          getMonthlyRevenue(),
          getDeviceStatusDistribution(),
          getRecentTransactions(),
          getLeadStats(),
        ]);
        setStats(statsData);
        setTrends(trendData);
        setGelirVerisi(gelir);
        setCihazDurumuVerisi(cihazDurum);
        setIslemler(sonIslemler);
        setLeadStats(leadStatsData);
      } catch (err) {
        toast.error("Dashboard verileri yüklenemedi");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function getTrendLabel(value: number | null) {
    if (value === null) {
      return "İlk ay";
    }
    const sign = value > 0 ? "+" : "";
    return `Geçen aya göre ${sign}${value.toFixed(1)}%`;
  }

  const hasAnyData = !!stats && (stats.totalDevices > 0 || stats.totalPartners > 0 || stats.totalBusinesses > 0);

  const istatistikler = stats
    ? [
        {
          baslik: "TOPLAM CİHAZ",
          deger: String(stats.totalDevices),
          alt: `Aktif: ${stats.activeDevices} | Stokta: ${stats.stockDevices}`,
          trend: trends ? getTrendLabel(trends.devicesChangePct) : null,
          ikon: Smartphone,
          arkaPlan: "bg-gradient-to-br from-blue-500 to-blue-700",
        },
        {
          baslik: "AKTİF PARTNER",
          deger: String(stats.activePartners),
          alt: `Toplam: ${stats.totalPartners}`,
          trend: trends ? getTrendLabel(trends.partnersChangePct) : null,
          ikon: Users,
          arkaPlan: "bg-gradient-to-br from-purple-500 to-violet-700",
        },
        {
          baslik: "KAYITLI İŞLETME",
          deger: String(stats.totalBusinesses),
          alt: `Aktif: ${stats.activeBusinesses}`,
          trend: trends ? getTrendLabel(trends.businessesChangePct) : null,
          ikon: Building2,
          arkaPlan: "bg-gradient-to-br from-emerald-500 to-green-700",
        },
        {
          baslik: "BU AY GELİR",
          deger: formatCurrencyTRY(stats.monthlyRevenue),
          alt: `Komisyon: ${formatCurrencyTRY(stats.monthlyCommission)}`,
          trend: trends ? getTrendLabel(trends.revenueChangePct) : null,
          ikon: TrendingUp,
          arkaPlan: "bg-gradient-to-br from-orange-500 to-amber-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">ŞarjUp Yönetim Paneline Hoş Geldiniz</h2>
        <p className="mt-2 text-muted-foreground">
          Cihazlarınızı, partnerlerinizi ve işletmelerinizi tek ekrandan takip edin.
        </p>
      </div>

      {!loading && !hasAnyData ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState icon={Inbox} title="Henüz veri bulunmuyor" description="İlk partneri ekleyerek paneli kullanmaya başlayın." />
            <div className="mt-4">
              <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => router.push("/partnerler")}>
                İlk Partneri Ekle
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-40" />
                </CardContent>
              </Card>
            ))
          : istatistikler.map((kart) => {
              const Icon = kart.ikon;
              return (
                <Card key={kart.baslik} className={`${kart.arkaPlan} border-0 text-white shadow-lg`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardDescription className="text-xs font-semibold tracking-wide text-white/80">
                        {kart.baslik}
                      </CardDescription>
                      <Icon className="h-5 w-5 text-white/90" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <CardTitle className="text-3xl font-bold text-white">{kart.deger}</CardTitle>
                    <p className="text-sm text-white/85">{kart.alt}</p>
                    {kart.trend ? <span className="text-sm font-semibold text-emerald-200">{kart.trend}</span> : null}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Lead Hunisi */}
      <Card className="border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="flex flex-wrap items-center gap-6 p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Toplam Lead</p>
              {loading ? <Skeleton className="h-7 w-16 mt-1" /> : (
                <p className="text-2xl font-bold text-blue-700">{leadStats?.total.toLocaleString("tr-TR") ?? 0}</p>
              )}
            </div>
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bu Hafta Yeni</p>
            {loading ? <Skeleton className="h-7 w-12 mt-1" /> : (
              <p className="text-2xl font-bold text-indigo-600">+{leadStats?.newThisWeek ?? 0}</p>
            )}
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Partner Oldu</p>
            {loading ? <Skeleton className="h-7 w-12 mt-1" /> : (
              <p className="text-2xl font-bold text-emerald-600">{leadStats?.converted ?? 0}</p>
            )}
          </div>
          <div className="h-8 w-px bg-border hidden sm:block" />
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Dönüşüm Oranı</p>
            {loading ? <Skeleton className="h-7 w-12 mt-1" /> : (
              <p className="text-2xl font-bold text-orange-600">%{leadStats?.conversionRate ?? 0}</p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto border-blue-200 text-blue-700 hover:bg-blue-100"
            onClick={() => window.location.href = "/basvurular"}
          >
            Tüm Başvurular →
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Aylık Gelir Trendi</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gelirVerisi}>
                  <defs>
                    <linearGradient id="gelirGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="ay" />
                  <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}K ₺`} />
                  <Tooltip formatter={(value) => formatCurrencyTRY(Number(value))} />
                  <Area
                    type="monotone"
                    dataKey="gelir"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#gelirGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cihaz Durumu</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cihazDurumuVerisi}
                    dataKey="deger"
                    nameKey="ad"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                  >
                    {cihazDurumuVerisi.map((entry) => (
                      <Cell key={entry.ad} fill={entry.renk} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} cihaz`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Son İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">Partner</th>
                      <th className="pb-3 font-medium">İşletme</th>
                      <th className="pb-3 font-medium">Tutar</th>
                      <th className="pb-3 font-medium">Tarih</th>
                      <th className="pb-3 font-medium">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {islemler.map((islem) => (
                      <tr key={islem.id} className="border-b last:border-0">
                        <td className="py-3">{islem.partner?.full_name ?? "-"}</td>
                        <td className="py-3">{islem.business?.name ?? "-"}</td>
                        <td className="py-3 font-semibold">{formatCurrencyTRY(islem.amount)}</td>
                        <td className="py-3">{formatDateTR(islem.created_at)}</td>
                        <td className="py-3">{durumRozeti(islem.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hızlı Eylemler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button className="h-20 justify-start gap-3 bg-blue-600 text-white hover:bg-blue-700">
                <UserPlus className="h-5 w-5" />
                Yeni Partner Ekle
              </Button>
              <Button className="h-20 justify-start gap-3 bg-emerald-600 text-white hover:bg-emerald-700">
                <Building2 className="h-5 w-5" />
                Yeni İşletme Kaydet
              </Button>
              <Button className="h-20 justify-start gap-3 bg-purple-600 text-white hover:bg-purple-700">
                <Smartphone className="h-5 w-5" />
                Cihaz Ekle
              </Button>
              <Button className="h-20 justify-start gap-3 bg-orange-500 text-white hover:bg-orange-600">
                <FileText className="h-5 w-5" />
                Rapor Oluştur
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
