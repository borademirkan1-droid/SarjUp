import * as XLSX from "xlsx";
import type { Cihaz, Isletme, Odeme, Partner } from "@/lib/mock-data";

function tarihDamgasi() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

function dosyaYaz(workbook: XLSX.WorkBook, dosyaAdi: string) {
  XLSX.writeFile(workbook, dosyaAdi);
}

export function exportOdemelerExcel(
  odemeler: Odeme[],
  partnerMap: Record<string, string>,
  isletmeMap: Record<string, string>,
) {
  const rows = odemeler.map((o) => ({
    "İşlem No": o.islemNo,
    Tarih: new Date(o.tarih).toLocaleDateString("tr-TR"),
    Saat: o.saat,
    Partner: partnerMap[o.partnerId] ?? "-",
    İşletme: isletmeMap[o.isletmeId] ?? "-",
    Tutar: o.tutar,
    Komisyon: o.komisyon,
    Net: o.net,
    Yöntem: o.yontem,
    Durum: o.durum,
    "iyzico Transaction ID": o.iyzicoTransactionId ?? "",
    "Banka Mesajı": o.bankaMesaji ?? "",
    Fatura: o.fatura ? "Var" : "Yok",
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, "Ödemeler");
  dosyaYaz(wb, `SarjUp_Odemeler_${tarihDamgasi()}.xlsx`);
}

export function exportGelirRaporuExcel(rows: Array<{ ay: string; brut: number; komisyon: number; net: number; islemSayisi: number }>) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      Ay: r.ay,
      "Brüt Gelir": r.brut,
      Komisyon: r.komisyon,
      "Net Gelir": r.net,
      "İşlem Sayısı": r.islemSayisi,
    })),
  );
  XLSX.utils.book_append_sheet(wb, ws, "Gelir");
  dosyaYaz(wb, `SarjUp_GelirRaporu_${tarihDamgasi()}.xlsx`);
}

export function exportPartnerPerformansExcel(
  rows: Array<{
    partner: string;
    toplamGelir: number;
    komisyon: number;
    cihazSayisi: number;
    isletmeSayisi: number;
    cihazBasiGelir: number;
  }>,
) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r, i) => ({
      Sıra: i + 1,
      Partner: r.partner,
      "Toplam Gelir": r.toplamGelir,
      Komisyon: r.komisyon,
      "Cihaz Sayısı": r.cihazSayisi,
      "İşletme Sayısı": r.isletmeSayisi,
      "Cihaz Başı Gelir": r.cihazBasiGelir,
    })),
  );
  XLSX.utils.book_append_sheet(wb, ws, "Partner");
  dosyaYaz(wb, `SarjUp_PartnerPerformans_${tarihDamgasi()}.xlsx`);
}

export function exportCihazKullanimExcel(
  topCihazlar: Cihaz[],
  azKullanimlilar: Cihaz[],
  bakimListesi: Cihaz[],
) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      topCihazlar.map((c) => ({
        "Cihaz ID": c.cihazId,
        "Seri No": c.seriNo,
        "Toplam Okutma": c.toplamOkutma,
        "Aylık Ortalama": c.aylikOrtalamaKullanim,
        "Pil Sağlığı": c.pilSagligi,
      })),
    ),
    "Top Cihazlar",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      azKullanimlilar.map((c) => ({
        "Cihaz ID": c.cihazId,
        "Aylık Ortalama": c.aylikOrtalamaKullanim,
        Durum: c.durum,
      })),
    ),
    "Az Kullanım",
  );
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      bakimListesi.map((c) => ({
        "Cihaz ID": c.cihazId,
        "Pil Sağlığı": c.pilSagligi,
        "Son Bakım": c.sonBakim,
      })),
    ),
    "Bakım",
  );
  dosyaYaz(wb, `SarjUp_CihazKullanim_${tarihDamgasi()}.xlsx`);
}

