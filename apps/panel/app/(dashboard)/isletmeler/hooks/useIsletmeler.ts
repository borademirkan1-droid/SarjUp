"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { getBusinesses, createBusiness } from "@/lib/api/businesses";
import { getPartners } from "@/lib/api/partners";
import type { BusinessWithPartner, Partner } from "@/lib/supabase/types";
import {
  PAGE_SIZE,
  tipMapToDb,
  initialForm,
  type FormState,
} from "../constants";

export type Filters = {
  arama: string;
  partner: string;
  sehir: string;
  tip: string;
  durum: string;
};

export function useIsletmeler() {
  const [businesses, setBusinesses] = useState<BusinessWithPartner[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    arama: "",
    partner: "Tümü",
    sehir: "Tümü",
    tip: "Tümü",
    durum: "Tümü",
  });

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bizResult, partnerResult] = await Promise.all([
        getBusinesses({
          page,
          limit: PAGE_SIZE,
          search: filters.arama || undefined,
          partnerId: filters.partner !== "Tümü" ? filters.partner : undefined,
          city: filters.sehir !== "Tümü" ? filters.sehir : undefined,
          type: filters.tip !== "Tümü" ? filters.tip : undefined,
          status: filters.durum !== "Tümü" ? filters.durum : undefined,
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
  }, [page, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function validate(values: FormState): Partial<Record<keyof FormState, string>> {
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

  return {
    businesses,
    partners,
    totalCount,
    totalPages,
    loading,
    page,
    setPage,
    filters,
    setFilter,
    open,
    setOpen,
    saving,
    form,
    setForm,
    errors,
    saveBusiness,
  };
}
