export type PartnerDurum = "Aktif" | "Pasif" | "Beklemede";

export interface Partner {
  id: string;
  adSoyad: string;
  telefon: string;
  email: string;
  sehir: string;
  ilce: string;
  cihazSayisi: number;
  isletmeSayisi: number;
  aylikGelir: number;
  kayitTarihi: string;
  durum: PartnerDurum;
  tcKimlik: string;
  adres: string;
  sirketAdi?: string;
  vergiNo?: string;
  komisyonOrani: number;
  notlar?: string;
  avatar: null;
}

export const partnerlerMockData: Partner[] = [
  { id: "ptn-3f12a9e4-1c20-4d8f-a111-1001", adSoyad: "Mehmet Yılmaz", telefon: "532 145 78 21", email: "mehmet.yilmaz@ornek.com", sehir: "İstanbul", ilce: "Kadıköy", cihazSayisi: 14, isletmeSayisi: 6, aylikGelir: 4250, kayitTarihi: "2025-12-11", durum: "Aktif", tcKimlik: "29845671234", adres: "Fenerbahçe Mah. Bağdat Cad. No:142 D:8 Kadıköy/İstanbul", sirketAdi: "MY Teknoloji", vergiNo: "3489217654", komisyonOrani: 28, notlar: "Haftalık performans raporu istiyor.", avatar: null },
  { id: "ptn-6b2d8141-5e6a-47d3-a222-1002", adSoyad: "Ayşe Kara", telefon: "535 246 91 37", email: "ayse.kara@posta.com", sehir: "İstanbul", ilce: "Beşiktaş", cihazSayisi: 11, isletmeSayisi: 5, aylikGelir: 3890, kayitTarihi: "2024-09-20", durum: "Aktif", tcKimlik: "41329876512", adres: "Levent Mah. Büyükdere Cad. No:89 Beşiktaş/İstanbul", sirketAdi: "Kara İşletme Çözümleri", komisyonOrani: 30, avatar: null },
  { id: "ptn-0a9e7c31-9bf7-4e6b-a333-1003", adSoyad: "Hüseyin Demir", telefon: "541 377 62 90", email: "huseyin.demir@mail.com", sehir: "İstanbul", ilce: "Şişli", cihazSayisi: 9, isletmeSayisi: 4, aylikGelir: 3120, kayitTarihi: "2026-01-05", durum: "Aktif", tcKimlik: "57263189451", adres: "Merkez Mah. Abide-i Hürriyet Cad. No:54 Şişli/İstanbul", vergiNo: "7712458930", komisyonOrani: 27, avatar: null },
  { id: "ptn-a16b17fe-a2f0-4a2e-a444-1004", adSoyad: "Fatma Çelik", telefon: "530 489 55 14", email: "fatma.celik@firma.com", sehir: "İstanbul", ilce: "Ümraniye", cihazSayisi: 7, isletmeSayisi: 3, aylikGelir: 2210, kayitTarihi: "2024-11-27", durum: "Pasif", tcKimlik: "68412397520", adres: "Atatürk Mah. Alemdağ Cad. No:205 Ümraniye/İstanbul", komisyonOrani: 25, notlar: "Geçici olarak faaliyet durdu.", avatar: null },
  { id: "ptn-f8d29171-2dd5-4f5a-a555-1005", adSoyad: "Ali Öztürk", telefon: "539 531 24 68", email: "ali.ozturk@iletisim.com", sehir: "İstanbul", ilce: "Bakırköy", cihazSayisi: 18, isletmeSayisi: 8, aylikGelir: 5780, kayitTarihi: "2025-07-03", durum: "Aktif", tcKimlik: "73920546817", adres: "Cevizlik Mah. İstanbul Cad. No:63 Bakırköy/İstanbul", sirketAdi: "Öztürk Grup", vergiNo: "5931028476", komisyonOrani: 35, avatar: null },
  { id: "ptn-483f2ed3-24d9-4f8f-a666-1006", adSoyad: "Zeynep Arslan", telefon: "537 642 18 75", email: "zeynep.arslan@servis.com", sehir: "İstanbul", ilce: "Pendik", cihazSayisi: 5, isletmeSayisi: 2, aylikGelir: 1540, kayitTarihi: "2025-03-17", durum: "Beklemede", tcKimlik: "85034612987", adres: "Batı Mah. Erol Kaya Cad. No:33 Pendik/İstanbul", komisyonOrani: 24, avatar: null },
  { id: "ptn-b5c984d2-9f58-4f79-a777-1007", adSoyad: "Mustafa Şahin", telefon: "533 754 32 86", email: "mustafa.sahin@kurumsal.com", sehir: "İstanbul", ilce: "Ataşehir", cihazSayisi: 22, isletmeSayisi: 10, aylikGelir: 7120, kayitTarihi: "2025-09-13", durum: "Aktif", tcKimlik: "96148270315", adres: "Barbaros Mah. Mimar Sinan Cad. No:71 Ataşehir/İstanbul", sirketAdi: "Şahin Dağıtım A.Ş.", vergiNo: "1058743296", komisyonOrani: 38, notlar: "Kurumsal zincirlerle çalışıyor.", avatar: null },
  { id: "ptn-4cb7cb85-c582-4e93-a888-1008", adSoyad: "Elif Yıldız", telefon: "544 883 40 29", email: "elif.yildiz@ornekmail.com", sehir: "İstanbul", ilce: "Sarıyer", cihazSayisi: 12, isletmeSayisi: 6, aylikGelir: 4680, kayitTarihi: "2024-06-30", durum: "Aktif", tcKimlik: "30791564288", adres: "Maslak Mah. Büyükdere Cad. No:201 Sarıyer/İstanbul", komisyonOrani: 31, avatar: null },
  { id: "ptn-5ef7a7db-4407-44ef-a999-1009", adSoyad: "Ahmet Aydın", telefon: "536 129 87 54", email: "ahmet.aydin@eposta.com", sehir: "Ankara", ilce: "Çankaya", cihazSayisi: 15, isletmeSayisi: 7, aylikGelir: 4980, kayitTarihi: "2025-02-02", durum: "Aktif", tcKimlik: "42871956340", adres: "Kızılay Mah. Atatürk Bulv. No:95 Çankaya/Ankara", sirketAdi: "Aydın Teknoloji", vergiNo: "4523169870", komisyonOrani: 34, avatar: null },
  { id: "ptn-e4bfa7b7-a28c-44fd-ab10-1010", adSoyad: "Merve Koç", telefon: "531 267 45 93", email: "merve.koc@network.com", sehir: "Ankara", ilce: "Yenimahalle", cihazSayisi: 8, isletmeSayisi: 3, aylikGelir: 2630, kayitTarihi: "2024-12-19", durum: "Beklemede", tcKimlik: "51968423756", adres: "Batıkent Mah. 2011. Sok. No:15 Yenimahalle/Ankara", komisyonOrani: 26, notlar: "Sözleşme onayı bekleniyor.", avatar: null },
  { id: "ptn-f1a9ccaa-2682-4f18-ab11-1011", adSoyad: "İbrahim Özdemir", telefon: "545 390 61 28", email: "ibrahim.ozdemir@domain.com", sehir: "Ankara", ilce: "Keçiören", cihazSayisi: 6, isletmeSayisi: 2, aylikGelir: 1830, kayitTarihi: "2025-10-24", durum: "Pasif", tcKimlik: "63254791824", adres: "Etlik Mah. Bağlar Cad. No:42 Keçiören/Ankara", komisyonOrani: 23, avatar: null },
  { id: "ptn-1a0ac0d1-2f09-4bb2-ab12-1012", adSoyad: "Selin Erdoğan", telefon: "542 511 77 35", email: "selin.erdogan@firma.com", sehir: "İzmir", ilce: "Konak", cihazSayisi: 17, isletmeSayisi: 9, aylikGelir: 6410, kayitTarihi: "2026-02-09", durum: "Aktif", tcKimlik: "79431628590", adres: "Alsancak Mah. Kıbrıs Şehitleri Cad. No:66 Konak/İzmir", sirketAdi: "Ege Şarj Çözümleri", vergiNo: "3860951247", komisyonOrani: 36, avatar: null },
  { id: "ptn-8f1989ac-e96f-4f9b-ab13-1013", adSoyad: "Burak Kaya", telefon: "534 604 82 16", email: "burak.kaya@posta.net", sehir: "İzmir", ilce: "Bornova", cihazSayisi: 10, isletmeSayisi: 4, aylikGelir: 3370, kayitTarihi: "2024-08-14", durum: "Aktif", tcKimlik: "20573841962", adres: "Kazımdirik Mah. Üniversite Cad. No:12 Bornova/İzmir", komisyonOrani: 29, avatar: null },
  { id: "ptn-3bb7164a-f14b-418f-ab14-1014", adSoyad: "Deniz Aktaş", telefon: "538 776 53 09", email: "deniz.aktas@iletisim.net", sehir: "İzmir", ilce: "Karşıyaka", cihazSayisi: 4, isletmeSayisi: 1, aylikGelir: 980, kayitTarihi: "2025-05-01", durum: "Pasif", tcKimlik: "94720561348", adres: "Bostanlı Mah. Cemal Gürsel Cad. No:88 Karşıyaka/İzmir", komisyonOrani: 22, avatar: null },
  { id: "ptn-0890867b-cab8-4cc8-ab15-1015", adSoyad: "Emre Güneş", telefon: "540 318 26 47", email: "emre.gunes@ornek.com", sehir: "Bursa", ilce: "Nilüfer", cihazSayisi: 13, isletmeSayisi: 6, aylikGelir: 4590, kayitTarihi: "2025-08-22", durum: "Aktif", tcKimlik: "35821476905", adres: "Ataevler Mah. İzmir Yolu Cad. No:101 Nilüfer/Bursa", sirketAdi: "Güneş Teknoloji", vergiNo: "2409183765", komisyonOrani: 33, avatar: null },
  { id: "ptn-b7307358-a5ea-44f5-ab16-1016", adSoyad: "Gül Korkmaz", telefon: "543 992 10 84", email: "gul.korkmaz@mail.com", sehir: "Bursa", ilce: "Osmangazi", cihazSayisi: 3, isletmeSayisi: 1, aylikGelir: 750, kayitTarihi: "2024-10-07", durum: "Beklemede", tcKimlik: "61590238471", adres: "Çekirge Mah. 1. Murat Cad. No:21 Osmangazi/Bursa", komisyonOrani: 21, avatar: null },
  { id: "ptn-7292ed6f-5fc6-4bd0-ab17-1017", adSoyad: "Serkan Çetin", telefon: "546 441 95 30", email: "serkan.cetin@ismail.com", sehir: "Antalya", ilce: "Muratpaşa", cihazSayisi: 19, isletmeSayisi: 11, aylikGelir: 7830, kayitTarihi: "2025-11-15", durum: "Aktif", tcKimlik: "82647153029", adres: "Şirinyalı Mah. Lara Cad. No:150 Muratpaşa/Antalya", sirketAdi: "Akdeniz Partner Hizmetleri", vergiNo: "6743201589", komisyonOrani: 40, notlar: "Turizm sezonunda yoğun.", avatar: null },
  { id: "ptn-a3f7dbef-40cd-4f61-ab18-1018", adSoyad: "Esra Doğan", telefon: "537 260 73 58", email: "esra.dogan@eposta.net", sehir: "Antalya", ilce: "Kepez", cihazSayisi: 9, isletmeSayisi: 4, aylikGelir: 2950, kayitTarihi: "2024-07-18", durum: "Aktif", tcKimlik: "18463927503", adres: "Yeni Emek Mah. Sakarya Bulv. No:59 Kepez/Antalya", komisyonOrani: 27, avatar: null },
  { id: "ptn-5ae5f591-db5e-4475-ab19-1019", adSoyad: "Onur Yalçın", telefon: "532 805 64 19", email: "onur.yalcin@firma.net", sehir: "Trabzon", ilce: "Ortahisar", cihazSayisi: 16, isletmeSayisi: 7, aylikGelir: 5220, kayitTarihi: "2026-03-03", durum: "Aktif", tcKimlik: "26915847032", adres: "Gazipaşa Mah. Maraş Cad. No:44 Ortahisar/Trabzon", sirketAdi: "Karadeniz Şarj", vergiNo: "5197302468", komisyonOrani: 37, avatar: null },
  { id: "ptn-c15c4ad8-2d0d-4cc0-ab20-1020", adSoyad: "Büşra Polat", telefon: "539 118 52 67", email: "busra.polat@domain.net", sehir: "Adana", ilce: "Seyhan", cihazSayisi: 20, isletmeSayisi: 12, aylikGelir: 7690, kayitTarihi: "2025-06-12", durum: "Aktif", tcKimlik: "70382651499", adres: "Reşatbey Mah. Atatürk Cad. No:75 Seyhan/Adana", sirketAdi: "Polat Dağıtım", vergiNo: "8431672059", komisyonOrani: 39, avatar: null },
];