export function exportIsletmeAnaliziExcel(
  gelirRows: Array<{ isletme: string; tip: string; toplamGelir: number }>,
  tipRows: Array<{ tip: string; adet: number }>,
) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gelirRows), "İşletme Gelir");
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(tipRows.map((t) => ({ "İşletme Tipi": t.tip, Adet: t.adet }))),
    "Tip Dağılımı",
  );
  dosyaYaz(wb, `SarjUp_IsletmeAnalizi_${tarihDamgasi()}.xlsx`);
}

export function buildPartnerMap(partnerler: Partner[]) {
  return Object.fromEntries(partnerler.map((p) => [p.id, p.adSoyad]));
}

export function buildIsletmeMap(isletmeler: Isletme[]) {
  return Object.fromEntries(isletmeler.map((i) => [i.id, i.isletmeAdi]));
}

type LeadExportRow = {
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
};

export interface RaporExcelData {
  gelir: Array<{ ay: string; gelir: number }>
  odemeYontemleri: Array<{ methodTr: string; count: number; total: number }>
  topPartners: Array<{ partner_name: string; revenue: number; commission: number; payment_count: number }>
  leadFunnel: Array<{ label: string; count: number }>
}

export function exportRaporExcel(data: RaporExcelData) {
  const wb = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.gelir.map((r) => ({ Ay: r.ay, 'Gelir (TL)': r.gelir }))
    ),
    'Aylık Gelir',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.odemeYontemleri.map((r) => ({
        'Yöntem': r.methodTr,
        'İşlem Sayısı': r.count,
        'Toplam (TL)': r.total,
      }))
    ),
    'Ödeme Yöntemleri',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.topPartners.map((r, i) => ({
        Sıra: i + 1,
        Partner: r.partner_name,
        'Gelir (TL)': r.revenue,
        'Komisyon (TL)': r.commission,
        'İşlem Sayısı': r.payment_count,
      }))
    ),
    'Top Partnerler',
  )

  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(
      data.leadFunnel.map((r) => ({ Durum: r.label, Adet: r.count }))
    ),
    'Lead Hunisi',
  )

  dosyaYaz(wb, `SarjUp_Rapor_${tarihDamgasi()}.xlsx`)
}

const SEKTOR_LABEL: Record<string, string> = {
  cafe: "Kafe",
  Kafe: "Kafe",
  restaurant: "Restoran",
  hotel: "Otel",
  other: "Diğer",
};

const DURUM_LABEL: Record<string, string> = {
  new: "Yeni",
  contacted: "İletişime Geçildi",
  interested: "İlgileniyor",
  converted: "Partner Oldu",
  rejected: "Reddedildi",
};

export function exportLeadsExcel(leads: LeadExportRow[]) {
  const rows = leads.map((l) => ({
    "İşletme Adı": l.first_name,
    Telefon: l.phone ?? "",
    Email: l.email ?? "",
    İl: l.il ?? "",
    İlçe: l.ilce ?? "",
    Sektör: SEKTOR_LABEL[l.business_type ?? ""] ?? (l.business_type ?? ""),
    Durum: DURUM_LABEL[l.status] ?? l.status,
    Kaynak: l.source === "google_maps_scraper" ? "Google Maps" : "Web Form",
    Website: l.notes ?? "",
    Adres: l.message ?? "",
    Tarih: new Date(l.created_at).toLocaleDateString("tr-TR"),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);

  // Kolon genişlikleri
  ws["!cols"] = [
    { wch: 35 }, // İşletme Adı
    { wch: 16 }, // Telefon
    { wch: 28 }, // Email
    { wch: 16 }, // İl
    { wch: 18 }, // İlçe
    { wch: 12 }, // Sektör
    { wch: 20 }, // Durum
    { wch: 14 }, // Kaynak
    { wch: 35 }, // Website
    { wch: 50 }, // Adres
    { wch: 12 }, // Tarih
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Başvurular");
  dosyaYaz(wb, `SarjUp_Basvurular_${tarihDamgasi()}.xlsx`);
}