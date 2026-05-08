"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  city: string;
}

const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Adana",
  "Konya",
  "Gaziantep",
  "Mersin",
  "Diğer",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    businessName: "",
    city: "",
  });

  function update(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Kayıt başarısız");
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  if (step === 3)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8 max-w-md">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl font-bold">Başvurunuz Alındı!</h1>
          <p className="text-muted-foreground">
            Ekibimiz en kısa sürede sizinle iletişime geçecek. Email kutunuzu
            kontrol edin.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="text-primary underline text-sm"
          >
            Giriş Yap
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 bg-card border rounded-xl p-8 shadow-sm">
        <div className="space-y-1">
          <div className="flex gap-2 mb-4">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
          <h1 className="text-xl font-bold">ŞarjUp Partner Başvurusu</h1>
          <p className="text-sm text-muted-foreground">
            {step === 1 ? "Hesap bilgileriniz" : "İşletme bilgileriniz"}
          </p>
        </div>

        {step === 1 && (
          <div className="space-y-3">
            {(
              [
                {
                  label: "Ad Soyad",
                  field: "fullName" as const,
                  type: "text",
                  placeholder: "Ahmet Yılmaz",
                },
                {
                  label: "Email",
                  field: "email" as const,
                  type: "email",
                  placeholder: "ahmet@example.com",
                },
                {
                  label: "Şifre",
                  field: "password" as const,
                  type: "password",
                  placeholder: "En az 8 karakter",
                },
                {
                  label: "Telefon",
                  field: "phone" as const,
                  type: "tel",
                  placeholder: "05XX XXX XX XX",
                },
              ] as const
            ).map(({ label, field, type, placeholder }) => (
              <div key={field} className="space-y-1">
                <label className="text-sm font-medium">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[field]}
                  onChange={(e) => update(field, e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            ))}
            <button
              onClick={() => setStep(2)}
              disabled={
                !form.fullName ||
                !form.email ||
                !form.password ||
                form.password.length < 8
              }
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
            >
              Devam →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">İşletme Adı</label>
              <input
                type="text"
                placeholder="Kafe, AVM, Otel..."
                value={form.businessName}
                onChange={(e) => update("businessName", e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Şehir</label>
              <select
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Seçin...</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border rounded-md text-sm"
              >
                ← Geri
              </button>
              <button
                onClick={submit}
                disabled={loading || !form.businessName || !form.city}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50"
              >
                {loading ? "Kaydediliyor..." : "Başvur ✓"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
