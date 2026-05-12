export type Lead = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  business_type: string | null;
  region: string | null;
  il: string | null;
  ilce: string | null;
  message: string | null;
  status: string;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "Yeni", className: "bg-blue-100 text-blue-700 hover:bg-blue-100" },
  contacted: { label: "İletişime Geçildi", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100" },
  interested: { label: "İlgileniyor", className: "bg-purple-100 text-purple-700 hover:bg-purple-100" },
  converted: { label: "Partner Oldu", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" },
  rejected: { label: "Reddedildi", className: "bg-red-100 text-red-600 hover:bg-red-100" },
};

export function formatTarih(value: string): string {
  const d = new Date(value);
  return (
    `${String(d.getDate()).padStart(2, "0")}.` +
    `${String(d.getMonth() + 1).padStart(2, "0")}.` +
    `${d.getFullYear()} ` +
    `${String(d.getHours()).padStart(2, "0")}:` +
    `${String(d.getMinutes()).padStart(2, "0")}`
  );
}
