/**
 * Türkiye il → ilçe haritası
 * DB'deki region kolonu hem il hem ilçe değerleri içeriyor (scraper karışık kaydetmiş).
 * Bu dosya her region değerini hangi ile ait olduğunu tanımlar.
 */

/** DB'deki her region değerini parent iline eşler. İller kendine eşlenir. */
export const REGION_TO_IL: Record<string, string> = {
  // ─── Doğrudan iller (kendine eşlenir) ────────────────────────────────────
  Adana: "Adana",
  Afyon: "Afyon",
  Ankara: "Ankara",
  Antalya: "Antalya",
  Aydın: "Aydın",
  Balıkesir: "Balıkesir",
  Batman: "Batman",
  Bolu: "Bolu",
  Burdur: "Burdur",
  Bursa: "Bursa",
  Çanakkale: "Çanakkale",
  Denizli: "Denizli",
  Diyarbakır: "Diyarbakır",
  Düzce: "Düzce",
  Elazığ: "Elazığ",
  Erzurum: "Erzurum",
  Eskişehir: "Eskişehir",
  Gaziantep: "Gaziantep",
  Giresun: "Giresun",
  Hatay: "Hatay",
  Isparta: "Isparta",
  İstanbul: "İstanbul",
  İzmir: "İzmir",
  Kahramanmaraş: "Kahramanmaraş",
  Karabük: "Karabük",
  Kayseri: "Kayseri",
  Kırklareli: "Kırklareli",
  Kocaeli: "Kocaeli",
  Konya: "Konya",
  Malatya: "Malatya",
  Manisa: "Manisa",
  Mersin: "Mersin",
  Nevşehir: "Nevşehir",
  Ordu: "Ordu",
  Rize: "Rize",
  Sakarya: "Sakarya",
  Samsun: "Samsun",
  Şanlıurfa: "Şanlıurfa",
  Tekirdağ: "Tekirdağ",
  Trabzon: "Trabzon",
  Uşak: "Uşak",
  Van: "Van",
  Yalova: "Yalova",
  Zonguldak: "Zonguldak",

  // ─── İstanbul ilçeleri ──────────────────────────────────────────────────
  Ataşehir: "İstanbul",
  Bahçelievler: "İstanbul",
  Bakırköy: "İstanbul",
  Beşiktaş: "İstanbul",
  Beyoğlu: "İstanbul",
  Büyükçekmece: "İstanbul",
  Fatih: "İstanbul",
  Kadıköy: "İstanbul",
  Maltepe: "İstanbul",
  Pendik: "İstanbul",
  Sarıyer: "İstanbul",
  Şişli: "İstanbul",
  Ümraniye: "İstanbul",
  Üsküdar: "İstanbul",
  Zeytinburnu: "İstanbul",

  // ─── Ankara ilçeleri ────────────────────────────────────────────────────
  Çankaya: "Ankara",
  Etimesgut: "Ankara",
  Keçiören: "Ankara",
  Kızılay: "Ankara",   // Çankaya mahallesi ama region olarak kullanılmış
  Mamak: "Ankara",
  Sincan: "Ankara",

  // ─── İzmir ilçeleri ─────────────────────────────────────────────────────
  Alsancak: "İzmir",   // Konak mahallesi ama region olarak kullanılmış
  Bornova: "İzmir",
  Buca: "İzmir",
  Çiğli: "İzmir",
  Gaziemir: "İzmir",
  Karşıyaka: "İzmir",
  Konak: "İzmir",

  // ─── Antalya ilçeleri ───────────────────────────────────────────────────
  Alanya: "Antalya",
  Kepez: "Antalya",
  Konyaaltı: "Antalya",
  Manavgat: "Antalya",
  Muratpaşa: "Antalya",

  // ─── Muğla ilçeleri (il kendisi DB'de yok) ──────────────────────────────
  Bodrum: "Muğla",
  Fethiye: "Muğla",
  Marmaris: "Muğla",

  // ─── Bursa ilçeleri ─────────────────────────────────────────────────────
  Mudanya: "Bursa",
  Nilüfer: "Bursa",
  Osmangazi: "Bursa",
  Yıldırım: "Bursa",

  // ─── Kocaeli ilçeleri ───────────────────────────────────────────────────
  Darıca: "Kocaeli",
  Gebze: "Kocaeli",
  Gölcük: "Kocaeli",
  İzmit: "Kocaeli",
  Körfez: "Kocaeli",

  // ─── Sakarya ilçeleri ───────────────────────────────────────────────────
  Adapazarı: "Sakarya",

  // ─── Hatay ilçeleri ─────────────────────────────────────────────────────
  Antakya: "Hatay",

  // ─── Aydın ilçeleri ─────────────────────────────────────────────────────
  Kuşadası: "Aydın",

  // ─── Tekirdağ ilçeleri ──────────────────────────────────────────────────
  Çorlu: "Tekirdağ",

  // ─── Nevşehir (Kapadokya bölge adı olarak girilmiş) ─────────────────────
  Kapadokya: "Nevşehir",
};

/**
 * DB'den gelen tüm region değerlerinden, verisi olan illerin listesini üretir.
 * Muğla gibi doğrudan DB'de olmayan ama ilçeleri olan iller de dahil olur.
 */
export function getIllerWithData(dbRegions: string[]): string[] {
  const iller = new Set<string>();
  for (const r of dbRegions) {
    const il = REGION_TO_IL[r];
    if (il) iller.add(il);
  }
  return [...iller].sort((a, b) => a.localeCompare(b, "tr"));
}

/**
 * Seçili ile ait ve DB'de mevcut olan ilçeleri döner.
 * İlin kendisi hariç tutulur (o zaten il filtresinde seçili).
 */
export function getIlcelerOfIl(il: string, dbRegions: string[]): string[] {
  return dbRegions
    .filter((r) => REGION_TO_IL[r] === il && r !== il)
    .sort((a, b) => a.localeCompare(b, "tr"));
}

/**
 * Bir ile ait tüm DB region değerlerini döner (il + ilçeler).
 * Supabase sorgusunda .in("region", [...]) için kullanılır.
 */
export function getRegionValuesForIl(il: string, dbRegions: string[]): string[] {
  return dbRegions.filter((r) => REGION_TO_IL[r] === il);
}
