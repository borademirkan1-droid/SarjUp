"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, BatteryFull, Cpu, Info, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDeviceById, updateDevice } from "@/lib/api/devices";
import { getActivityLogs } from "@/lib/api/activity-logs";
import { formatDateTimeTR, formatDateTR } from "@/lib/format";
import type { DeviceWithRelations, ActivityLog } from "@/lib/supabase/types";

const deviceStatusMapToTr: Record<string, string> = { active:"Aktif",stock:"Stokta",maintenance:"Bakimda",broken:"Arizali",retired:"Hurda" };

function durumClass(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "stock") return "bg-blue-100 text-blue-700";
  if (status === "maintenance") return "bg-orange-100 text-orange-700";
  if (status === "broken") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function timelineDot(action: string) {
  if (action.includes("create")) return "bg-blue-500";
  if (action.includes("activ")) return "bg-emerald-500";
  if (action.includes("main")) return "bg-orange-500";
  if (action.includes("transfer")) return "bg-violet-500";
  return "bg-slate-400";
}

function generateHmacKeyHex() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export default function CihazDetayPage({ params }: { params: { id: string } }) {
  const [cihaz, setCihaz] = useState<DeviceWithRelations | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [editOpen, setEditOpen] = useState(false);
  const [renewHmacOpen, setRenewHmacOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [renewingHmac, setRenewingHmac] = useState(false);
  const [form, setForm] = useState({
    device_id: "",
    serial_number: "",
    production_date: "",
    activation_date: "",
    battery_health: "100",
    status: "stock",
    subscription_end_date: "",
    stock_location: "",
    notes: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const devData = await getDeviceById(params.id);
        const logData = await getActivityLogs({ resourceType: "device", resourceId: devData.id, limit: 20 });
        setCihaz(devData);
        setForm({
          device_id: devData.device_id,
          serial_number: devData.serial_number,
          production_date: devData.production_date ?? "",
          activation_date: devData.activation_date ?? "",
          battery_health: String(devData.battery_health),
          status: devData.status,
          subscription_end_date: devData.subscription_end_date ?? "",
          stock_location: devData.stock_location ?? "",
          notes: devData.notes ?? "",
        });
        setLogs(logData.data);
      } catch {
        toast.error("Cihaz bilgileri yuklenemedi");
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

  if (!cihaz) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState icon={Info} title="Cihaz kaydı bulunmuyor" description="Cihaz ID eşleşmesi bulunamadı." />
        </CardContent>
      </Card>
    );
  }

  async function handleSave() {
    if (!cihaz) {
      return;
    }

    const batteryHealth = Number(form.battery_health);
    if (Number.isNaN(batteryHealth) || batteryHealth < 0 || batteryHealth > 100) {
      toast.error("Pil sağlığı 0-100 arasında olmalıdır.");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateDevice(cihaz.id, {
        device_id: form.device_id,
        serial_number: form.serial_number,
        production_date: form.production_date,
        activation_date: form.activation_date || null,
        battery_health: batteryHealth,
        status: form.status as DeviceWithRelations["status"],
        subscription_end_date: form.subscription_end_date || null,
        stock_location: form.stock_location || null,
        notes: form.notes || null,
      });
      setCihaz((prev) => (prev ? { ...prev, ...updated } : prev));
      setEditOpen(false);
      toast.success("Cihaz bilgileri güncellendi.");
    } catch {
      toast.error("Cihaz güncellenemedi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRenewHmac() {
    if (!cihaz) {
      return;
    }

    setRenewingHmac(true);
    try {
      await updateDevice(cihaz.id, { hmac_key: generateHmacKeyHex() });
      setRenewHmacOpen(false);
      toast.success("HMAC anahtarı yenilendi.");
    } catch {
      toast.error("HMAC anahtarı yenilenemedi.");
    } finally {
      setRenewingHmac(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{cihaz.device_id}</h1>
              <p className="mt-1 text-muted-foreground">Seri No: {cihaz.serial_number}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge className={durumClass(cihaz.status)}>{deviceStatusMapToTr[cihaz.status] ?? cihaz.status}</Badge>
                <Badge variant="outline">Pil: %{cihaz.battery_health}</Badge>
              </div>
            </div>
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Pencil className="mr-2 h-4 w-4" />Düzenle</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Cihaz Düzenle</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="space-y-2"><Label>Cihaz ID</Label><Input value={form.device_id} onChange={(e) => setForm((p) => ({ ...p, device_id: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Seri No</Label><Input value={form.serial_number} onChange={(e) => setForm((p) => ({ ...p, serial_number: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Üretim Tarihi</Label><Input type="date" value={form.production_date} onChange={(e) => setForm((p) => ({ ...p, production_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Aktivasyon Tarihi</Label><Input type="date" value={form.activation_date} onChange={(e) => setForm((p) => ({ ...p, activation_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Pil Sağlığı (%)</Label><Input type="number" value={form.battery_health} onChange={(e) => setForm((p) => ({ ...p, battery_health: e.target.value }))} /></div>
                  <div className="space-y-2">
                    <Label>Durum</Label>
                    <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="stock">Stokta</SelectItem>
                        <SelectItem value="maintenance">Bakımda</SelectItem>
                        <SelectItem value="broken">Arızalı</SelectItem>
                        <SelectItem value="retired">Hurda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Abonelik Bitiş</Label><Input type="date" value={form.subscription_end_date} onChange={(e) => setForm((p) => ({ ...p, subscription_end_date: e.target.value }))} /></div>
                  <div className="space-y-2"><Label>Stok Lokasyonu</Label><Input value={form.stock_location} onChange={(e) => setForm((p) => ({ ...p, stock_location: e.target.value }))} /></div>
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
      <Tabs defaultValue="teknik" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teknik">Teknik Bilgiler</TabsTrigger>
          <TabsTrigger value="istatistik">Kullanim Istatistikleri</TabsTrigger>
          <TabsTrigger value="olay">Olay Gecmisi</TabsTrigger>
        </TabsList>
        <TabsContent value="teknik">
          <Card>
            <CardHeader><CardTitle>Teknik Bilgiler</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <p><span className="font-medium">Cihaz ID:</span> {cihaz.device_id}</p>
              <p><span className="font-medium">Seri No:</span> {cihaz.serial_number}</p>
              <p><span className="font-medium">Uretim Tarihi:</span> {formatDateTR(cihaz.production_date)}</p>
              <p><span className="font-medium">Aktivasyon Tarihi:</span> {formatDateTR(cihaz.activation_date)}</p>
              <p><span className="font-medium">Son Bakim:</span> {formatDateTR(cihaz.last_maintenance)}</p>
              <p>
                <span className="font-medium">Bulundugu Isletme:</span>{" "}
                {cihaz.business ? (
                  <Link href={`/isletmeler/${cihaz.business.id}`} className="text-blue-600 hover:underline">
                    {cihaz.business.name}
                  </Link>
                ) : (
                  "Stokta"
                )}
              </p>
              <p>
                <span className="font-medium">Bagli Partner:</span>{" "}
                {cihaz.partner ? (
                  <Link href={`/partnerler/${cihaz.partner.id}`} className="text-blue-600 hover:underline">
                    {cihaz.partner.full_name}
                  </Link>
                ) : (
                  "-"
                )}
              </p>
              <p><span className="font-medium">Abonelik Bitis:</span> {formatDateTR(cihaz.subscription_end_date)}</p>
              <p><span className="font-medium">Stok Lokasyonu:</span> {cihaz.stock_location ?? "-"}</p>
              <p className="md:col-span-2">
                <span className="font-medium">HMAC Anahtarı:</span> *******{" "}
                <Dialog open={renewHmacOpen} onOpenChange={setRenewHmacOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="h-auto p-0 text-blue-600">Yenile</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>HMAC Anahtarı Yenile</DialogTitle></DialogHeader>
                    <p className="text-sm text-muted-foreground">
                      Bu işlem sonrasında cihaz tarafında yeni anahtarın güncellenmesi gerekir. Devam etmek istiyor musunuz?
                    </p>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setRenewHmacOpen(false)}>Vazgeç</Button>
                      <Button onClick={handleRenewHmac} disabled={renewingHmac}>
                        {renewingHmac ? "Yenileniyor..." : "Evet, Yenile"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="istatistik">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Toplam Kullanim Sayisi</p><p className="text-2xl font-bold">{cihaz.total_uses}</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Toplam Kullanim Saati</p><p className="text-2xl font-bold">{cihaz.total_usage_hours} saat</p></CardContent></Card>
            <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Aylik Ortalama</p><p className="text-2xl font-bold">{cihaz.monthly_avg_usage} saat</p></CardContent></Card>
          </div>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <p className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"><BatteryFull className="h-4 w-4" />Pil sagligi</p>
              <div className="h-36 rounded-md border bg-muted/30 p-4">
                <div className="mb-2 text-xs">Pil: %{cihaz.battery_health}</div>
                <Progress value={cihaz.battery_health} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="olay">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" />Olay Gecmisi</CardTitle></CardHeader>
            <CardContent>
              {logs.length === 0 ? (
                <EmptyState icon={Cpu} title="Henüz olay kaydı yok" description="Bu cihazla ilgili bir aktivite kaydı bulunamadı." />
              ) : (
                <ol className="relative ml-3 border-l">
                  {logs.map((log, index) => (
                    <li key={`${log.id}-${index}`} className="mb-6 ml-6">
                      <span className={`absolute -left-2 mt-1 h-3 w-3 rounded-full ${timelineDot(log.action)}`} />
                      <p className="text-xs text-muted-foreground">{formatDateTimeTR(log.created_at)}</p>
                      <p className="font-medium">{log.action}</p>
                      {log.details ? <p className="text-sm text-muted-foreground">{JSON.stringify(log.details)}</p> : null}
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}