export const dashboardPartnerler = partnerlerMockData;

export type IsletmeTipi = "Cafe" | "Restoran" | "Otel" | "AVM" | "Hastane" | "Diğer";
export type IsletmeDurumu = "Aktif" | "Pasif" | "Borçlu";

export interface Isletme {
  id: string;
  isletmeAdi: string;
  tip: IsletmeTipi;
  bagliPartnerId: string;
  telefon: string;
  email?: string;
  adres: string;
  sehir: string;
  ilce: string;
  yetkiliAdi: string;
  yetkiliTelefon: string;
  cihazSayisi: number;
  aylikUcret: number;
  sozlesmeBaslangic: string;
  sonOdemeTarihi: string;
  sonrakiOdeme: string;
  kayitTarihi: string;
  durum: IsletmeDurumu;
  notlar?: string;
}

export type CihazDurumu = "Aktif" | "Stokta" | "Bakımda" | "Arızalı" | "Hurda";

export interface CihazOlayi {
  tarih: string;
  olay: string;
  detay: string;
}

export interface Cihaz {
  id: string;
  cihazId: string;
  seriNo: string;
  bulunduguIsletmeId: string | null;
  bagliPartnerId: string;
  uretimTarihi: string;
  aktivasyonTarihi: string | null;
  sonBakim: string;
  pilSagligi: number;
  toplamOkutma: number;
  toplamKullanimSaat: number;
  aylikOrtalamaKullanim: number;
  durum: CihazDurumu;
  stokLokasyonu?: string;
  notlar?: string;
  olayGecmisi: CihazOlayi[];
}

