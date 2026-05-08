"use client";

import { useEffect, useState } from "react";
import { Building2, Clock, CreditCard, Pencil, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPartnerById, updatePartner } from "@/lib/api/partners";
import { getPayments } from "@/lib/api/payments";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import type { Partner, PaymentWithRelations } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const statusTr: Record<string, string> = { active: "Aktif", inactive: "Pasif", pending: "Beklemede" };

function getInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toLocaleUpperCase("tr-TR")).join("");
}

function avatarColorClass(name: string) {
  const colors = ["bg-blue-100 text-blue-700","bg-purple-100 text-purple-700","bg-emerald-100 text-emerald-700","bg-orange-100 text-orange-700"];
  return colors[name.length % colors.length];
}

function durumClass(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (status === "inactive") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "bg-orange-100 text-orange-700 hover:bg-orange-100";
}

function odemeDurumClass(status: string) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (status === "pending") return "bg-orange-100 text-orange-700 hover:bg-orange-100";
  if (status === "failed") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "bg-slate-100 text-slate-700 hover:bg-slate-100";
}

const paymentStatusTr: Record<string, string> = {
  completed: "Tamamlandı",
  pending: "Bekliyor",
  failed: "Başarısız",
  refunded: "İade",
};

export default function PartnerDetayPage({ params }: { params: { id: string } }) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [partnerPayments, setPartnerPayments] = useState<PaymentWithRelations[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    address: "",
    company_name: "",
    tax_number: "",
    commission_rate: "30",
    status: "pending",
    notes: "",
  });
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPartnerById(params.id), getPayments({ partnerId: params.id, page: 1, limit: 200 })])
      .then(([partnerData, paymentData]) => {
        setPartner(partnerData);
        setForm({
          full_name: partnerData.full_name,
          phone: partnerData.phone,
          email: partnerData.email,
          city: partnerData.city,
          district: partnerData.district,
          address: partnerData.address,
          company_name: partnerData.company_name ?? "",
          tax_number: partnerData.tax_number ?? "",
          commission_rate: String(partnerData.commission_rate),
          status: partnerData.status,
          notes: partnerData.notes ?? "",
        });
        setPartnerPayments(paymentData.data);
      })
      .catch(() => toast.error("Partner detayları yüklenemedi"))
      .finally(() => {
        setLoading(false);
        setLoadingPayments(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!partner) {
    return <Card><CardContent className="p-6"><p className="text-lg font-semibold">Partner bulunamadi</p></CardContent></Card>;
  }

  async function handleSave() {
    if (!partner) {
      return;
    }

    const commissionRate = Number(form.commission_rate);
    if (Number.isNaN(commissionRate) || commissionRate < 0 || commissionRate > 100) {
      toast.error("Komisyon oranı 0-100 arasında olmalıdır.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updatePartner(partner.id, {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email,
        city: form.city,
        district: form.district,
        address: form.address,
        company_name: form.company_name || null,
        tax_number: form.tax_number || null,
        commission_rate: commissionRate,
        status: form.status as Partner["status"],
        notes: form.notes || null,
      });
      setPartner(updated);
      setEditOpen(false);
      toast.success("Partner bilgileri güncellendi.");
    } catch {
      toast.error("Partner güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className={cn("text-xl font-bold", avatarColorClass(partner.full_name))}>
                {getInitials(partner.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{partner.full_name}</h1>
              <p className="text-sm text-muted-foreground">{partner.phone} | {partner.email} | {partner.city}, {partner.district}</p>
              <Badge className={durumClass(partner.status)}>{statusTr[partner.status] ?? partner.status}</Badge>
            </div>
          </div>
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Duzenle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Partner Düzenle</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="space-y-2"><Label>Ad Soyad</Label><Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
                <div className="space-y-2"><Label>E-posta</Label><Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Şehir</Label><Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} /></div>
                <div className="space-y-2"><Label>İlçe</Label><Input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Adres</Label><Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Şirket</Label><Input value={form.company_name} onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Vergi No</Label><Input value={form.tax_number} onChange={(e) => setForm((p) => ({ ...p, tax_number: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Komisyon Oranı (%)</Label><Input type="number" value={form.commission_rate} onChange={(e) => setForm((p) => ({ ...p, commission_rate: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2"><Label>Notlar</Label><Textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Vazgeç</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Tabs defaultValue="genel" className="space-y-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-md p-1">
          <TabsTrigger value="genel">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="isletmeler">Isletmeler</TabsTrigger>
          <TabsTrigger value="cihazlar">Cihazlar</TabsTrigger>
          <TabsTrigger value="odemeler">Odemeler</TabsTrigger>
          <TabsTrigger value="aktivite">Aktivite Gecmisi</TabsTrigger>
        </TabsList>
        <TabsContent value="genel">
          <Card>
            <CardHeader><CardTitle>Partner Detaylari</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="font-semibold">Kisisel Bilgiler</h3>
                <p><span className="font-medium">Ad Soyad:</span> {partner.full_name}</p>
                <p><span className="font-medium">TC Kimlik:</span> {partner.tc_no}</p>
                <p><span className="font-medium">Telefon:</span> {partner.phone}</p>
                <p><span className="font-medium">Email:</span> {partner.email}</p>
                <p><span className="font-medium">Adres:</span> {partner.address}</p>
                <p><span className="font-medium">Kayit Tarihi:</span> {formatDateTR(partner.created_at)}</p>
                {partner.notes ? <p><span className="font-medium">Notlar:</span> {partner.notes}</p> : null}
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold">Ticari Bilgiler</h3>
                <p><span className="font-medium">Sirket:</span> {partner.company_name ?? "-"}</p>
                <p><span className="font-medium">Vergi No:</span> {partner.tax_number ?? "-"}</p>
                <p><span className="font-medium">Sehir / Ilce:</span> {partner.city} / {partner.district}</p>
                <p><span className="font-medium">Komisyon Orani:</span> %{partner.commission_rate}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="isletmeler">
          <Card><CardContent className="p-6"><EmptyState icon={Building2} title="İşletme kaydı bulunmuyor" description="Bu partnere ait işletmeler bu alanda görüntülenecek." /></CardContent></Card>
        </TabsContent>
        <TabsContent value="cihazlar">
          <Card><CardContent className="p-6"><EmptyState icon={Smartphone} title="Cihaz kaydı bulunmuyor" description="Bu partnere bağlı cihazlar bu alanda listelenecek." /></CardContent></Card>
        </TabsContent>
        <TabsContent value="odemeler">
          <Card>
            <CardContent className="p-6">
              {loadingPayments ? (
                <Skeleton className="h-44 w-full" />
              ) : partnerPayments.length === 0 ? (
                <EmptyState icon={CreditCard} title="Ödeme geçmişi yok" description="Bu partnere ait ödeme kaydı henüz bulunmuyor." />
              ) : (
                <div className="overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Tutar</TableHead>
                        <TableHead>Komisyon</TableHead>
                        <TableHead>Durum</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partnerPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDateTR(payment.created_at)}</TableCell>
                          <TableCell className="font-semibold">{formatCurrencyTRY(payment.amount)}</TableCell>
                          <TableCell>{formatCurrencyTRY(payment.commission_amount)}</TableCell>
                          <TableCell>
                            <Badge className={odemeDurumClass(payment.status)}>
                              {paymentStatusTr[payment.status] ?? payment.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="aktivite">
          <Card><CardContent className="p-6"><EmptyState icon={Clock} title="Aktivite geçmişi yok" description="Bu partnere ait aktiviteler bu bölümde yer alacak." /></CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}