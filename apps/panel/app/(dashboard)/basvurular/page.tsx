"use client";

import { useState } from "react";
import { Download, Loader2, Search, X, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterCombobox } from "@/components/ui/filter-combobox";
import { useLeads } from "./hooks/useLeads";
import { usePartnerForm } from "./hooks/usePartnerForm";
import { LeadsTable } from "./components/LeadsTable";
import { LeadDetailDialog } from "./components/LeadDetailDialog";
import { PartnerConvertDialog } from "./components/PartnerConvertDialog";
import { type Lead, statusConfig } from "./types";

export default function BasvurularPage() {
  const leadsHook = useLeads();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [filtrelerAcik, setFiltrelerAcik] = useState(false);

  const syncedLead = selectedLead
    ? (leadsHook.leads.find((l) => l.id === selectedLead.id) ?? selectedLead)
    : null;

  function openDetail(lead: Lead) {
    setSelectedLead(lead);
    setDetailOpen(true);
  }

  const partnerFormHook = usePartnerForm({
    onSuccess: (lead) => {
      leadsHook.updateStatus(lead.id, "converted");
      setDetailOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Başvurular</h2>
        <p className="text-muted-foreground">
          Toplam{" "}
          <span className="font-semibold text-foreground">
            {leadsHook.totalCount.toLocaleString("tr-TR")}
          </span>{" "}
          başvuru{leadsHook.hasActiveFilters && " (filtrelenmiş)"}
        </p>
      </div>

      {/* Durum kartları */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Object.entries(statusConfig).map(([key, { label, className }]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              leadsHook.setDurum(label);
              leadsHook.setPage(1);
            }}
            className={`rounded-xl border bg-card p-3 text-left transition hover:shadow-sm ${
              leadsHook.durum === label ? "ring-2 ring-primary" : ""
            }`}
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{leadsHook.statusCounts[key] ?? 0}</p>
            <Badge className={`mt-1 text-[10px] ${className}`}>{label}</Badge>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          {/* Ana filtre satırı */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ad, email, telefon veya bölge ara..."
                value={leadsHook.arama}
                onChange={(e) => {
                  leadsHook.setArama(e.target.value);
                  leadsHook.setPage(1);
                }}
                className="pl-9"
              />
            </div>

            <Select
              value={leadsHook.durum}
              onValueChange={(v) => {
                leadsHook.setDurum(v);
                leadsHook.setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tümü">Tüm Durumlar</SelectItem>
                {Object.values(statusConfig).map(({ label }) => (
                  <SelectItem key={label} value={label}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={filtrelerAcik ? "secondary" : "outline"}
              onClick={() => setFiltrelerAcik((v) => !v)}
              className="shrink-0 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filtreler
              {leadsHook.hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                  !
                </Badge>
              )}
            </Button>

            <Button variant="outline" onClick={leadsHook.fetchLeads} className="shrink-0">
              Yenile
            </Button>

            <Button
              variant="outline"
              onClick={leadsHook.handleExport}
              disabled={leadsHook.exporting}
              className="shrink-0"
            >
              {leadsHook.exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Excel
            </Button>
          </div>

          {/* Gelişmiş filtreler */}
          {filtrelerAcik && (
            <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-3 sm:grid-cols-4">
              {/* İl / İlçe — arama destekli combobox */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">
                  İl / İlçe
                </label>
                <FilterCombobox
                  options={leadsHook.bolgeListesi}
                  value={leadsHook.bolge}
                  allLabel="Tüm Bölgeler"
                  placeholder="İl veya ilçe ara…"
                  onChange={(v) => {
                    leadsHook.setBolge(v);
                    leadsHook.setPage(1);
                  }}
                />
              </div>

              {/* Sektör */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Sektör</label>
                <Select
                  value={leadsHook.sektor}
                  onValueChange={(v) => {
                    leadsHook.setSektor(v);
                    leadsHook.setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tüm Sektörler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tümü">Tüm Sektörler</SelectItem>
                    {leadsHook.sektorListesi.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Kaynak */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">Kaynak</label>
                <Select
                  value={leadsHook.kaynak}
                  onValueChange={(v) => {
                    leadsHook.setKaynak(v);
                    leadsHook.setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Tüm Kaynaklar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tümü">Tüm Kaynaklar</SelectItem>
                    <SelectItem value="google_maps_scraper">Google Maps</SelectItem>
                    <SelectItem value="website_form">Web Formu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tarih aralığı */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Tarih Aralığı
                </label>
                <div className="flex items-center gap-1">
                  <Input
                    type="date"
                    value={leadsHook.tarihBas}
                    onChange={(e) => {
                      leadsHook.setTarihBas(e.target.value);
                      leadsHook.setPage(1);
                    }}
                    className="h-8 text-xs"
                  />
                  <span className="text-muted-foreground">–</span>
                  <Input
                    type="date"
                    value={leadsHook.tarihBitis}
                    onChange={(e) => {
                      leadsHook.setTarihBitis(e.target.value);
                      leadsHook.setPage(1);
                    }}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Filtreleri temizle */}
              {leadsHook.hasActiveFilters && (
                <div className="col-span-2 flex items-end sm:col-span-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={leadsHook.resetFilters}
                    className="gap-1.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                    Filtreleri Temizle
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <LeadsTable
            leads={leadsHook.leads}
            loading={leadsHook.loading}
            updatingId={leadsHook.updatingId}
            totalCount={leadsHook.totalCount}
            page={leadsHook.page}
            totalPages={leadsHook.totalPages}
            pageNumbers={leadsHook.pageNumbers}
            onOpenDetail={openDetail}
            onUpdateStatus={leadsHook.updateStatus}
            onOpenPartnerDialog={partnerFormHook.openPartnerDialog}
            onPageChange={leadsHook.setPage}
          />
        </CardContent>
      </Card>

      <LeadDetailDialog
        lead={syncedLead}
        open={detailOpen}
        updatingId={leadsHook.updatingId}
        onOpenChange={setDetailOpen}
        onUpdateStatus={leadsHook.updateStatus}
        onSaveNote={leadsHook.saveNote}
        onOpenPartnerDialog={partnerFormHook.openPartnerDialog}
      />

      <PartnerConvertDialog
        partnerDialogOpen={partnerFormHook.partnerDialogOpen}
        partnerForm={partnerFormHook.partnerForm}
        partnerSaving={partnerFormHook.partnerSaving}
        closePartnerDialog={partnerFormHook.closePartnerDialog}
        updateField={partnerFormHook.updateField}
        handlePartnerCreate={partnerFormHook.handlePartnerCreate}
      />
    </div>
  );
}
