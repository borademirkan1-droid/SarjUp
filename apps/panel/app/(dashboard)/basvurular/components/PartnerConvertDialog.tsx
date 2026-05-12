"use client";

import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { usePartnerForm } from "../hooks/usePartnerForm";

type PartnerFormHook = ReturnType<typeof usePartnerForm>;

type Props = Pick<
  PartnerFormHook,
  | "partnerDialogOpen"
  | "partnerForm"
  | "partnerSaving"
  | "closePartnerDialog"
  | "updateField"
  | "handlePartnerCreate"
>;

export function PartnerConvertDialog({
  partnerDialogOpen,
  partnerForm,
  partnerSaving,
  closePartnerDialog,
  updateField,
  handlePartnerCreate,
}: Props) {
  return (
    <Dialog open={partnerDialogOpen} onOpenChange={(open) => !open && closePartnerDialog()}>
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
                onChange={(e) => updateField("full_name", e.target.value)}
                placeholder="Ad Soyad"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">TC Kimlik No *</label>
              <Input
                value={partnerForm.tc_no}
                onChange={(e) => updateField("tc_no", e.target.value)}
                placeholder="11 haneli TC No"
                maxLength={11}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Telefon *</label>
              <Input
                value={partnerForm.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="05xx xxx xx xx"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Email</label>
              <Input
                value={partnerForm.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Şehir *</label>
              <Input
                value={partnerForm.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="İstanbul"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">İlçe *</label>
              <Input
                value={partnerForm.district}
                onChange={(e) => updateField("district", e.target.value)}
                placeholder="Kadıköy"
              />
            </div>
            <div className="col-span-2">
              <label className="mb-1 block text-xs text-muted-foreground">Adres *</label>
              <Textarea
                value={partnerForm.address}
                onChange={(e) => updateField("address", e.target.value)}
                placeholder="Açık adres"
                rows={2}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Firma Adı</label>
              <Input
                value={partnerForm.company_name}
                onChange={(e) => updateField("company_name", e.target.value)}
                placeholder="Opsiyonel"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Komisyon %</label>
              <Input
                type="number"
                value={partnerForm.commission_rate}
                onChange={(e) => updateField("commission_rate", e.target.value)}
                min={0}
                max={100}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={closePartnerDialog}>
            İptal
          </Button>
          <Button
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handlePartnerCreate}
            disabled={partnerSaving}
          >
            {partnerSaving
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <UserPlus className="mr-2 h-4 w-4" />}
            Partner Oluştur
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
