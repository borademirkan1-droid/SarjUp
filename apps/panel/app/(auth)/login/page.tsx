"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { PasswordInput } from "@/components/common/PasswordInput";
import { logActivity } from "@/lib/api/activity-logs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Lütfen geçerli bir email adresi girin");
      return;
    }

    if (!password) {
      toast.error("Lütfen şifre alanını doldurun");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error("Geçersiz email veya şifre");
        return;
      }

      if (data.user) {
        await logActivity({
          actorId: data.user.id,
          actorType: "admin",
          action: "login",
          resourceType: "auth",
          details: {
            email: data.user.email ?? email,
          },
        });
      }

      if (rememberMe) {
        localStorage.setItem("sarjup_remembered_email", email);
      } else {
        localStorage.removeItem("sarjup_remembered_email");
      }

      toast.success("Giriş başarılı, dashboard'a yönlendiriliyorsunuz");
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error("Bir hata oluştu, lütfen tekrar deneyin");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background md:grid md:grid-cols-2">
      <section className="relative hidden overflow-hidden md:flex md:flex-col md:justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 p-12 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-green-300/30 blur-3xl" />
        </div>
        <div className="relative z-10">
          <Image src="/logo.png" alt="ŞarjUp" width={180} height={56} className="h-auto w-auto" priority />
        </div>
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl font-bold leading-tight">Akıllı Şarj Yönetim Sistemi</h1>
          <p className="mt-4 text-blue-100">Partnerlerinizi, cihazlarınızı ve işletmelerinizi tek panelden yönetmenin en kolay yolu.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 md:px-12">
        <div className="w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-semibold">Giriş Yap</h2>
            <p className="mt-1 text-sm text-muted-foreground">ŞarjUp yönetim paneline erişmek için bilgilerinizi girin.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@sarjup.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <PasswordInput
                id="password"
                placeholder="••••••"
                autoComplete="current-password"
                value={password}
                onChange={setPassword}
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(Boolean(v))} disabled={isLoading} />
                Beni hatırla
              </label>
              <button type="button" className="text-sm text-primary hover:underline">
                Şifremi unuttum
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground">Yardım için: info@sarjup.com.tr</p>
        </div>
      </section>
    </div>
  );
}
