export const SEARCH_TARGETS = [
  // Kafeler
  { query: 'kafe', businessType: 'cafe' },
  { query: 'kahve', businessType: 'cafe' },
  { query: 'kahvaltı salonu', businessType: 'cafe' },
  { query: 'nargile kafe', businessType: 'cafe' },
  { query: 'pastane', businessType: 'cafe' },
  { query: 'çay bahçesi', businessType: 'cafe' },
  // Restoranlar
  { query: 'restoran', businessType: 'restaurant' },
  { query: 'lokanta', businessType: 'restaurant' },
  { query: 'kebapçı', businessType: 'restaurant' },
  { query: 'balık restoranı', businessType: 'restaurant' },
  { query: 'steakhouse', businessType: 'restaurant' },
  { query: 'dönerci', businessType: 'restaurant' },
  // Oteller
  { query: 'otel', businessType: 'hotel' },
  { query: 'butik otel', businessType: 'hotel' },
  { query: 'hostel', businessType: 'hotel' },
  { query: 'pansiyon', businessType: 'hotel' },
  // Eğlence & Diğer
  { query: 'bar', businessType: 'other' },
  { query: 'pub', businessType: 'other' },
  { query: 'beach club', businessType: 'other' },
  { query: 'gece kulübü', businessType: 'other' },
  { query: 'balo salonu', businessType: 'other' },
  { query: 'düğün salonu', businessType: 'other' },
  { query: 'bowling', businessType: 'other' },
  { query: 'eğlence merkezi', businessType: 'other' },
]

export const CITIES = [
  // Kocaeli bölgesi (öncelikli)
  'İzmit', 'Kocaeli', 'Gebze', 'Darıca', 'Körfez', 'Gölcük',

  // İstanbul ilçeleri
  'Kadıköy', 'Beşiktaş', 'Şişli', 'Bakırköy', 'Ataşehir',
  'Üsküdar', 'Maltepe', 'Pendik', 'Ümraniye', 'Sarıyer',
  'Beyoğlu', 'Fatih', 'Zeytinburnu', 'Büyükçekmece',

  // Ankara ilçeleri
  'Ankara', 'Çankaya', 'Kızılay', 'Bahçelievler',
  'Keçiören', 'Mamak', 'Sincan', 'Etimesgut',

  // İzmir ilçeleri
  'İzmir', 'Alsancak', 'Bornova', 'Karşıyaka', 'Konak',
  'Buca', 'Gaziemir', 'Çiğli',

  // Bursa
  'Bursa', 'Nilüfer', 'Osmangazi', 'Yıldırım', 'Mudanya',

  // Antalya
  'Antalya', 'Muratpaşa', 'Kepez', 'Konyaaltı', 'Alanya', 'Manavgat',

  // Diğer büyük şehirler
  'Adana', 'Gaziantep', 'Konya', 'Mersin', 'Diyarbakır',
  'Kayseri', 'Eskişehir', 'Samsun', 'Trabzon', 'Malatya',
  'Sakarya', 'Adapazarı', 'Tekirdağ', 'Denizli', 'Manisa',
  'Balıkesir', 'Çorlu', 'Kahramanmaraş', 'Batman', 'Elazığ',
  'Erzurum', 'Van', 'Şanlıurfa', 'Hatay', 'Antakya',
  'Muğla', 'Bodrum', 'Marmaris', 'Fethiye', 'Nevşehir',
  'Kapadokya', 'Edirne', 'Kırklareli', 'Aydın', 'Kuşadası',
  'Çanakkale', 'Rize', 'Ordu', 'Giresun', 'Zonguldak',
  'Karabük', 'Bolu', 'Düzce', 'Yalova', 'Afyon',
  'Isparta', 'Burdur', 'Uşak', 'Kütahya',
]

export const SCRAPER_CONFIG = {
  maxResultsPerQuery: 60,   // 3× daha fazla sonuç (scroll arttırıldı)
  scrollIterations: 12,
  delayBetweenResults: 1200,
  delayBetweenQueries: 4000,
  headless: true,
}

// 71 yeni şehir → 12 batch (zaten taranmış 26 şehir hariç)
export const CITY_BATCHES: string[][] = [
  // Batch 0 — İstanbul ilçeleri (devam)
  ['Üsküdar', 'Maltepe', 'Pendik', 'Ümraniye', 'Sarıyer', 'Beyoğlu'],
  // Batch 1 — İstanbul + Ankara ilçeleri
  ['Fatih', 'Zeytinburnu', 'Büyükçekmece', 'Keçiören', 'Mamak', 'Sincan'],
  // Batch 2 — Ankara + İzmir + Bursa ilçeleri
  ['Etimesgut', 'Konak', 'Buca', 'Gaziemir', 'Çiğli', 'Yıldırım'],
  // Batch 3 — Bursa + Antalya + Güney Ege
  ['Mudanya', 'Konyaaltı', 'Alanya', 'Manavgat', 'Adana', 'Gaziantep'],
  // Batch 4 — Orta Anadolu + Karadeniz
  ['Konya', 'Mersin', 'Diyarbakır', 'Kayseri', 'Eskişehir', 'Samsun'],
  // Batch 5 — Karadeniz + İç Anadolu
  ['Trabzon', 'Malatya', 'Sakarya', 'Adapazarı', 'Tekirdağ', 'Denizli'],
  // Batch 6 — Ege + Güneydoğu
  ['Manisa', 'Balıkesir', 'Çorlu', 'Kahramanmaraş', 'Batman', 'Elazığ'],
  // Batch 7 — Doğu + Güneydoğu
  ['Erzurum', 'Van', 'Şanlıurfa', 'Hatay', 'Antakya', 'Muğla'],
  // Batch 8 — Ege kıyısı + Kapadokya + Trakya
  ['Bodrum', 'Marmaris', 'Fethiye', 'Nevşehir', 'Kapadokya', 'Edirne'],
  // Batch 9 — Trakya + Ege + Karadeniz doğu
  ['Kırklareli', 'Aydın', 'Kuşadası', 'Çanakkale', 'Rize', 'Ordu'],
  // Batch 10 — Karadeniz orta + Marmara güney
  ['Giresun', 'Zonguldak', 'Karabük', 'Bolu', 'Düzce', 'Yalova'],
  // Batch 11 — İç Anadolu güney
  ['Afyon', 'Isparta', 'Burdur', 'Uşak', 'Kütahya'],
]
