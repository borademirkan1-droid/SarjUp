"use client";

import { useState } from "react";
import { toast } from "sonner";
import { createPartner } from "@/lib/api/partners";
import type { PartnerInsert } from "@/lib/supabase/types";
import type { Lead } from "../types";

type PartnerFormState = {
  full_name: string;
  tc_no: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  company_name: string;
  commission_rate: string;
};

const EMPTY_FORM: PartnerFormState = {
  full_name: "",
  tc_no: "",
  phone: "",
  email: "",
  city: "",
  district: "",
  address: "",
  company_name: "",
  commission_rate: "20",
};

type UsePartnerFormOptions = {
  onSuccess: (lead: Lead) => void;
};

export function usePartnerForm({ onSuccess }: UsePartnerFormOptions) {
  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false);
  const [partnerSourceLead, setPartnerSourceLead] = useState<Lead | null>(null);
  const [partnerSaving, setPartnerSaving] = useState(false);
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(EMPTY_FORM);

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

  function closePartnerDialog() {
    setPartnerDialogOpen(false);
  }

  function updateField<K extends keyof PartnerFormState>(key: K, value: PartnerFormState[K]) {
    setPartnerForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handlePartnerCreate() {
    const { full_name, tc_no, phone, email, city, district, address, company_name, commission_rate } =
      partnerForm;

    if (
      !full_name.trim() ||
      !tc_no.trim() ||
      !phone.trim() ||
      !city.trim() ||
      !district.trim() ||
      !address.trim()
    ) {
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
        onSuccess(partnerSourceLead);
      }

      toast.success("Partner oluşturuldu, onay bekliyor");
      setPartnerDialogOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Partner oluşturulamadı");
    } finally {
      setPartnerSaving(false);
    }
  }

  return {
    partnerDialogOpen,
    partnerSourceLead,
    partnerSaving,
    partnerForm,
    openPartnerDialog,
    closePartnerDialog,
    updateField,
    handlePartnerCreate,
  };
}