export const sehirIlceMap: Record<string, string[]> = {
  İstanbul: ["Kadıköy", "Beşiktaş", "Şişli", "Ümraniye", "Bakırköy", "Pendik", "Ataşehir", "Sarıyer"],
  Ankara: ["Çankaya", "Yenimahalle", "Keçiören"],
  İzmir: ["Konak", "Bornova", "Karşıyaka"],
  Bursa: ["Nilüfer", "Osmangazi"],
  Antalya: ["Muratpaşa", "Kepez"],
  Trabzon: ["Ortahisar"],
  Adana: ["Seyhan"],
};

const isletmeAdlari: Record<IsletmeTipi, string[]> = {
  Cafe: [
    "Kahve Köşesi",
    "Cafe Nero İstanbul",
    "Mahalle Kahvecisi",
    "Espresso Lab",
    "Coffee Break",
    "Tadım Cafe",
    "Simit Sarayı Kadıköy",
    "Közde Kahve Durağı",
    "Demlik & Fincan",
  ],
  Restoran: [
    "Boğaziçi Lokantası",
    "Ev Yemekleri Restorant",
    "Kebapçı Mehmet Usta",
    "Balıkçı Hasan",
    "Karadeniz Pidecisi",
    "Lezzet Sofrası",
    "Tencere Restoran",
    "Anadolu Mutfağı",
    "Köfteci Ahmet",
  ],
  Otel: [
    "Park Otel",
    "Yıldız Otel & Spa",
    "Grand Hotel Taksim",
    "Boutique Hotel Cihangir",
    "Ege Marina Otel",
    "Merkez City Hotel",
    "Sahil Konaklama",
  ],
  AVM: ["Taksim AVM", "Forum İstanbul", "Moda Center", "Marmara Plaza", "Çarşı AVM"],
  Hastane: ["Acıbadem Hastanesi Şubesi", "Özel Sağlık Merkezi", "Yaşam Hastanesi", "Medikal Klinik Merkezi"],
  Diğer: ["Kent Kültür Merkezi", "Üniversite Kampüsü", "İş Merkezi Blok A", "Teknoloji Kuluçka Merkezi"],
};

