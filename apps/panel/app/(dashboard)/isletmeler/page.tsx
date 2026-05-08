"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, Coffee, Heart, Hotel, Loader2, MoreHorizontal, Search, ShoppingBag, Trash2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getBusinesses, createBusiness } from "@/lib/api/businesses";
import { getPartners } from "@/lib/api/partners";
import type { BusinessWithPartner, Partner, BusinessType } from "@/lib/supabase/types";

const PAGE_SIZE = 10;
const sehirler = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Trabzon", "Adana"];
const ilceler: Record<string, string[]> = {
  İstanbul: ["Kadıköy", "Beşiktaş", "Şişli", "Ümraniye", "Bakırköy", "Pendik", "Ataşehir", "Sarıyer"],
  Ankara: ["Çankaya", "Yenimahalle", "Keçiören"],
  İzmir: ["Konak", "Bornova", "Karşıyaka"],
  Bursa: ["Nilüfer", "Osmangazi"],
  Antalya: ["Muratpaşa", "Kepez"],
  Trabzon: ["Ortahisar"],
  Adana: ["Seyhan"],
};

const tiplerTr = ["Cafe", "Restoran", "Otel", "AVM", "Hastane", "Diğer"] as const;
const tipMapToDb: Record<string, BusinessType> = {
  "Cafe": "cafe",
  "Restoran": "restaurant",
  "Otel": "hotel",
  "AVM": "mall",
  "Hastane": "hospital",
  "Diğer": "other",
};
const tipMapToTr: Record<string, string> = {
  cafe: "Cafe",
  restaurant: "Restoran",
  hotel: "Otel",
  mall: "AVM",
  hospital: "Hastane",
  other: "Diğer",
};
const statusMapToTr: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  debt: "Borçlu",
};

type FormState = {
  isletmeAdi: string;
  tip: string;
  telefon: string;
  email: string;
  adres: string;
  sehir: string;
  ilce: string;
  bagliPartnerId: string;
  yetkiliAdi: string;
  yetkiliTelefon: string;
  cihazSayisi: number;
  aylikUcret: number;
  sozlesmeBaslangic: string;
  notlar: string;
};

const initialForm: FormState = {
  isletmeAdi: "",
  tip: "",
  telefon: "",
  email: "",
  adres: "",
  sehir: "",
  ilce: "",
  bagliPartnerId: "",
  yetkiliAdi: "",
  yetkiliTelefon: "",
  cihazSayisi: 1,
  aylikUcret: 500,
  sozlesmeBaslangic: "",
  notlar: "",
};

function formatDate(date: string) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function tipIcon(tip: string) {
  if (tip === "cafe") return <Coffee className="h-4 w-4 text-amber-700" />;
  if (tip === "restaurant") return <UtensilsCrossed className="h-4 w-4 text-orange-700" />;
  if (tip === "hotel") return <Hotel className="h-4 w-4 text-indigo-700" />;
  if (tip === "mall") return <ShoppingBag className="h-4 w-4 text-violet-700" />;
  if (tip === "hospital") return <Heart className="h-4 w-4 text-red-700" />;
  return <Building className="h-4 w-4 text-slate-700" />;
}

