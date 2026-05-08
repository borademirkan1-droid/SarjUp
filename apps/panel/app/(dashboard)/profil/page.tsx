"use client";

import { FormEvent, useEffect, useState } from "react";
import { KeyRound, Mail, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDateTR } from "@/lib/format";
import { PasswordInput } from "@/components/common/PasswordInput";
import { getPasswordStrength, validateStrongPassword } from "@/lib/password";
import { cn } from "@/lib/utils";
import { logActivity } from "@/lib/api/activity-logs";

export default function ProfilPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [lastSignInAt, setLastSignInAt] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        return;
      }
      setUserId(data.user.id);
      setEmail(data.user.email ?? "");
      setCreatedAt(data.user.created_at ?? null);
      setLastSignInAt(data.user.last_sign_in_at ?? null);
    }

    fetchUser();
  }, [supabase.auth]);

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email) {
      toast.error("Kullanıcı bilgisi alınamadı.");
      return;
    }

    if (!oldPassword || !newPassword || !newPasswordAgain) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    if (newPassword !== newPasswordAgain) {
      toast.error("Yeni şifreler eşleşmiyor.");
      return;
    }

    const passwordValidation = validateStrongPassword(newPassword);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0]);
      return;
    }

    setLoading(true);
    try {
      const checkOldPassword = await supabase.auth.signInWithPassword({
        email,
        password: oldPassword,
      });

      if (checkOldPassword.error) {
        toast.error("Eski şifre hatalı.");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        throw error;
      }

      if (userId) {
        await logActivity({
          actorId: userId,
          actorType: "admin",
          action: "change_password",
          resourceType: "auth",
          details: {
            email,
          },
        });
      }

      toast.success("Şifreniz başarıyla güncellendi.");
      setOldPassword("");
      setNewPassword("");
      setNewPasswordAgain("");
    } catch (error) {
      console.error(error);
      toast.error("Şifre güncellenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil Bilgileri</CardTitle>
          <CardDescription>Hesap bilgilerinizi görüntüleyin ve şifrenizi güncelleyin.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Mail className="h-4 w-4 text-blue-600" />
              E-posta
            </div>
            <p className="text-sm text-muted-foreground">{email || "-"}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <UserCircle className="h-4 w-4 text-blue-600" />
              Oluşturulma Tarihi
            </div>
            <p className="text-sm text-muted-foreground">{formatDateTR(createdAt)}</p>
          </div>
          <div className="rounded-lg border bg-muted/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <KeyRound className="h-4 w-4 text-blue-600" />
              Son Giriş
            </div>
            <p className="text-sm text-muted-foreground">{formatDateTR(lastSignInAt)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Şifre Değiştir</CardTitle>
          <CardDescription>Güvenliğiniz için güçlü bir şifre belirleyin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handlePasswordSubmit}>
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Eski Şifre</Label>
              <PasswordInput
                id="oldPassword"
                placeholder="Eski şifrenizi girin"
                value={oldPassword}
                onChange={setOldPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Şifre</Label>
              <PasswordInput
                id="newPassword"
                placeholder="Yeni şifrenizi girin"
                value={newPassword}
                onChange={setNewPassword}
              />
              {newPassword ? (
                <div className="space-y-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full transition-all",
                        getPasswordStrength(newPassword) === "zayif" && "w-1/3 bg-red-500",
                        getPasswordStrength(newPassword) === "orta" && "w-2/3 bg-amber-500",
                        getPasswordStrength(newPassword) === "guclu" && "w-full bg-emerald-600",
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Şifre gücü:{" "}
                    <span className="font-medium">
                      {getPasswordStrength(newPassword) === "zayif"
                        ? "Zayıf"
                        : getPasswordStrength(newPassword) === "orta"
                          ? "Orta"
                          : "Güçlü"}
                    </span>
                  </p>
                </div>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPasswordAgain">Yeni Şifre (Tekrar)</Label>
              <PasswordInput
                id="newPasswordAgain"
                placeholder="Yeni şifrenizi tekrar girin"
                value={newPasswordAgain}
                onChange={setNewPasswordAgain}
              />
            </div>
            <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700" disabled={loading}>
              {loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