const yetkililer = [
  "Mehmet Yılmaz",
  "Ayşe Demir",
  "Fatma Arslan",
  "Ali Kaya",
  "Zeynep Çetin",
  "Hakan Aydın",
  "Ece Şahin",
  "Murat Özkan",
  "Elif Polat",
  "Berk Güneş",
];

const tipDagilimi: IsletmeTipi[] = [
  ...Array<IsletmeTipi>(15).fill("Cafe"),
  ...Array<IsletmeTipi>(14).fill("Restoran"),
  ...Array<IsletmeTipi>(8).fill("Otel"),
  ...Array<IsletmeTipi>(5).fill("AVM"),
  ...Array<IsletmeTipi>(4).fill("Hastane"),
  ...Array<IsletmeTipi>(4).fill("Diğer"),
];

function tarihEkle(base: Date, gun: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + gun);
  return d.toISOString().slice(0, 10);
}

export const isletmelerMockData: Isletme[] = Array.from({ length: 50 }, (_, i) => {
  const partner = partnerlerMockData[i % partnerlerMockData.length];
  const tip = tipDagilimi[i % tipDagilimi.length];
  const sehir = partner.sehir;
  const ilceler = sehirIlceMap[sehir] ?? ["Merkez"];
  const ilce = ilceler[i % ilceler.length];
  const bugun = new Date();
  const kayitTarihi = tarihEkle(bugun, -(420 - i * 5));
  const sozlesmeBaslangic = tarihEkle(new Date(kayitTarihi), -30);
  const sonOdemeTarihi = tarihEkle(bugun, -((i % 25) + 1));
  const sonrakiOdeme = tarihEkle(new Date(sonOdemeTarihi), 30);
  const cihazSayisi = (i % 8) + 1;
  const durum: IsletmeDurumu = i % 11 === 0 ? "Borçlu" : i % 7 === 0 ? "Pasif" : "Aktif";
  return {
    id: `isl-${String(i + 1).padStart(4, "0")}`,
    isletmeAdi: `${isletmeAdlari[tip][i % isletmeAdlari[tip].length]} ${i >= 25 ? ilce : ""}`.trim(),
    tip,
    bagliPartnerId: partner.id,
    telefon: `5${30 + (i % 20)} ${String(100 + i * 7).slice(0, 3)} ${String(10 + (i % 90)).padStart(2, "0")} ${String(20 + (i % 70)).padStart(2, "0")}`,
    email: i % 4 === 0 ? undefined : `isletme${i + 1}@ornek.com`,
    adres: `${ilce} Mah. ${i + 10}. Sok. No:${(i % 40) + 1} ${ilce}/${sehir}`,
    sehir,
    ilce,
    yetkiliAdi: yetkililer[i % yetkililer.length],
    yetkiliTelefon: `5${40 + (i % 20)} ${String(200 + i * 5).slice(0, 3)} ${String(10 + (i % 80)).padStart(2, "0")} ${String(30 + (i % 60)).padStart(2, "0")}`,
    cihazSayisi,
    aylikUcret: 500 + ((i * 130) % 2500),
    sozlesmeBaslangic,
    sonOdemeTarihi,
    sonrakiOdeme,
    kayitTarihi,
    durum,
    notlar: i % 6 === 0 ? "Aylık bakım talebi notu var." : undefined,
  };
});

