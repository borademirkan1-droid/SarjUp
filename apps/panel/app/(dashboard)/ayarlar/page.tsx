"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { PasswordInput } from "@/components/common/PasswordInput";
import { createClient } from "@/lib/supabase/client";
import { logActivity } from "@/lib/api/activity-logs";
import { getPasswordStrength, validateStrongPassword } from "@/lib/password";
import { cn } from "@/lib/utils";

interface AppSettings {
  id: string;
  singleton: boolean;
  company_name: string;
  default_commission_rate: number;
  currency: string;
  updated_by: string | null;
}

export default function AyarlarPage() {
  const supabase = createClient();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [commissionRate, setCommissionRate] = useState("30");
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function initPage() {
      try {
        const { data: userResult } = await supabase.auth.getUser();
        const user = userResult.user;
        const role =
          (typeof user?.app_metadata?.role === "string" && user.app_metadata.role) ||
          (typeof user?.user_metadata?.role === "string" && user.user_metadata.role) ||
          "";
        setIsSuperAdmin(role === "super_admin");
        setCurrentUserId(user?.id ?? null);

        const { data, error } = await supabase
          .from("app_settings")
          .select("id, singleton, company_name, default_commission_rate, currency, updated_by")
          .limit(1)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          setSettings(data as AppSettings);
          setCompanyName(data.company_name);
          setCommissionRate(String(data.default_commission_rate));
        } else {
          setCompanyName("ŞarjUp");
          setCommissionRate("30");
        }
      } catch (error) {
        console.error(error);
        toast.error("Ayarlar yüklenemedi.");
      }
    }

    initPage();
  }, [supabase]);

  async function handleSaveGeneralSettings() {
    const parsedCommission = Number(commissionRate);
    if (Number.isNaN(parsedCommission) || parsedCommission < 0 || parsedCommission > 100) {
      toast.error("Komisyon oranı 0 ile 100 arasında olmalıdır.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("app_settings")
        .upsert(
          {
            singleton: true,
            company_name: companyName,
            default_commission_rate: parsedCommission,
            currency: "TL",
            updated_by: currentUserId,
          },
          { onConflict: "singleton" },
        )
        .select("id, singleton, company_name, default_commission_rate, currency, updated_by")
        .single();

      if (error) {
        throw error;
      }

      setSettings(data as AppSettings);

      toast.success("Genel ayarlar güncellendi.");
      if (currentUserId) {
        await logActivity({
          actorId: currentUserId,
          actorType: "admin",
          action: "update_settings",
          resourceType: "app_settings",
          resourceId: data.id,
          details: {
            company_name: companyName,
            default_commission_rate: parsedCommission,
            currency: "TL",
          },
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Ayarlar kaydedilemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateSuperAdmin() {
    if (!newAdminEmail || !newAdminPassword) {
      toast.error("E-posta ve şifre zorunludur.");
      return;
    }

    const passwordValidation = validateStrongPassword(newAdminPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    setCreatingAdmin(true);
    try {
      const response = await fetch("/api/admin/create-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAdminEmail.trim(),
          password: newAdminPassword,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Süper admin oluşturulamadı.");
      }

      toast.success("Yeni süper admin kullanıcı oluşturuldu.");
      setNewAdminEmail("");
      setNewAdminPassword("");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Süper admin oluşturulamadı.");
    } finally {
      setCreatingAdmin(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
          <CardDescription>Sistem genelinde kullanılacak varsayılan parametreler.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="companyName">Şirket Adı</Label>
            <Input id="companyName" value={companyName} onChange={(event) => setCompanyName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultCommissionRate">Varsayılan Komisyon Oranı (%)</Label>
            <Input
              id="defaultCommissionRate"
              type="number"
              min={0}
              max={100}
              value={commissionRate}
              onChange={(event) => setCommissionRate(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Para Birimi</Label>
            <Input id="currency" value="TL (₺)" disabled />
          </div>
          <div className="md:col-span-3">
            <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleSaveGeneralSettings} disabled={submitting}>
              {submitting ? "Kaydediliyor..." : "Genel Ayarları Kaydet"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Yönetimi</CardTitle>
          <CardDescription>Yeni süper admin kullanıcı oluşturun.</CardDescription>
        </CardHeader>
        <CardContent>
          {!isSuperAdmin ? (
            <EmptyState icon={UserPlus} title="Erişim kısıtlı" description="Kullanıcı yönetimini görüntülemek için super_admin yetkisi gerekir." />
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                E-posta davet altyapısı şu anda aktif değil. Bu form, kullanıcıyı doğrudan Supabase Auth üzerinde
                `super_admin` rolüyle oluşturur.
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newAdminEmail">Admin E-posta</Label>
                  <Input
                    id="newAdminEmail"
                    type="email"
                    placeholder="admin@ornek.com"
                    value={newAdminEmail}
                    onChange={(event) => setNewAdminEmail(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newAdminPassword">Güçlü Şifre</Label>
                  <PasswordInput
                    id="newAdminPassword"
                    placeholder="En az 8 karakter"
                    value={newAdminPassword}
                    onChange={setNewAdminPassword}
                  />
                  {newAdminPassword ? (
                    <div className="space-y-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full transition-all",
                            getPasswordStrength(newAdminPassword) === "zayif" && "w-1/3 bg-red-500",
                            getPasswordStrength(newAdminPassword) === "orta" && "w-2/3 bg-amber-500",
                            getPasswordStrength(newAdminPassword) === "guclu" && "w-full bg-emerald-600",
                          )}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Şifre gücü:{" "}
                        <span className="font-medium">
                          {getPasswordStrength(newAdminPassword) === "zayif"
                            ? "Zayıf"
                            : getPasswordStrength(newAdminPassword) === "orta"
                              ? "Orta"
                              : "Güçlü"}
                        </span>
                      </p>
                      <ul className="space-y-1 text-xs text-muted-foreground">
                        <li>- En az 8 karakter</li>
                        <li>- En az 1 büyük harf</li>
                        <li>- En az 1 küçük harf</li>
                        <li>- En az 1 rakam</li>
                        <li>- En az 1 özel karakter</li>
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>

              <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleCreateSuperAdmin} disabled={creatingAdmin}>
                <UserPlus className="mr-2 h-4 w-4" />
                {creatingAdmin ? "Oluşturuluyor..." : "Süper Admin Oluştur"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}