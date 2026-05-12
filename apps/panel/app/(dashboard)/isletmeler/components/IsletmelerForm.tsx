"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Partner } from "@/lib/supabase/types";
import { sehirler, ilceler, tiplerTr, type FormState } from "../constants";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormState;
  onFormChange: (updater: (prev: FormState) => FormState) => void;
  errors: Partial<Record<keyof FormState, string>>;
  saving: boolean;
  onSave: () => void;
  partners: Partner[];
};

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-600">{message}</p>;
}

export function IsletmelerForm({
  open,
  onOpenChange,
  form,
  onFormChange,
  errors,
  saving,
  onSave,
  partners,
}: Props) {
  function field<K extends keyof FormState>(key: K) {
    return (value: FormState[K]) => onFormChange((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>+ Yeni İşletme</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni İşletme Ekle</DialogTitle>
          <DialogDescription>
            Formu doldurarak yeni işletme kaydı oluşturabilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>İşletme adı</Label>
            <Input
              value={form.isletmeAdi}
              onChange={(e) => field("isletmeAdi")(e.target.value)}
            />
            <FieldError message={errors.isletmeAdi} />
          </div>

          <div className="space-y-2">
            <Label>İşletme tipi</Label>
            <Select value={form.tip} onValueChange={field("tip")}>
              <SelectTrigger><SelectValue placeholder="Tip seçiniz" /></SelectTrigger>
              <SelectContent>
                {tiplerTr.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.tip} />
          </div>

          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input
              value={form.telefon}
              onChange={(e) => field("telefon")(e.target.value)}
            />
            <FieldError message={errors.telefon} />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => field("email")(e.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Adres</Label>
            <Textarea
              value={form.adres}
              onChange={(e) => field("adres")(e.target.value)}
            />
            <FieldError message={errors.adres} />
          </div>

          <div className="space-y-2">
            <Label>Şehir</Label>
            <Select
              value={form.sehir}
              onValueChange={(v) =>
                onFormChange((prev) => ({ ...prev, sehir: v, ilce: "" }))
              }
            >
              <SelectTrigger><SelectValue placeholder="Şehir seçiniz" /></SelectTrigger>
              <SelectContent>
                {sehirler.map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.sehir} />
          </div>

          <div className="space-y-2">
            <Label>İlçe</Label>
            <Select value={form.ilce} onValueChange={field("ilce")}>
              <SelectTrigger><SelectValue placeholder="İlçe seçiniz" /></SelectTrigger>
              <SelectContent>
                {(ilceler[form.sehir] ?? []).map((item) => (
                  <SelectItem key={item} value={item}>{item}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.ilce} />
          </div>

          <div className="space-y-2">
            <Label>Bağlı Partner</Label>
            <Select value={form.bagliPartnerId} onValueChange={field("bagliPartnerId")}>
              <SelectTrigger><SelectValue placeholder="Partner seçiniz" /></SelectTrigger>
              <SelectContent>
                {partners.map((item) => (
                  <SelectItem key={item.id} value={item.id}>{item.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.bagliPartnerId} />
          </div>

          <div className="space-y-2">
            <Label>Yetkili kişi adı</Label>
            <Input
              value={form.yetkiliAdi}
              onChange={(e) => field("yetkiliAdi")(e.target.value)}
            />
            <FieldError message={errors.yetkiliAdi} />
          </div>

          <div className="space-y-2">
            <Label>Yetkili telefonu</Label>
            <Input
              value={form.yetkiliTelefon}
              onChange={(e) => field("yetkiliTelefon")(e.target.value)}
            />
            <FieldError message={errors.yetkiliTelefon} />
          </div>

          <div className="space-y-2">
            <Label>Cihaz sayısı</Label>
            <Input
              type="number"
              min={1}
              max={8}
              value={form.cihazSayisi}
              onChange={(e) => field("cihazSayisi")(Number(e.target.value))}
            />
            <FieldError message={errors.cihazSayisi} />
          </div>

          <div className="space-y-2">
            <Label>Aylık ücret (TL)</Label>
            <Input
              type="number"
              min={500}
              max={3000}
              value={form.aylikUcret}
              onChange={(e) => field("aylikUcret")(Number(e.target.value))}
            />
            <FieldError message={errors.aylikUcret} />
          </div>

          <div className="space-y-2">
            <Label>Sözleşme başlangıç tarihi</Label>
            <Input
              type="date"
              value={form.sozlesmeBaslangic}
              onChange={(e) => field("sozlesmeBaslangic")(e.target.value)}
            />
            <FieldError message={errors.sozlesmeBaslangic} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Notlar</Label>
            <Textarea
              value={form.notlar}
              onChange={(e) => field("notlar")(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