function cihazDurumuBelirle(index: number): CihazDurumu {
  if (index < 90) return "Aktif";
  if (index < 115) return "Stokta";
  if (index < 127) return "Bakımda";
  if (index < 137) return "Arızalı";
  return "Hurda";
}

const stokLokasyonlari = ["Ana Depo İstanbul", "Depo Ankara", "Depo İzmir"];

function olaylarUret(i: number, durum: CihazDurumu, isletmeAdi: string | null): CihazOlayi[] {
  const temel = new Date(`2024-01-${String((i % 27) + 1).padStart(2, "0")}`);
  const uretildi = tarihEkle(temel, 0);
  const testEdildi = tarihEkle(temel, 2);
  const aktive = tarihEkle(temel, 10 + (i % 25));
  const bakim = tarihEkle(new Date(aktive), 90 + (i % 60));
  const olaylar: CihazOlayi[] = [
    { tarih: uretildi, olay: "Üretildi", detay: "Üretim hattından çıktı." },
    { tarih: testEdildi, olay: "Test edildi", detay: "NFC, pil, ekran ve bağlantı testleri tamamlandı." },
  ];
  if (durum !== "Stokta") {
    olaylar.push({ tarih: aktive, olay: "Aktive edildi", detay: "Saha aktivasyonu başarıyla tamamlandı." });
    if (isletmeAdi) olaylar.push({ tarih: tarihEkle(new Date(aktive), 1), olay: "Transfer", detay: `${isletmeAdi} işletmesine gönderildi.` });
  } else {
    olaylar.push({ tarih: aktive, olay: "Depoya alındı", detay: "Stok yönetim sistemine kaydedildi." });
  }
  if (durum === "Bakımda" || i % 3 === 0) {
    olaylar.push({ tarih: bakim, olay: "Bakım yapıldı", detay: "Periyodik bakım işlemleri gerçekleştirildi." });
  }
  if (durum === "Arızalı") {
    olaylar.push({ tarih: tarihEkle(new Date(bakim), 10), olay: "Arıza kaydı", detay: "Pil verimi düşüklüğü nedeniyle teknik servise alındı." });
  }
  if (durum === "Hurda") {
    olaylar.push({ tarih: tarihEkle(new Date(bakim), 40), olay: "Hurdaya ayrıldı", detay: "Ekonomik ömrünü tamamladığı için envanterden düşüldü." });
  }
  return olaylar.slice(0, 6);
}

