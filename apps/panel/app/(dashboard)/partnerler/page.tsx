"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  ToggleLeft,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getPartners, createPartner } from "@/lib/api/partners";
import type { Partner } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

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

const statusTr: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  pending: "Beklemede",
};

type PartnerForm = {
  adSoyad: string;
  tcKimlik: string;
  telefon: string;
  email: string;
  sifre: string;
  sifreTekrar: string;
  sehir: string;
  ilce: string;
  adres: string;
  sirketAdi: string;
  vergiNo: string;
  komisyonOrani: number;
  notlar: string;
};

type FormErrors = Partial<Record<keyof PartnerForm, string>>;

const initialForm: PartnerForm = {
  adSoyad: "",
  tcKimlik: "",
  telefon: "",
  email: "",
  sifre: "",
  sifreTekrar: "",
  sehir: "",
  ilce: "",
  adres: "",
  sirketAdi: "",
  vergiNo: "",
  komisyonOrani: 30,
  notlar: "",
};

function formatTarih(value: string) {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR"))
    .join("");
}

function avatarColorClass(name: string) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
  ];
  return colors[name.length % colors.length];
}

function durumClass(status: string) {
  if (status === "active") return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100";
  if (status === "inactive") return "bg-red-100 text-red-700 hover:bg-red-100";
  return "bg-orange-100 text-orange-700 hover:bg-orange-100";
}

