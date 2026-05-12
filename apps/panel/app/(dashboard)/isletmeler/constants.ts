import type { BusinessType } from "@/lib/supabase/types";

export const PAGE_SIZE = 10;

export const sehirler = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Trabzon",
  "Adana",
];

export const ilceler: Record<string, string[]> = {
  İstanbul: ["Kadıköy", "Beşiktaş", "Şişli", "Ümraniye", "Bakırköy", "Pendik", "Ataşehir", "Sarıyer"],
  Ankara: ["Çankaya", "Yenimahalle", "Keçiören"],
  İzmir: ["Konak", "Bornova", "Karşıyaka"],
  Bursa: ["Nilüfer", "Osmangazi"],
  Antalya: ["Muratpaşa", "Kepez"],
  Trabzon: ["Ortahisar"],
  Adana: ["Seyhan"],
};

export const tiplerTr = ["Cafe", "Restoran", "Otel", "AVM", "Hastane", "Diğer"] as const;

export const tipMapToDb: Record<string, BusinessType> = {
  Cafe: "cafe",
  Restoran: "restaurant",
  Otel: "hotel",
  AVM: "mall",
  Hastane: "hospital",
  Diğer: "other",
};

export const tipMapToTr: Record<string, string> = {
  cafe: "Cafe",
  restaurant: "Restoran",
  hotel: "Otel",
  mall: "AVM",
  hospital: "Hastane",
  other: "Diğer",
};

export const statusMapToTr: Record<string, string> = {
  active: "Aktif",
  inactive: "Pasif",
  debt: "Borçlu",
};

export type FormState = {
  isletmeAdi: string;
  tip: string;
  telefon: string;
  email: string;
  adres: string;
  sehir: string;
  ilce: string;
  bagliPartnerId: string;
  yetkiliAdi: string;
  yetkiliTelefon: string;
  cihazSayisi: number;
  aylikUcret: number;
  sozlesmeBaslangic: string;
  notlar: string;
};

export const initialForm: FormState = {
  isletmeAdi: "",
  tip: "",
  telefon: "",
  email: "",
  adres: "",
  sehir: "",
  ilce: "",
  bagliPartnerId: "",
  yetkiliAdi: "",
  yetkiliTelefon: "",
  cihazSayisi: 1,
  aylikUcret: 500,
  sozlesmeBaslangic: "",
  notlar: "",
};