export const cihazlarMockData: Cihaz[] = Array.from({ length: 142 }, (_, i) => {
  const durum = cihazDurumuBelirle(i);
  const isletme = durum === "Stokta" ? null : isletmelerMockData[i % isletmelerMockData.length];
  const partnerId = isletme ? isletme.bagliPartnerId : partnerlerMockData[i % partnerlerMockData.length].id;
  const uretimTarihi = tarihEkle(new Date("2024-01-01"), i * 2);
  const aktivasyonTarihi = isletme ? tarihEkle(new Date(uretimTarihi), 12 + (i % 20)) : null;
  return {
    id: `chz-${String(i + 1).padStart(4, "0")}`,
    cihazId: `${i < 71 ? "ŞRJ-2024" : "ŞRJ-2025"}-${String(i + 1).padStart(4, "0")}`,
    seriNo: `SN${20240000 + i * 19}`,
    bulunduguIsletmeId: isletme?.id ?? null,
    bagliPartnerId: partnerId,
    uretimTarihi,
    aktivasyonTarihi,
    sonBakim: tarihEkle(new Date(aktivasyonTarihi ?? uretimTarihi), 60 + (i % 120)),
    pilSagligi: 40 + ((i * 7) % 61),
    toplamOkutma: (i * 137) % 15001,
    toplamKullanimSaat: (i * 47) % 5001,
    aylikOrtalamaKullanim: (i * 11) % 201,
    durum,
    stokLokasyonu: durum === "Stokta" ? stokLokasyonlari[i % stokLokasyonlari.length] : undefined,
    notlar: i % 9 === 0 ? "Saha ekibi kontrol notu eklendi." : undefined,
    olayGecmisi: olaylarUret(i, durum, isletme?.isletmeAdi ?? null),
  };
});

export type OdemeYontemi = "iyzico" | "Banka" | "Nakit" | "Diğer";
export type OdemeDurumu = "Tamamlandı" | "Bekliyor" | "İptal" | "İade";

export interface IadeBilgi {
  tarih: string;
  sebep: string;
  tutar: number;
}

export interface Odeme {
  id: string;
  islemNo: string;
  tarih: string;
  saat: string;
  partnerId: string;
  isletmeId: string;
  tutar: number;
  komisyonOrani: number;
  komisyon: number;
  net: number;
  yontem: OdemeYontemi;
  durum: OdemeDurumu;
  iyzicoTransactionId?: string;
  bankaMesaji?: string;
  fatura: boolean;
  iadeBilgi?: IadeBilgi;
}

const odemeDurumDagilimi: OdemeDurumu[] = [
  ...Array<OdemeDurumu>(150).fill("Tamamlandı"),
  ...Array<OdemeDurumu>(30).fill("Bekliyor"),
  ...Array<OdemeDurumu>(12).fill("İptal"),
  ...Array<OdemeDurumu>(8).fill("İade"),
];

const odemeYontemDagilimi: OdemeYontemi[] = [
  ...Array<OdemeYontemi>(120).fill("iyzico"),
  ...Array<OdemeYontemi>(50).fill("Banka"),
  ...Array<OdemeYontemi>(20).fill("Nakit"),
  ...Array<OdemeYontemi>(10).fill("Diğer"),
];

const iadeSebepleri = [
  "Müşteri talebi",
  "Mükerrer işlem",
  "Cihaz kaynaklı hata",
  "Yanlış tutar",
  "Fraud kontrolü",
];

