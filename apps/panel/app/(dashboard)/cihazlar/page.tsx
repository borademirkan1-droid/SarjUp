"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createDevice, getDevices, getNextDeviceSequence } from "@/lib/api/devices";
import { getBusinesses } from "@/lib/api/businesses";
import { getPartners } from "@/lib/api/partners";
import { formatDateTR } from "@/lib/format";
import type { DeviceWithRelations, Business, Partner } from "@/lib/supabase/types";

const PAGE_SIZE = 15;

const deviceStatusMapToTr: Record<string, string> = {
  active: "Aktif",
  stock: "Stokta",
  maintenance: "Bakımda",
  broken: "Arızalı",
  retired: "Hurda",
};

function durumClass(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700";
  if (status === "stock") return "bg-blue-100 text-blue-700";
  if (status === "maintenance") return "bg-orange-100 text-orange-700";
  if (status === "broken") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

export default function CihazlarPage() {
  const [devices, setDevices] = useState<DeviceWithRelations[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState("");
  const [isletme, setIsletme] = useState("Tümü");
  const [partner, setPartner] = useState("Tümü");
  const [durum, setDurum] = useState("Tümü");
  const [pil, setPil] = useState("Tümü");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    seriNo: "",
    batch: "",
    uretimTarihi: "",
    stokLokasyonu: "Ana Depo İstanbul",
    partnerId: "none",
    notlar: "",
  });

  function generateHmacKeyHex() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [devResult, bizResult, partResult] = await Promise.all([
        getDevices({
          page,
          limit: PAGE_SIZE,
          search: arama || undefined,
          businessId: isletme !== "Tümü" ? isletme : undefined,
          partnerId: partner !== "Tümü" ? partner : undefined,
          status: durum !== "Tümü" ? durum : undefined,
          batteryFilter: pil !== "Tümü" ? pil : undefined,
        }),
        getBusinesses({ limit: 100 }),
        getPartners({ limit: 100 }),
      ]);
      setDevices(devResult.data);
      setTotalCount(devResult.count);
      setBusinesses(bizResult.data as Business[]);
      setPartners(partResult.data);
    } catch (err) {
      toast.error("Cihaz listesi yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, arama, isletme, partner, durum, pil]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  async function saveDevice() {
    setSaving(true);
    try {
      const year = new Date().getFullYear();
      const sequence = await getNextDeviceSequence(year);
      const deviceId = `ŞRJ-${year}-${String(sequence).padStart(4, "0")}`;
      const batchToken = (form.batch || "GEN").replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8) || "GEN";
      const serialNo = form.seriNo.trim() || `SN-${year}-${batchToken}-${String(sequence).padStart(3, "0")}`;

      await createDevice({
        device_id: deviceId,
        serial_number: serialNo,
        business_id: null,
        partner_id: form.partnerId === "none" ? null : form.partnerId,
        production_batch: form.batch || null,
        production_date: form.uretimTarihi || new Date().toISOString().slice(0, 10),
        activation_date: null,
        last_maintenance: null,
        battery_health: 100,
        status: "stock",
        subscription_end_date: null,
        hmac_key: generateHmacKeyHex(),
        last_counter: 0,
        total_uses: 0,
        total_usage_hours: 0,
        monthly_avg_usage: 0,
        stock_location: form.stokLokasyonu,
        notes: form.notlar || null,
      });
      toast.success("Cihaz başarıyla eklendi.");
      setOpen(false);
      setForm({ seriNo: "", batch: "", uretimTarihi: "", stokLokasyonu: "Ana Depo İstanbul", partnerId: "none", notlar: "" });
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Cihaz eklenemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cihazlar</h2>
          <p className="text-muted-foreground">Tüm cihazlarınızı takip edin</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Yeni Cihaz Ekle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Cihaz Ekle</DialogTitle><DialogDescription>Yeni cihaz kaydı oluşturun.</DialogDescription></DialogHeader>
              <div className="grid gap-4">
                <div className="space-y-2"><Label>Seri numarası</Label><Input value={form.seriNo} placeholder="Boş bırakırsanız otomatik oluşur" onChange={(e) => setForm((p) => ({ ...p, seriNo: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Üretim batch</Label><Input value={form.batch} placeholder="BATCH-2025-03" onChange={(e) => setForm((p) => ({ ...p, batch: e.target.value }))} /></div>
                <div className="space-y-2"><Label>Üretim tarihi</Label><Input type="date" value={form.uretimTarihi} onChange={(e) => setForm((p) => ({ ...p, uretimTarihi: e.target.value }))} /></div>
                <div className="space-y-2">
                  <Label>Stok lokasyonu</Label>
                  <Select value={form.stokLokasyonu} onValueChange={(v) => setForm((p) => ({ ...p, stokLokasyonu: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ana Depo İstanbul">Ana Depo İstanbul</SelectItem>
                      <SelectItem value="Depo Ankara">Depo Ankara</SelectItem>
                      <SelectItem value="Depo İzmir">Depo İzmir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bağlı Partner (Opsiyonel)</Label>
                  <Select value={form.partnerId} onValueChange={(v) => setForm((p) => ({ ...p, partnerId: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Atanmamış</SelectItem>
                      {partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Notlar</Label><Textarea value={form.notlar} onChange={(e) => setForm((p) => ({ ...p, notlar: e.target.value }))} /></div>
                <p className="text-xs text-muted-foreground">`device_id`, HMAC anahtarı ve durum otomatik oluşturulur (stock).</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
                <Button onClick={saveDevice} disabled={saving}>{saving ? "Kaydediliyor..." : "Kaydet"}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">Toplu İçe Aktar</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Cihaz ID, seri no" value={arama} onChange={(e) => { setArama(e.target.value); setPage(1); }} /></div>
            <Select value={isletme} onValueChange={(v) => { setIsletme(v); setPage(1); }}><SelectTrigger><SelectValue placeholder="İşletme" /></SelectTrigger><SelectContent><SelectItem value="Tümü">Tümü</SelectItem>{businesses.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent></Select>
            <Select value={partner} onValueChange={(v) => { setPartner(v); setPage(1); }}><SelectTrigger><SelectValue placeholder="Partner" /></SelectTrigger><SelectContent><SelectItem value="Tümü">Tümü</SelectItem>{partners.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>)}</SelectContent></Select>
            <Select value={durum} onValueChange={(v) => { setDurum(v); setPage(1); }}><SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger><SelectContent><SelectItem value="Tümü">Tümü</SelectItem><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Stokta">Stokta</SelectItem><SelectItem value="Bakımda">Bakımda</SelectItem><SelectItem value="Arızalı">Arızalı</SelectItem><SelectItem value="Hurda">Hurda</SelectItem></SelectContent></Select>
            <Select value={pil} onValueChange={(v) => { setPil(v); setPage(1); }}><SelectTrigger><SelectValue placeholder="Pil Sağlığı" /></SelectTrigger><SelectContent><SelectItem value="Tümü">Tümü</SelectItem><SelectItem value="İyi">İyi {'>'}80%</SelectItem><SelectItem value="Orta">Orta 50-80%</SelectItem><SelectItem value="Düşük">Düşük {'<'}50%</SelectItem></SelectContent></Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[1400px]">
              <TableHeader><TableRow><TableHead>Cihaz ID</TableHead><TableHead>Seri No</TableHead><TableHead>Bulunduğu İşletme</TableHead><TableHead>Bağlı Partner</TableHead><TableHead>Üretim Tarihi</TableHead><TableHead>Aktivasyon</TableHead><TableHead>Son Bakım</TableHead><TableHead>Pil Sağlığı</TableHead><TableHead>Durum</TableHead><TableHead>Eylemler</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>{Array.from({ length: 10 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                    ))
                  : devices.map((item) => {
                      const pilClass = item.battery_health > 80 ? "bg-emerald-100 text-emerald-700" : item.battery_health >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700";
                      return (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono font-semibold"><Link href={`/cihazlar/${item.id}`} className="hover:underline">{item.device_id}</Link></TableCell>
                          <TableCell>{item.serial_number}</TableCell>
                          <TableCell>{item.business ? <Link href={`/isletmeler/${item.business.id}`} className="text-blue-600 hover:underline">{item.business.name}</Link> : <span className="text-muted-foreground">Stokta</span>}</TableCell>
                          <TableCell>{item.partner ? <Link href={`/partnerler/${item.partner.id}`} className="text-blue-600 hover:underline">{item.partner.full_name}</Link> : "-"}</TableCell>
                          <TableCell>{formatDateTR(item.production_date)}</TableCell>
                          <TableCell>{formatDateTR(item.activation_date)}</TableCell>
                          <TableCell>{formatDateTR(item.last_maintenance)}</TableCell>
                          <TableCell><div className="space-y-1"><Badge className={pilClass}>{item.battery_health}%</Badge><Progress value={item.battery_health} className="h-1.5 w-20" /></div></TableCell>
                          <TableCell><Badge className={durumClass(item.status)}>{deviceStatusMapToTr[item.status] ?? item.status}</Badge></TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild><Link href={`/cihazlar/${item.id}`}>Detay</Link></DropdownMenuItem>
                                <DropdownMenuItem>Bakıma Gönder</DropdownMenuItem>
                                <DropdownMenuItem>İşletme Ata</DropdownMenuItem>
                                <DropdownMenuItem>Durumu Değiştir</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Toplam {totalCount} cihaz</p>
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
