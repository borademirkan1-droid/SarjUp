"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBusinessById, updateBusiness } from "@/lib/api/businesses";
import { getDevices } from "@/lib/api/devices";
import { getPayments } from "@/lib/api/payments";
import { formatCurrencyTRY, formatDateTR } from "@/lib/format";
import type { BusinessWithPartner, DeviceWithRelations, PaymentWithRelations } from "@/lib/supabase/types";

const tipMapToTr: Record<string, string> = { cafe:"Cafe",restaurant:"Restoran",hotel:"Otel",mall:"AVM",hospital:"Hastane",other:"Diger" };
const statusMapToTr: Record<string, string> = { active:"Aktif",inactive:"Pasif",debt:"Borclu" };
const deviceStatusMapToTr: Record<string, string> = { active:"Aktif",stock:"Stokta",maintenance:"Bakimda",broken:"Arizali",retired:"Hurda" };
const paymentStatusMapToTr: Record<string, string> = { completed:"Tamamlandı",pending:"Bekliyor",failed:"Başarısız",refunded:"İade" };
const paymentMethodMapToTr: Record<string, string> = { iyzico:"iyzico",bank:"Banka",cash:"Nakit",other:"Diğer" };

function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}.${d.getFullYear()}`;
}

function paymentBadgeClass(status: string) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "pending") return "bg-orange-100 text-orange-700";
  if (status === "failed") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default function IsletmeDetayPage({ params }: { params: { id: string } }) {
  const [isletme, setIsletme] = useState<BusinessWithPartner | null>(null);
  const [cihazlar, setCihazlar] = useState<DeviceWithRelations[]>([]);
  const [odemeler, setOdemeler] = useState<PaymentWithRelations[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    address: "",
    contact_person: "",
    contact_phone: "",
    monthly_fee: "0",
    status: "active",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bizData, devData, paymentData] = await Promise.all([
          getBusinessById(params.id),
          getDevices({ businessId: params.id, limit: 50 }),
          getPayments({ businessId: params.id, limit: 200, page: 1 }),
        ]);
        setIsletme(bizData);
        setForm({
          name: bizData.name,
          phone: bizData.phone,
          email: bizData.email ?? "",
          city: bizData.city,
          district: bizData.district,
          address: bizData.address,
          contact_person: bizData.contact_person,
          contact_phone: bizData.contact_phone,
          monthly_fee: String(bizData.monthly_fee),
          status: bizData.status,
          notes: bizData.notes ?? "",
        });
        setCihazlar(devData.data);
        setOdemeler(paymentData.data);
      } catch {
        toast.error("Isletme bilgileri yuklenemedi");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Card><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isletme) {
    return <Card><CardContent className="p-6"><p className="text-lg font-semibold">Isletme bulunamadi</p></CardContent></Card>;
  }

  async function handleSave() {
    if (!isletme) {
      return;
    }

    const monthlyFee = Number(form.monthly_fee);
    if (Number.isNaN(monthlyFee) || monthlyFee < 0) {
      toast.error("Aylık ücret geçerli bir sayı olmalıdır.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateBusiness(isletme.id, {
        name: form.name,
        phone: form.phone,
        email: form.email || null,
        city: form.city,
        district: form.district,
        address: form.address,
        contact_person: form.contact_person,
        contact_phone: form.contact_phone,
        monthly_fee: monthlyFee,
        status: form.status as BusinessWithPartner["status"],
        notes: form.notes || null,
      });
      setIsletme((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditOpen(false);
      toast.success("İşletme bilgileri güncellendi.");
    } catch {
      toast.error("İşletme güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{isletme.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline">{tipMapToTr[isletme.business_type] ?? isletme.business_type}</Badge>
                <Badge className={isletme.status === "active" ? "bg-emerald-100 text-emerald-700" : isletme.status === "inactive" ? "bg-slate-100 text-slate-700" : "bg-red-100 text-red-700"}>
                  {statusMapToTr[isletme.status] ?? isletme.status}
                </Badge>
                {isletme.partner ? (
                  <Link href={`/partnerler/${isletme.partner.id}`} className="text-sm text-blue-600 hover:underline">
                    Bagli Partner: {isletme.partner.full_name}
                  </Link>
                ) : null}
              </div>
            </div>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Düzenle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>İşletme Düzenle</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2"><Label>İşletme Adı</Label><Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Telefon</Label><Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>E-posta</Label><Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Şehir</Label><Input value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>İlçe</Label><Input value={form.district} onChange={(e) => setForm((p) => ({ ...p, district: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Adres</Label><Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Yetkili</Label><Input value={form.contact_person} onChange={(e) => setForm((p) => ({ ...p, contact_person: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Yetkili Telefon</Label><Input value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Aylık Ücret</Label><Input type="number" value={form.monthly_fee} onChange={(e) => setForm((p) => ({ ...p, monthly_fee: e.target.value }))} /></div>
                  <div className="space-y-2">
                    <Label>Durum</Label>
                    <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Pasif</SelectItem>
                        <SelectItem value="debt">Borçlu</SelectItem>
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
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="genel" className="space-y-4">
        <TabsList>
          <TabsTrigger value="genel">Genel Bilgiler</TabsTrigger>
          <TabsTrigger value="cihazlar">Cihazlar</TabsTrigger>
          <TabsTrigger value="odeme">Odeme Gecmisi</TabsTrigger>
          <TabsTrigger value="notlar">Notlar</TabsTrigger>
        </TabsList>
        <TabsContent value="genel">
          <Card>
            <CardHeader><CardTitle>Genel Bilgiler</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <p><span className="font-medium">Isletme Adi:</span> {isletme.name}</p>
              <p><span className="font-medium">Telefon:</span> {isletme.phone}</p>
              <p><span className="font-medium">Email:</span> {isletme.email ?? "-"}</p>
              <p><span className="font-medium">Sehir / Ilce:</span> {isletme.city} / {isletme.district}</p>
              <p><span className="font-medium">Adres:</span> {isletme.address}</p>
              <p><span className="font-medium">Yetkili:</span> {isletme.contact_person} ({isletme.contact_phone})</p>
              <p><span className="font-medium">Cihaz Sayisi:</span> {isletme.device_count}</p>
              <p><span className="font-medium">Aylik Ucret:</span> {isletme.monthly_fee} TL</p>
              <p><span className="font-medium">Sozlesme Baslangic:</span> {formatDate(isletme.contract_start_date)}</p>
              <p><span className="font-medium">Kayit Tarihi:</span> {formatDate(isletme.created_at)}</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cihazlar">
          <Card>
            <CardHeader><CardTitle>Isletmedeki Cihazlar</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Cihaz ID</TableHead><TableHead>Seri No</TableHead><TableHead>Durum</TableHead><TableHead>Pil</TableHead></TableRow></TableHeader>
                <TableBody>
                  {cihazlar.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell><Link href={`/cihazlar/${c.id}`} className="text-blue-600 hover:underline">{c.device_id}</Link></TableCell>
                      <TableCell>{c.serial_number}</TableCell>
                      <TableCell>{deviceStatusMapToTr[c.status] ?? c.status}</TableCell>
                      <TableCell>%{c.battery_health}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="odeme">
          <Card>
            <CardHeader><CardTitle>Ödeme Geçmişi</CardTitle></CardHeader>
            <CardContent>
              {odemeler.length === 0 ? (
                <EmptyState icon={CreditCard} title="Ödeme kaydı bulunamadı" description="Bu işletmeye ait ödeme geçmişi henüz yok." />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Komisyon</TableHead>
                      <TableHead>Net Tutar</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Yöntem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {odemeler.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{formatDateTR(payment.created_at)}</TableCell>
                        <TableCell className="font-medium">{formatCurrencyTRY(payment.amount)}</TableCell>
                        <TableCell>{formatCurrencyTRY(payment.commission_amount)}</TableCell>
                        <TableCell className="font-medium text-emerald-700">{formatCurrencyTRY(payment.net_amount)}</TableCell>
                        <TableCell>
                          <Badge className={paymentBadgeClass(payment.status)}>
                            {paymentStatusMapToTr[payment.status] ?? payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{paymentMethodMapToTr[payment.method] ?? payment.method}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notlar">
          <Card><CardContent className="py-8 text-sm text-muted-foreground">{isletme.notes ?? "Henuz not bulunmuyor."}</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}