const bankaMesajlari = [
  "Havale onayı alındı",
  "EFT beklemede",
  "Banka provizyon kodu doğrulandı",
  "Transfer başarıyla eşleşti",
];

function rastgeleAralik(min: number, max: number, seed: number) {
  const x = Math.sin(seed * 997) * 10000;
  const random = x - Math.floor(x);
  return Math.floor(random * (max - min + 1)) + min;
}

function sonAltıAyIciTarih(index: number) {
  const bugun = new Date();
  const geriyeGun = rastgeleAralik(0, 180, index + 41);
  const d = new Date(bugun);
  d.setDate(d.getDate() - geriyeGun);
  return d;
}

export const odemelerMockData: Odeme[] = Array.from({ length: 200 }, (_, i) => {
  const partner = partnerlerMockData[i % partnerlerMockData.length];
  const partnerIsletmeleri = isletmelerMockData.filter((x) => x.bagliPartnerId === partner.id);
  const isletme = partnerIsletmeleri[i % partnerIsletmeleri.length] ?? isletmelerMockData[i % isletmelerMockData.length];
  const durum = odemeDurumDagilimi[i % odemeDurumDagilimi.length];
  const yontem = odemeYontemDagilimi[i % odemeYontemDagilimi.length];
  const tarihObj = sonAltıAyIciTarih(i);
  const saat = `${String(rastgeleAralik(8, 22, i + 79)).padStart(2, "0")}:${String(rastgeleAralik(0, 59, i + 91)).padStart(2, "0")}`;
  const tutar = rastgeleAralik(50, 5000, i + 13);
  const komisyonOrani = partner.komisyonOrani / 100;
  const komisyon = Number((tutar * komisyonOrani).toFixed(2));
  const net = Number((tutar - komisyon).toFixed(2));
  const iadeTutari = Number((tutar * 0.6).toFixed(2));

  return {
    id: `odm-${String(i + 1).padStart(4, "0")}`,
    islemNo: `PAY-2026-${String(i + 1).padStart(5, "0")}`,
    tarih: tarihObj.toISOString(),
    saat,
    partnerId: partner.id,
    isletmeId: isletme.id,
    tutar,
    komisyonOrani,
    komisyon,
    net,
    yontem,
    durum,
    iyzicoTransactionId: yontem === "iyzico" ? `IYZ-${202600000 + i * 17}` : undefined,
    bankaMesaji: yontem === "Banka" ? bankaMesajlari[i % bankaMesajlari.length] : undefined,
    fatura: i % 3 !== 0,
    iadeBilgi:
      durum === "İade"
        ? {
            tarih: new Date(new Date(tarihObj).setDate(tarihObj.getDate() + 2)).toISOString(),
            sebep: iadeSebepleri[i % iadeSebepleri.length],
            tutar: iadeTutari,
          }
        : undefined,
  };
});

const bugun = new Date();
const buAy = bugun.getMonth();
const buYil = bugun.getFullYear();

const buAyOdemeler = odemelerMockData.filter((o) => {
  const d = new Date(o.tarih);
  return d.getMonth() === buAy && d.getFullYear() === buYil;
});

export const buAyToplamTahsilat = buAyOdemeler
  .filter((o) => o.durum === "Tamamlandı")
  .reduce((sum, o) => sum + o.tutar, 0);

const bekleyenOdemeler = odemelerMockData.filter((o) => o.durum === "Bekliyor");
export const bekleyenOdemeSayisi = bekleyenOdemeler.length;
export const bekleyenOdemeTutar = bekleyenOdemeler.reduce((sum, o) => sum + o.tutar, 0);

const gecikenOdemeler = odemelerMockData.filter((o) => {
  if (o.durum !== "Bekliyor") return false;
  const odemeTarihi = new Date(o.tarih);
  const fark = bugun.getTime() - odemeTarihi.getTime();
  return fark > 1000 * 60 * 60 * 24 * 14;
});
export const gecikenOdemeSayisi = gecikenOdemeler.length;
export const gecikenOdemeTutar = gecikenOdemeler.reduce((sum, o) => sum + o.tutar, 0);

export const buAyKomisyon = buAyOdemeler
  .filter((o) => o.durum === "Tamamlandı")
  .reduce((sum, o) => sum + o.komisyon, 0);