export default function IsletmelerPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessWithPartner[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState("");
  const [partner, setPartner] = useState("Tümü");
  const [sehir, setSehir] = useState("Tümü");
  const [tip, setTip] = useState("Tümü");
  const [durum, setDurum] = useState("Tümü");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bizResult, partnerResult] = await Promise.all([
        getBusinesses({
          page,
          limit: PAGE_SIZE,
          search: arama || undefined,
          partnerId: partner !== "Tümü" ? partner : undefined,
          city: sehir !== "Tümü" ? sehir : undefined,
          type: tip !== "Tümü" ? tip : undefined,
          status: durum !== "Tümü" ? durum : undefined,
        }),
        getPartners({ limit: 100 }),
      ]);
      setBusinesses(bizResult.data);
      setTotalCount(bizResult.count);
      setPartners(partnerResult.data);
    } catch (err) {
      toast.error("İşletme listesi yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, arama, partner, sehir, tip, durum]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function validate(values: FormState) {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!values.isletmeAdi.trim()) next.isletmeAdi = "İşletme adı zorunludur.";
    if (!values.tip) next.tip = "İşletme tipi zorunludur.";
    if (!values.telefon.trim()) next.telefon = "Telefon zorunludur.";
    if (!values.adres.trim()) next.adres = "Adres zorunludur.";
    if (!values.sehir) next.sehir = "Şehir zorunludur.";
    if (!values.ilce) next.ilce = "İlçe zorunludur.";
    if (!values.bagliPartnerId) next.bagliPartnerId = "Bağlı partner zorunludur.";
    if (!values.yetkiliAdi.trim()) next.yetkiliAdi = "Yetkili adı zorunludur.";
    if (!values.yetkiliTelefon.trim()) next.yetkiliTelefon = "Yetkili telefonu zorunludur.";
    if (!values.cihazSayisi || values.cihazSayisi < 1) next.cihazSayisi = "Cihaz sayısı en az 1 olmalıdır.";
    if (!values.aylikUcret || values.aylikUcret < 500) next.aylikUcret = "Aylık ücret en az 500 TL olmalıdır.";
    if (!values.sozlesmeBaslangic) next.sozlesmeBaslangic = "Sözleşme başlangıç tarihi zorunludur.";
    return next;
  }

  async function saveBusiness() {
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length) return;
    setSaving(true);
    try {
      await createBusiness({
        name: form.isletmeAdi,
        business_type: tipMapToDb[form.tip] ?? "other",
        partner_id: form.bagliPartnerId,
        phone: form.telefon,
        email: form.email || null,
        address: form.adres,
        city: form.sehir,
        district: form.ilce,
        contact_person: form.yetkiliAdi,
        contact_phone: form.yetkiliTelefon,
        device_count: form.cihazSayisi,
        monthly_fee: form.aylikUcret,
        contract_start_date: form.sozlesmeBaslangic,
        status: "active",
        notes: form.notlar || null,
      });
      toast.success("İşletme başarıyla kaydedildi.");
      setOpen(false);
      setForm(initialForm);
      setPage(1);
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "İşletme eklenemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">İşletmeler</h2>
          <p className="text-muted-foreground">Cihazlarımızın bulunduğu işletmeler</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Yeni İşletme</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni İşletme Ekle</DialogTitle>
              <DialogDescription>Formu doldurarak yeni işletme kaydı oluşturabilirsiniz.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label>İşletme adı</Label><Input value={form.isletmeAdi} onChange={(e) => setForm((p) => ({ ...p, isletmeAdi: e.target.value }))} />{errors.isletmeAdi ? <p className="text-xs text-red-600">{errors.isletmeAdi}</p> : null}</div>
              <div className="space-y-2"><Label>İşletme tipi</Label><Select value={form.tip} onValueChange={(v) => setForm((p) => ({ ...p, tip: v }))}><SelectTrigger><SelectValue placeholder="Tip seçiniz" /></SelectTrigger><SelectContent>{tiplerTr.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>{errors.tip ? <p className="text-xs text-red-600">{errors.tip}</p> : null}</div>
              <div className="space-y-2"><Label>Telefon</Label><Input value={form.telefon} onChange={(e) => setForm((p) => ({ ...p, telefon: e.target.value }))} />{errors.telefon ? <p className="text-xs text-red-600">{errors.telefon}</p> : null}</div>
              <div className="space-y-2"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
              <div className="space-y-2 md:col-span-2"><Label>Adres</Label><Textarea value={form.adres} onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))} />{errors.adres ? <p className="text-xs text-red-600">{errors.adres}</p> : null}</div>
              <div className="space-y-2"><Label>Şehir</Label><Select value={form.sehir} onValueChange={(v) => setForm((p) => ({ ...p, sehir: v, ilce: "" }))}><SelectTrigger><SelectValue placeholder="Şehir seçiniz" /></SelectTrigger><SelectContent>{sehirler.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>{errors.sehir ? <p className="text-xs text-red-600">{errors.sehir}</p> : null}</div>
              <div className="space-y-2"><Label>İlçe</Label><Select value={form.ilce} onValueChange={(v) => setForm((p) => ({ ...p, ilce: v }))}><SelectTrigger><SelectValue placeholder="İlçe seçiniz" /></SelectTrigger><SelectContent>{(ilceler[form.sehir] ?? []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>{errors.ilce ? <p className="text-xs text-red-600">{errors.ilce}</p> : null}</div>
              <div className="space-y-2"><Label>Bağlı Partner</Label><Select value={form.bagliPartnerId} onValueChange={(v) => setForm((p) => ({ ...p, bagliPartnerId: v }))}><SelectTrigger><SelectValue placeholder="Partner seçiniz" /></SelectTrigger><SelectContent>{partners.map((item) => <SelectItem key={item.id} value={item.id}>{item.full_name}</SelectItem>)}</SelectContent></Select>{errors.bagliPartnerId ? <p className="text-xs text-red-600">{errors.bagliPartnerId}</p> : null}</div>
              <div className="space-y-2"><Label>Yetkili kişi adı</Label><Input value={form.yetkiliAdi} onChange={(e) => setForm((p) => ({ ...p, yetkiliAdi: e.target.value }))} />{errors.yetkiliAdi ? <p className="text-xs text-red-600">{errors.yetkiliAdi}</p> : null}</div>
              <div className="space-y-2"><Label>Yetkili telefonu</Label><Input value={form.yetkiliTelefon} onChange={(e) => setForm((p) => ({ ...p, yetkiliTelefon: e.target.value }))} />{errors.yetkiliTelefon ? <p className="text-xs text-red-600">{errors.yetkiliTelefon}</p> : null}</div>
              <div className="space-y-2"><Label>Cihaz sayısı</Label><Input type="number" min={1} max={8} value={form.cihazSayisi} onChange={(e) => setForm((p) => ({ ...p, cihazSayisi: Number(e.target.value) }))} />{errors.cihazSayisi ? <p className="text-xs text-red-600">{errors.cihazSayisi}</p> : null}</div>
              <div className="space-y-2"><Label>Aylık ücret (TL)</Label><Input type="number" min={500} max={3000} value={form.aylikUcret} onChange={(e) => setForm((p) => ({ ...p, aylikUcret: Number(e.target.value) }))} />{errors.aylikUcret ? <p className="text-xs text-red-600">{errors.aylikUcret}</p> : null}</div>
              <div className="space-y-2"><Label>Sözleşme başlangıç tarihi</Label><Input type="date" value={form.sozlesmeBaslangic} onChange={(e) => setForm((p) => ({ ...p, sozlesmeBaslangic: e.target.value }))} />{errors.sozlesmeBaslangic ? <p className="text-xs text-red-600">{errors.sozlesmeBaslangic}</p> : null}</div>
              <div className="space-y-2 md:col-span-2"><Label>Notlar</Label><Textarea value={form.notlar} onChange={(e) => setForm((p) => ({ ...p, notlar: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button onClick={saveBusiness} disabled={saving}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Kaydet</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="İşletme adı, telefon..." value={arama} onChange={(e) => { setArama(e.target.value); setPage(1); }} className="pl-9" />
            </div>
            <Select value={partner} onValueChange={(v) => { setPartner(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Partner" /></SelectTrigger>
              <SelectContent><SelectItem value="Tümü">Tümü</SelectItem>{partners.map((item) => <SelectItem key={item.id} value={item.id}>{item.full_name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={sehir} onValueChange={(v) => { setSehir(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Şehir" /></SelectTrigger>
              <SelectContent><SelectItem value="Tümü">Tümü</SelectItem>{sehirler.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={tip} onValueChange={(v) => { setTip(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="İşletme tipi" /></SelectTrigger>
              <SelectContent><SelectItem value="Tümü">Tümü</SelectItem>{tiplerTr.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={durum} onValueChange={(v) => { setDurum(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger>
              <SelectContent><SelectItem value="Tümü">Tümü</SelectItem><SelectItem value="Aktif">Aktif</SelectItem><SelectItem value="Pasif">Pasif</SelectItem><SelectItem value="Borçlu">Borçlu</SelectItem></SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[1200px]">
              <TableHeader>
                <TableRow>
                  <TableHead>İşletme Adı</TableHead>
                  <TableHead>Bağlı Partner</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Şehir/İlçe</TableHead>
                  <TableHead>Cihaz Sayısı</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>Sözleşme Başlangıcı</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">Eylemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : businesses.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer" onClick={() => router.push(`/isletmeler/${item.id}`)}>
                        <TableCell><div className="flex items-center gap-2">{tipIcon(item.business_type)}<span className="font-medium">{item.name}</span></div></TableCell>
                        <TableCell>{item.partner ? <Link href={`/partnerler/${item.partner.id}`} onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:underline">{item.partner.full_name}</Link> : "-"}</TableCell>
                        <TableCell>{item.phone}</TableCell>
                        <TableCell>{item.city} / {item.district}</TableCell>
                        <TableCell><Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">{item.device_count}</Badge></TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell>{formatDate(item.contract_start_date)}</TableCell>
                        <TableCell><Badge className={item.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : item.status === "inactive" ? "bg-slate-100 text-slate-700 hover:bg-slate-100" : "bg-red-100 text-red-700 hover:bg-red-100"}>{statusMapToTr[item.status] ?? item.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => router.push(`/isletmeler/${item.id}`)}>Detay Görüntüle</DropdownMenuItem>
                              <DropdownMenuItem>Düzenle</DropdownMenuItem>
                              <DropdownMenuItem>Cihazlarını Gör</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" />Sil</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Toplam {totalCount} işletme</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Önceki</Button>
              <span className="text-sm">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sonraki</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