function randomPassword(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function PartnerlerPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState("");
  const [sehir, setSehir] = useState("Tümü");
  const [durum, setDurum] = useState("Tümü");
  const [sirala, setSirala] = useState("En yeni");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<PartnerForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const sortMap: Record<string, string> = {
        "En yeni": "created_at_desc",
        "En eski": "created_at_asc",
      };
      const result = await getPartners({
        page,
        limit: PAGE_SIZE,
        search: arama || undefined,
        city: sehir !== "Tümü" ? sehir : undefined,
        status: durum !== "Tümü" ? durum : undefined,
        sort: sortMap[sirala] ?? "created_at_desc",
      });
      setPartners(result.data);
      setTotalCount(result.count);
    } catch (err) {
      toast.error("Partner listesi yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, arama, sehir, durum, sirala]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  function resetForm() {
    setForm(initialForm);
    setErrors({});
  }

  function validateForm(values: PartnerForm): FormErrors {
    const nextErrors: FormErrors = {};
    if (!values.adSoyad.trim()) nextErrors.adSoyad = "Ad Soyad zorunludur.";
    if (!/^\d{11}$/.test(values.tcKimlik)) nextErrors.tcKimlik = "TC Kimlik No 11 haneli olmalıdır.";
    if (!/^\d{3}\s\d{3}\s\d{2}\s\d{2}$/.test(values.telefon)) nextErrors.telefon = "Telefon 5XX XXX XX XX formatında olmalıdır.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Geçerli bir email giriniz.";
    if (values.sifre.length < 6) nextErrors.sifre = "Şifre en az 6 karakter olmalıdır.";
    if (values.sifreTekrar !== values.sifre) nextErrors.sifreTekrar = "Şifreler eşleşmiyor.";
    if (!values.sehir) nextErrors.sehir = "Şehir seçiniz.";
    if (!values.ilce) nextErrors.ilce = "İlçe seçiniz.";
    if (!values.adres.trim()) nextErrors.adres = "Adres zorunludur.";
    return nextErrors;
  }

  async function handleSave() {
    const validation = validateForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;
    setSaving(true);
    try {
      await createPartner({
        full_name: form.adSoyad,
        tc_no: form.tcKimlik,
        phone: form.telefon,
        email: form.email,
        city: form.sehir,
        district: form.ilce,
        address: form.adres,
        company_name: form.sirketAdi || null,
        tax_number: form.vergiNo || null,
        commission_rate: form.komisyonOrani,
        status: "pending",
        notes: form.notlar || null,
      });
      toast.success("Partner başarıyla eklendi");
      setOpen(false);
      resetForm();
      fetchPartners();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Partner eklenemedi");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Partnerler</h2>
          <p className="text-muted-foreground">İş ortaklarınızı buradan yönetin</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 text-white hover:bg-blue-700">+ Yeni Partner Ekle</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Partner Ekle</DialogTitle>
              <DialogDescription>Yeni iş ortağı bilgilerini eksiksiz doldurun.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="adSoyad">Ad Soyad</Label>
                <Input id="adSoyad" value={form.adSoyad} onChange={(e) => setForm((p) => ({ ...p, adSoyad: e.target.value }))} />
                {errors.adSoyad ? <p className="text-xs text-red-600">{errors.adSoyad}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tcKimlik">TC Kimlik No</Label>
                <Input
                  id="tcKimlik"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.tcKimlik}
                  onChange={(e) => setForm((p) => ({ ...p, tcKimlik: e.target.value.replace(/\D/g, "") }))}
                />
                {errors.tcKimlik ? <p className="text-xs text-red-600">{errors.tcKimlik}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefon">Telefon</Label>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border px-3 py-2 text-sm text-muted-foreground">+90</span>
                  <Input
                    id="telefon"
                    placeholder="5XX XXX XX XX"
                    value={form.telefon}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                      const formatted = digits
                        .replace(/^(\d{0,3})/, "$1")
                        .replace(/^(\d{3})(\d{0,3})/, "$1 $2")
                        .replace(/^(\d{3}) (\d{3})(\d{0,2})/, "$1 $2 $3")
                        .replace(/^(\d{3}) (\d{3}) (\d{2})(\d{0,2})/, "$1 $2 $3 $4")
                        .trim();
                      setForm((p) => ({ ...p, telefon: formatted }));
                    }}
                  />
                </div>
                {errors.telefon ? <p className="text-xs text-red-600">{errors.telefon}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
                {errors.email ? <p className="text-xs text-red-600">{errors.email}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sifre">Şifre</Label>
                <div className="flex gap-2">
                  <Input id="sifre" type="password" value={form.sifre} onChange={(e) => setForm((p) => ({ ...p, sifre: e.target.value }))} />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    onClick={() => {
                      const generated = randomPassword(8);
                      setForm((p) => ({ ...p, sifre: generated, sifreTekrar: generated }));
                    }}
                  >
                    Otomatik Üret
                  </Button>
                </div>
                {errors.sifre ? <p className="text-xs text-red-600">{errors.sifre}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sifreTekrar">Şifre Tekrar</Label>
                <Input
                  id="sifreTekrar"
                  type="password"
                  value={form.sifreTekrar}
                  onChange={(e) => setForm((p) => ({ ...p, sifreTekrar: e.target.value }))}
                />
                {errors.sifreTekrar ? <p className="text-xs text-red-600">{errors.sifreTekrar}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Şehir</Label>
                <Select value={form.sehir} onValueChange={(value) => setForm((p) => ({ ...p, sehir: value, ilce: "" }))}>
                  <SelectTrigger><SelectValue placeholder="Şehir seçiniz" /></SelectTrigger>
                  <SelectContent>
                    {sehirler.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.sehir ? <p className="text-xs text-red-600">{errors.sehir}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>İlçe</Label>
                <Select value={form.ilce} onValueChange={(value) => setForm((p) => ({ ...p, ilce: value }))}>
                  <SelectTrigger><SelectValue placeholder="İlçe seçiniz" /></SelectTrigger>
                  <SelectContent>
                    {(ilceler[form.sehir] ?? []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                  </SelectContent>
                </Select>
                {errors.ilce ? <p className="text-xs text-red-600">{errors.ilce}</p> : null}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="adres">Adres</Label>
                <Textarea id="adres" value={form.adres} onChange={(e) => setForm((p) => ({ ...p, adres: e.target.value }))} />
                {errors.adres ? <p className="text-xs text-red-600">{errors.adres}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sirketAdi">Şirket Adı (Opsiyonel)</Label>
                <Input id="sirketAdi" value={form.sirketAdi} onChange={(e) => setForm((p) => ({ ...p, sirketAdi: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vergiNo">Vergi Numarası (Opsiyonel)</Label>
                <Input id="vergiNo" value={form.vergiNo} onChange={(e) => setForm((p) => ({ ...p, vergiNo: e.target.value }))} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Komisyon Oranı</Label>
                  <span className="text-sm font-medium">%{form.komisyonOrani}</span>
                </div>
                <Slider
                  min={20}
                  max={50}
                  step={1}
                  value={[form.komisyonOrani]}
                  onValueChange={(v) => setForm((p) => ({ ...p, komisyonOrani: v[0] ?? 30 }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notlar">Notlar (Opsiyonel)</Label>
                <Textarea id="notlar" value={form.notlar} onChange={(e) => setForm((p) => ({ ...p, notlar: e.target.value }))} />
              </div>
            </div>
            <DialogFooter className="mt-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>İptal</Button>
              <Button type="button" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Kaydet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative xl:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İsim, telefon veya email ara..."
                value={arama}
                onChange={(e) => { setArama(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={sehir} onValueChange={(v) => { setSehir(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Şehir" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tümü">Tümü</SelectItem>
                {sehirler.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={durum} onValueChange={(v) => { setDurum(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Durum" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Tümü">Tümü</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Pasif">Pasif</SelectItem>
                <SelectItem value="Beklemede">Beklemede</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sirala} onValueChange={(v) => { setSirala(v); setPage(1); }}>
              <SelectTrigger><SelectValue placeholder="Sıralama" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="En yeni">En yeni</SelectItem>
                <SelectItem value="En eski">En eski</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[1100px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Komisyon</TableHead>
                  <TableHead>Kayıt Tarihi</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-[60px] text-right">Eylemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 8 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : partners.map((partner) => (
                      <TableRow
                        key={partner.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/partnerler/${partner.id}`)}
                      >
                        <TableCell>
                          <Link href={`/partnerler/${partner.id}`} className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={cn("text-xs font-semibold", avatarColorClass(partner.full_name))}>
                                {getInitials(partner.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold">{partner.full_name}</span>
                          </Link>
                        </TableCell>
                        <TableCell>{partner.phone}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{partner.city}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">%{partner.commission_rate}</Badge>
                        </TableCell>
                        <TableCell>{formatTarih(partner.created_at)}</TableCell>
                        <TableCell>
                          <Badge className={durumClass(partner.status)}>{statusTr[partner.status] ?? partner.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem asChild>
                                <Link href={`/partnerler/${partner.id}`} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Detay Görüntüle
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Building2 className="mr-2 h-4 w-4" />
                                İşletmelerini Gör
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <ToggleLeft className="mr-2 h-4 w-4" />
                                Aktif/Pasif Yap
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">Toplam {totalCount} partner</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                Önceki
              </Button>
              {pageNumbers.map((num) => (
                <Button key={num} size="sm" variant={num === page ? "default" : "outline"} onClick={() => setPage(num)}>
                  {num}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                Sonraki
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
