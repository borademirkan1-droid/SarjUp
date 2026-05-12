"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { exportLeadsExcel } from "@/lib/export-utils";
import { type Lead, statusConfig } from "../types";

const PAGE_SIZE = 15;

export function useLeads() {
  const supabase = createClient();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Filtreler
  const [arama, setArama] = useState("");
  const [durum, setDurum] = useState("Tümü");
  const [il, setIlState] = useState("Tümü");
  const [ilce, setIlce] = useState("Tümü");
  const [sektor, setSektor] = useState("Tümü");
  const [kaynak, setKaynak] = useState("Tümü");
  const [tarihBas, setTarihBas] = useState("");
  const [tarihBitis, setTarihBitis] = useState("");
  const [page, setPage] = useState(1);

  // Filtre seçenekleri — yeni kolonlardan direkt çekilir
  const [ilListesi, setIlListesi] = useState<string[]>([]);
  const [ilceListesi, setIlceListesi] = useState<string[]>([]);
  const [sektorListesi, setSektorListesi] = useState<string[]>([]);

  // İl listesi: bir kez yükle
  useEffect(() => {
    async function loadIller() {
      const [ilRes, sektorRes] = await Promise.all([
        supabase.from("leads").select("il").not("il", "is", null),
        supabase.from("leads").select("business_type").not("business_type", "is", null),
      ]);

      if (ilRes.data) {
        const unique = [...new Set(ilRes.data.map((r) => r.il as string))]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "tr"));
        setIlListesi(unique);
      }

      if (sektorRes.data) {
        const normalized = sektorRes.data.map((r) => {
          const v = (r.business_type as string).toLowerCase().trim();
          if (v === "kafe" || v === "cafe") return "Kafe";
          if (v === "restaurant") return "Restoran";
          if (v === "hotel") return "Otel";
          if (v === "other") return "Diğer";
          return r.business_type as string;
        });
        setSektorListesi([...new Set(normalized)].sort((a, b) => a.localeCompare(b, "tr")));
      }
    }
    loadIller();
  }, []);

  // İlçe listesi: il değişince yükle
  useEffect(() => {
    if (il === "Tümü") { setIlceListesi([]); return; }
    async function loadIlceler() {
      const { data } = await supabase
        .from("leads")
        .select("ilce")
        .eq("il", il)
        .not("ilce", "is", null);
      if (data) {
        const unique = [...new Set(data.map((r) => r.ilce as string))]
          .filter(Boolean)
          .sort((a, b) => a.localeCompare(b, "tr"));
        setIlceListesi(unique);
      }
    }
    loadIlceler();
  }, [il]);

  // İl seçilince ilçeyi sıfırla
  function setIl(newIl: string) {
    setIlState(newIl);
    setIlce("Tümü");
    setPage(1);
  }

  // Ortak filtre uygulayıcı
  function applyFilters<T extends { eq: Function; in: Function; gte: Function; lte: Function; or: Function }>(q: T): T {
    if (durum !== "Tümü") {
      const key = Object.entries(statusConfig).find(([, v]) => v.label === durum)?.[0];
      if (key) q = q.eq("status", key);
    }

    // il / ilçe — artık temiz kolonlar
    if (ilce !== "Tümü") {
      q = q.eq("ilce", ilce);
    } else if (il !== "Tümü") {
      q = q.eq("il", il);
    }

    if (sektor !== "Tümü") {
      const dbValues: Record<string, string[]> = {
        Kafe: ["cafe", "Kafe"],
        Restoran: ["restaurant"],
        Otel: ["hotel"],
        Diğer: ["other"],
      };
      const vals = dbValues[sektor];
      if (vals?.length === 1) q = q.eq("business_type", vals[0]);
      else if (vals?.length > 1) q = q.in("business_type", vals);
    }

    if (kaynak !== "Tümü") q = q.eq("source", kaynak);
    if (tarihBas) q = q.gte("created_at", tarihBas);
    if (tarihBitis) q = q.lte("created_at", `${tarihBitis}T23:59:59`);
    if (arama.trim()) {
      q = q.or(
        `first_name.ilike.%${arama}%,last_name.ilike.%${arama}%,email.ilike.%${arama}%,phone.ilike.%${arama}%,region.ilike.%${arama}%`
      );
    }
    return q;
  }

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const base = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      const { data, count, error } = await applyFilters(base);
      if (error) throw error;
      setLeads(data ?? []);
      setTotalCount(count ?? 0);
    } catch (err) {
      toast.error("Başvurular yüklenemedi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, arama, durum, il, ilce, sektor, kaynak, tarihBas, tarihBitis]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  function resetFilters() {
    setArama("");
    setDurum("Tümü");
    setIlState("Tümü");
    setIlce("Tümü");
    setSektor("Tümü");
    setKaynak("Tümü");
    setTarihBas("");
    setTarihBitis("");
    setPage(1);
  }

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
    } catch (err) {
      toast.error("Durum güncellenemedi");
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveNote(id: string, note: string) {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ notes: note, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      toast.success("Not kaydedildi");
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: note } : l)));
    } catch {
      toast.error("Not kaydedilemedi");
    }
  }

  async function handleExport() {
    setExporting(true);
    try {
      const base = supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      const { data, error } = await applyFilters(base);
      if (error) throw error;
      exportLeadsExcel(data ?? []);
    } catch {
      toast.error("Export başarısız");
    } finally {
      setExporting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageNumbers = useMemo(
    () => Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1),
    [totalPages]
  );

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    leads.forEach((l) => { counts[l.status] = (counts[l.status] ?? 0) + 1; });
    return counts;
  }, [leads]);

  const hasActiveFilters =
    durum !== "Tümü" ||
    il !== "Tümü" ||
    ilce !== "Tümü" ||
    sektor !== "Tümü" ||
    kaynak !== "Tümü" ||
    tarihBas !== "" ||
    tarihBitis !== "" ||
    arama.trim() !== "";

  return {
    leads, totalCount, loading,
    arama, setArama,
    durum, setDurum,
    il, setIl,
    ilce, setIlce,
    sektor, setSektor,
    kaynak, setKaynak,
    tarihBas, setTarihBas,
    tarihBitis, setTarihBitis,
    page, setPage,
    updatingId, exporting,
    totalPages, pageNumbers, statusCounts,
    ilListesi, ilceListesi, sektorListesi,
    hasActiveFilters,
    fetchLeads, resetFilters, updateStatus, saveNote, handleExport,
  };
}
