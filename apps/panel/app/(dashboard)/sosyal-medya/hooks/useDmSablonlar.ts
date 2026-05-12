"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  saveDmTemplate,
  deleteDmTemplate,
  updateDmTemplate,
} from "@/lib/actions/social";
import { DmTemplate } from "../types";

export type DmTemplateInput = {
  name: string;
  keywords: string;
  response: string;
  priority: string;
};

export function useDmSablonlar() {
  const supabase = createClient();

  const [templates, setTemplates] = useState<DmTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("social_dm_templates")
        .select("*")
        .order("priority", { ascending: false });
      if (error) throw error;
      setTemplates(data ?? []);
    } catch {
      toast.error("Şablonlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  function parseKeywords(raw: string): string[] {
    return raw.split(/[\s,]+/).map((k) => k.trim()).filter(Boolean);
  }

  async function handleCreate(input: DmTemplateInput): Promise<boolean> {
    if (!input.name.trim() || !input.response.trim()) {
      toast.error("İsim ve yanıt metni zorunludur");
      return false;
    }
    try {
      await saveDmTemplate({
        name: input.name,
        trigger_keywords: parseKeywords(input.keywords),
        response_text: input.response,
        priority: parseInt(input.priority) || 0,
      });
      toast.success("Şablon oluşturuldu");
      fetchTemplates();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Şablon oluşturulamadı");
      return false;
    }
  }

  async function handleEdit(id: string, input: DmTemplateInput): Promise<boolean> {
    try {
      await updateDmTemplate(id, {
        name: input.name,
        trigger_keywords: parseKeywords(input.keywords),
        response_text: input.response,
        priority: parseInt(input.priority) || 0,
      });
      toast.success("Şablon güncellendi");
      fetchTemplates();
      return true;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Şablon güncellenemedi");
      return false;
    }
  }

  async function handleToggle(t: DmTemplate) {
    setTogglingId(t.id);
    try {
      await updateDmTemplate(t.id, { is_active: !t.is_active });
      toast.success(t.is_active ? "Şablon devre dışı" : "Şablon aktif");
      setTemplates((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, is_active: !x.is_active } : x))
      );
    } catch {
      toast.error("Güncelleme başarısız");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteDmTemplate(id);
      toast.success("Şablon silindi");
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      toast.error("Silinemedi");
    } finally {
      setDeletingId(null);
    }
  }

  return {
    templates,
    loading,
    togglingId,
    deletingId,
    handleCreate,
    handleEdit,
    handleToggle,
    handleDelete,
  };
}
