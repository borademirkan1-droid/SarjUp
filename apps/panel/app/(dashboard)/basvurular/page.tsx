"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Eye,
  Loader2,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Search,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import { exportLeadsExcel } from "@/lib/export-utils";
import { createPartner } from "@/lib/api/partners";
import type { PartnerInsert } from "@/lib/supabase/types";

const PAGE_SIZE = 15;

type Lead = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  business_type: string | null;
  region: string | null;
  message: string | null;
  status: string;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Yeni", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  contacted: { label: "İletişime Geçildi", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  interested: { label: "İlgileniyor", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  converted: { label: "Partner Oldu", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  rejected: { label: "Reddedildi", className: "bg-red-100 text-red-600 hover:bg-red-100" },
};

function formatTarih(value: string) {
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function BasvurularPage() {
  const supabase = createClient();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("Tümü");
  const [page, setPage] = useState(1);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [partnerSourceLead, setPartnerSourceLead] = useState<Lead | null>(null);
  const [partnerSaving, setPartnerSaving] = useState(false);
  const [partnerForm, setPartnerForm] = useState({
    full_name: "",
    tc_no: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    address: "",
    company_name: "",
    commission_rate: "20",
  });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      if (durum !== "Tümü") {
        const statusKey = Object.entries(statusConfig).find(([, v]) => v.label === durum)?.[0];
        if (statusKey) query = query.eq("status", statusKey);
      }

      if (arama.trim()) {
        query = query.or(
          `first_name.ilike.%${arama}%,last_name.ilike.%${arama}%,email.ilike.%${arama}%,phone.ilike.%${arama}%,region.ilike.%${arama}%`
        );
      }

      const { data, count, error } = await query;
      if (error) throw error;
      setLeads(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error("Başvurular yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, arama, durum]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageNumbers = useMemo(() => Array.from({ length: totalPages }, (_, i) => i + 1), [totalPages]);

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success(`Durum güncellendi: ${statusConfig[status]?.label}`);
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, status } : prev);
    } catch (err) {
      toast.error("Durum güncellenemedi");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveNote(id: string) {
    setSavingNote(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes: editNote, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Not kaydedildi");
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: editNote } : l)));
      if (selectedLead?.id === id) setSelectedLead((prev) => prev ? { ...prev, notes: editNote } : prev);
    } catch (err) {
      toast.error("Not kaydedilemedi");
    } finally {
      setSavingNote(false);
    }
  }

  function openDetail(lead: Lead) {
    setSelectedLead(lead);
    setEditNote(lead.notes ?? "");
    setDetailOpen(true);
  }

  async function handleExport() {
    setExporting(true);
    try {
      let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
      if (durum !== "Tümü") {
        const statusKey = Object.entries(statusConfig).find(([, v]) => v.label === durum)?.[0];
        if (statusKey) query = query.eq("status", statusKey);
      }
      if (arama.trim()) {
        query = query.or(
          `first_name.ilike.%${arama}%,last_name.ilike.%${arama}%,email.ilike.%${arama}%,phone.ilike.%${arama}%,region.ilike.%${arama}%`
        );
      }
      const { data, error } = await query;
      if (error) throw error;
      exportLeadsExcel(data ?? []);
    } catch {
      toast.error("Export başarısız");
    } finally {
      setExporting(false);
    }
  }

  function openPartnerDialog(lead: Lead) {
    setPartnerSourceLead(lead);
    setPartnerForm({
      full_name: [lead.first_name, lead.last_name].filter(Boolean).join(" "),
      tc_no: "",
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      city: lead.region ?? "",
      district: "",
      address: "",
      company_name: "",
      commission_rate: "20",
    });
    setPartnerDialogOpen(true);
  }

  async function handlePartnerCreate() {
    const { full_name, tc_no, phone, email, city, district, address, company_name, commission_rate } = partnerForm;
    if (!full_name.trim() || !tc_no.trim() || !phone.trim() || !city.trim() || !district.trim() || !address.trim()) {
      toast.error("Zorunlu alanları doldurun");
      return;
    }
    setPartnerSaving(true);
    try {
      const insertData: PartnerInsert = {
        full_name,
        tc_no,
        phone,
        email,
        city,
        district,
        address,
        company_name: company_name || null,
        tax_number: null,
        commission_rate: parseFloat(commission_rate) || 20,
        status: "pending",
        notes: partnerSourceLead ? `Lead'den dönüştürüldü: ${partnerSourceLead.id}` : null,
      };
      await createPartner(insertData);
      if (partnerSourceLead) {
        await updateStatus(partnerSourceLead.id, "converted");
      }
      toast.success("Partner oluşturuldu, onay bekliyor");
      setPartnerDialogOpen(false);
      setDetailOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Partner oluşturulamadı");
    } finally {
      setPartnerSaving(false);
    }
  }

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] ?? 0) + 1; });
    return counts;
  }, [leads]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Başvurular</h2>
        <p className="text-muted-foreground">Web formu ve Google Maps scraper&apos;dan gelen tüm başvurular</p>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(statusConfig).map(([key, { label, className }]) => (
          <button
            key={key}
            type="button"
            onClick={() => { setDurum(label); setPage(1); }}
            className="rounded-xl border bg-card p-3 text-left transition hover:shadow-sm"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{statusCounts[key] ?? 0}</p>
            <Badge className={`mt-1 text-[10px] ${className}`}>{label}</Badge>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ad, email, telefon veya bölge ara..."
                value={arama}
                onChange={(e) => { setArama(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={durum} onValueChange={(v) => { setDurum(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Durum filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tümü">Tüm Durumlar</SelectItem>
                {Object.values(statusConfig).map(({ label }) => (
                  <SelectItem key={label} value={label}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchLeads} className="shrink-0">Yenile</Button>
            <Button variant="outline" onClick={handleExport} disabled={exporting} className="shrink-0">
              {exporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Excel
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>İşletme Türü</TableHead>
                  <TableHead>Bölge</TableHead>
                  <TableHead>Mesaj</TableHead>
                  <TableHead>Kaynak</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="w-[60px] text-right">İşlem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 9 }).map((_, j) => (
                          <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  : leads.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={9} className="py-16 text-center text-muted-foreground">
                          Başvuru bulunamadı
                        </TableCell>
                      </TableRow>
                    )
                  : leads.map((lead) => (
                      <TableRow
                        key={lead.id}
                        className="cursor-pointer"
                        onClick={() => openDetail(lead)}
                      >
                        <TableCell className="font-medium">
                          {lead.first_name} {lead.last_name ?? ""}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5 text-xs">
                            {lead.email && <span className="text-muted-foreground">{lead.email}</span>}
                            {lead.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />{lead.phone}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{lead.business_type ?? <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell>{lead.region ?? <span className="text-muted-foreground">—</span>}</TableCell>
                        <TableCell className="max-w-[180px]">
                          {lead.message
                            ? <span className="line-clamp-2 text-xs text-muted-foreground">{lead.message}</span>
                            : <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                            {lead.source === "google_maps_scraper" ? "🗺 Maps" : "🌐 Form"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTarih(lead.created_at)}
                        </TableCell>
                        <TableCell>
                          {updatingId === lead.id
                            ? <Loader2 className="h-4 w-4 animate-spin" />
                            : <Badge className={statusConfig[lead.status]?.className ?? ""}>
                                {statusConfig[lead.status]?.label ?? lead.status}
                              </Badge>
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                              <DropdownMenuItem onClick={() => openDetail(lead)}>
                                <Eye className="mr-2 h-4 w-4" />Detay Gör
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => updateStatus(lead.id, "contacted")}>
                                <MessageSquare className="mr-2 h-4 w-4" />İletişime Geçildi
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(lead.id, "interested")}>
                                <UserCheck className="mr-2 h-4 w-4 text-purple-600" />İlgileniyor
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(lead.id, "converted")}>
                                <UserCheck className="mr-2 h-4 w-4 text-emerald-600" />Partner Oldu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); openPartnerDialog(lead); }}
                              >
                                <UserPlus className="mr-2 h-4 w-4 text-emerald-600" />Partner Yap
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateStatus(lead.id, "rejected")}
                                className="text-red-600 focus:text-red-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />Reddet
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
            <p className="text-sm text-muted-foreground">Toplam {totalCount} başvuru</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Önceki</Button>
              {pageNumbers.slice(0, 7).map((num) => (
                <Button key={num} size="sm" variant={num === page ? "default" : "outline"} onClick={() => setPage(num)}>
                  {num}
                </Button>
              ))}
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Sonraki</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Oluşturma Dialog */}
      <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Partner Olarak Kaydet</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">Ad Soyad *</label>
                <Input
                  value={partnerForm.full_name}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, full_name: e.target.value }))}
                  placeholder="Ad Soyad"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">TC Kimlik No *</label>
                <Input
                  value={partnerForm.tc_no}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, tc_no: e.target.value }))}
                  placeholder="11 haneli TC No"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Telefon *</label>
                <Input
                  value={partnerForm.phone}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="05xx xxx xx xx"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Email</label>
                <Input
                  value={partnerForm.email}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Şehir *</label>
                <Input
                  value={partnerForm.city}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, city: e.target.value }))}
                  placeholder="İstanbul"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">İlçe *</label>
                <Input
                  value={partnerForm.district}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, district: e.target.value }))}
                  placeholder="Kadıköy"
                />
              </div>
              <div className="col-span-2">
                <label className="mb-1 block text-xs text-muted-foreground">Adres *</label>
                <Textarea
                  value={partnerForm.address}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Açık adres"
                  rows={2}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Firma Adı</label>
                <Input
                  value={partnerForm.company_name}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, company_name: e.target.value }))}
                  placeholder="Opsiyonel"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Komisyon %</label>
                <Input
                  type="number"
                  value={partnerForm.commission_rate}
                  onChange={(e) => setPartnerForm((f) => ({ ...f, commission_rate: e.target.value }))}
                  min={0}
                  max={100}
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setPartnerDialogOpen(false)}>
              İptal
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handlePartnerCreate}
              disabled={partnerSaving}
            >
              {partnerSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Partner Oluştur
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedLead?.first_name} {selectedLead?.last_name ?? ""}
            </DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {selectedLead.email && (
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{selectedLead.email}</p>
                  </div>
                )}
                {selectedLead.phone && (
                  <div>
                    <p className="text-xs text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedLead.phone}</p>
                  </div>
                )}
                {selectedLead.business_type && (
                  <div>
                    <p className="text-xs text-muted-foreground">İşletme Türü</p>
                    <p className="font-medium">{selectedLead.business_type}</p>
                  </div>
                )}
                {selectedLead.region && (
                  <div>
                    <p className="text-xs text-muted-foreground">Bölge</p>
                    <p className="font-medium">{selectedLead.region}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Kayıt Tarihi</p>
                  <p className="font-medium">{formatTarih(selectedLead.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kaynak</p>
                  <p className="font-medium">{selectedLead.source}</p>
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Mesaj</p>
                  <div className="rounded-lg bg-muted p-3 text-sm">{selectedLead.message}</div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs text-muted-foreground">Durum Güncelle</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, { label, className }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => updateStatus(selectedLead.id, key)}
                      disabled={updatingId === selectedLead.id}
                      className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                        selectedLead.status === key
                          ? className + " ring-2 ring-offset-1"
                          : "hover:bg-muted"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs text-muted-foreground">Not Ekle</p>
                <Textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Bu başvuru hakkında not..."
                  rows={3}
                />
                <Button
                  size="sm"
                  className="mt-2"
                  onClick={() => saveNote(selectedLead.id)}
                  disabled={savingNote}
                >
                  {savingNote ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                  Notu Kaydet
                </Button>
              </div>

              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => openPartnerDialog(selectedLead)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Partner Olarak Kaydet
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
