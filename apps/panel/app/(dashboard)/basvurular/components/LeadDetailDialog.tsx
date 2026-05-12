"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { type Lead, statusConfig, formatTarih } from "../types";

type Props = {
  lead: Lead | null;
  open: boolean;
  updatingId: string | null;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, status: string) => Promise<void>;
  onSaveNote: (id: string, note: string) => Promise<void>;
  onOpenPartnerDialog: (lead: Lead) => void;
};

export function LeadDetailDialog({
  lead,
  open,
  updatingId,
  onOpenChange,
  onUpdateStatus,
  onSaveNote,
  onOpenPartnerDialog,
}: Props) {
  const [editNote, setEditNote] = useState(lead?.notes ?? "");
  const [savingNote, setSavingNote] = useState(false);

  // Sync local note when the dialog opens for a different lead
  useEffect(() => {
    setEditNote(lead?.notes ?? "");
  }, [lead?.id, lead?.notes]);

  async function handleSaveNote() {
    if (!lead) return;
    setSavingNote(true);
    await onSaveNote(lead.id, editNote);
    setSavingNote(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {lead?.first_name} {lead?.last_name ?? ""}
          </DialogTitle>
        </DialogHeader>

        {lead && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              {lead.email && (
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{lead.email}</p>
                </div>
              )}
              {lead.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Telefon</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              )}
              {lead.business_type && (
                <div>
                  <p className="text-xs text-muted-foreground">İşletme Türü</p>
                  <p className="font-medium">{lead.business_type}</p>
                </div>
              )}
              {lead.region && (
                <div>
                  <p className="text-xs text-muted-foreground">Bölge</p>
                  <p className="font-medium">{lead.region}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Kayıt Tarihi</p>
                <p className="font-medium">{formatTarih(lead.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Kaynak</p>
                <p className="font-medium">{lead.source}</p>
              </div>
            </div>

            {lead.message && (
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Mesaj</p>
                <div className="rounded-lg bg-muted p-3 text-sm">{lead.message}</div>
              </div>
            )}

            <div>
              <p className="mb-2 text-xs text-muted-foreground">Durum Güncelle</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, { label, className }]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onUpdateStatus(lead.id, key)}
                    disabled={updatingId === lead.id}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      lead.status === key ? `${className} ring-2 ring-offset-1` : "hover:bg-muted"
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
                onClick={handleSaveNote}
                disabled={savingNote}
              >
                {savingNote && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                Notu Kaydet
              </Button>
            </div>

            <Button
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              onClick={() => onOpenPartnerDialog(lead)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Partner Olarak Kaydet
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
