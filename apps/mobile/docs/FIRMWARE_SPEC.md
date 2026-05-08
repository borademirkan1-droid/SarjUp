# Şarjup PN532 Firmware — Teknik Spesifikasyon

## Genel Bakış

Şarjup cihazı bir PN532 NFC okuyucu modülü ile donatılmıştır.
Partner, şirket telefonunu cihaza yaklaştırdığında telefon **HCE (Host Card Emulation)**
ile kendini bir NFC etiketi gibi sunar. PN532 bu etiketi okur, token'ı doğrular
ve cihazı aktive eder.

---

## 1. Donanım Bağlantısı

| PN532 Pin | Mikrodenetleyici |
|-----------|-----------------|
| SDA/MOSI  | I²C / SPI seçime göre |
| SCL/MISO  | I²C / SPI seçime göre |
| VCC       | 3.3V            |
| GND       | GND             |
| IRQ       | GPIO (interrupt) |

Önerilen iletişim modu: **I²C** (adres: `0x24`)

---

## 2. NFC Protokol Katmanı

Telefon **ISO 14443-4 Type A** kartı taklit eder (HCE).
PN532'nin başlatması gereken komut dizisi:

### 2.1 RF Konfigürasyonu

```c
// PN532'yi initiator moduna al
PN532_SAMConfiguration(NORMAL_MODE);
PN532_RFConfiguration(RF_FIELD, ENABLE);
```

### 2.2 Kart Tespiti

```c
// ISO 14443-4 Type A kart ara, max 1 hedef
uint8_t uid[7];
uint8_t uidLen;
bool found = PN532_ReadPassiveTargetID(
    BAUD_MIFARE_ISO14443A,
    uid, &uidLen,
    timeout_ms
);
```

---

## 3. APDU İletişimi

### 3.1 SELECT APPLICATION

Kart tespit edildiğinde uygulama seçim komutu gönderilir.

**AID (Application Identifier):** `F0 53 41 52 4A 55 50 01 00`

```
F0        — Özel / Tescilsiz AID prefiksi
53 41 52 4A 55 50  — "SARJUP" (ASCII)
01        — Uygulama versiyonu
00        — Alt versiyon
```

**APDU Komutu (hex):**
```
00 A4 04 00 09 F0 53 41 52 4A 55 50 01 00 00
```
Parçalama:
```
CLA  = 00
INS  = A4  (SELECT)
P1   = 04  (DF ismiyle seç)
P2   = 00
Lc   = 09  (AID uzunluğu: 9 byte)
DATA = F0 53 41 52 4A 55 50 01 00
Le   = 00
```

**Beklenen yanıt:**
```
90 00  (SW_NO_ERROR → uygulama seçildi)
```
Başka yanıt gelirse aktivasyon iptal et, hata LED'i yak.

### 3.2 Token Okuma

SELECT başarılıysa telefon NDEF verisini hazır tutar.
READ BINARY komutu ile veri alınır:

**APDU Komutu:**
```
00 B0 00 00 FF
```
Parçalama:
```
CLA  = 00
INS  = B0  (READ BINARY)
P1   = 00  (offset high)
P2   = 00  (offset low)
Le   = FF  (max 255 byte oku)
```

**Yanıt formatı:**
```
[N bytes veri] 90 00
```

Veri, NULL-terminated veya uzunluk-önceli ASCII/UTF-8 string içerir.
`react-native-hce` TEXT tipi NDEF kaydı kullanır; okunan ham byte'lar
doğrudan Base64 token stringidir.

> **Not:** Bazı durumlarda NDEF wrapper byte'ları gelebilir (0x03, length, ..., 0xFE).
> Alınan veriyi parse ederken önce NDEF TLV wrapper'ı kontrol et:
> - `0x03` ile başlıyorsa NDEF mesajı; uzunluk byte'ını atla ve payload'ı al
> - Doğrudan Base64 karakteri (`A-Z a-z 0-9 + / =`) ile başlıyorsa raw string

---

## 4. Token Formatı

Telefon uygulaması Supabase Edge Function'dan aldığı token'ı HCE üzerinden yayınlar.

### 4.1 Ham Format

Base64-URL-safe string. Decode edildiğinde JSON:

```json
{
  "device_id": "SJP-001",
  "counter": 42,
  "valid_until": "2026-05-07T16:00:00.000Z",
  "hmac": "a3f9b2c1d4e5..."
}
```

| Alan | Tip | Açıklama |
|------|-----|----------|
| `device_id` | string | Cihazın sabit kimliği (flash'ta kayıtlı) |
| `counter` | integer | Monoton artan sayaç, tekrar saldırısını önler |
| `valid_until` | ISO 8601 UTC | Token geçerlilik bitiş zamanı |
| `hmac` | hex string | HMAC-SHA256 imzası |

### 4.2 HMAC Doğrulama

**Algoritma:** HMAC-SHA256
**Anahtar:** Cihaza özgü `hmac_key` (üretimde flash'a yazılır, 32 byte)
**Mesaj:**
```
{device_id}|{counter}|{valid_until}
```
Örnek:
```
SJP-001|42|2026-05-07T16:00:00.000Z
```

**C kodu (OpenSSL benzeri):**
```c
char message[256];
snprintf(message, sizeof(message), "%s|%d|%s",
         token.device_id, token.counter, token.valid_until);

uint8_t computed_hmac[32];
hmac_sha256(
    flash_read_hmac_key(),  // 32 byte anahtar
    32,
    (uint8_t*)message,
    strlen(message),
    computed_hmac
);

// Sabit zamanlı karşılaştırma (timing attack önlemi)
bool valid = memcmp_constant_time(computed_hmac, token.hmac_bytes, 32) == 0;
```

---

## 5. Doğrulama Adımları (Sırayla)

```
1. device_id eşleşiyor mu?
   token.device_id == flash_read_device_id()
   → Hayır: REJECT (yanlış cihaz)

2. valid_until geçmemiş mi?
   token.valid_until > rtc_now_utc()
   → Hayır: REJECT (süresi dolmuş)

3. counter > last_counter mi?
   token.counter > flash_read_last_counter()
   → Hayır: REJECT (tekrar saldırısı)

4. HMAC doğru mu?
   hmac_sha256(key, message) == token.hmac
   → Hayır: REJECT (sahte token)

5. Tüm kontroller geçti → AKTİVASYON
   flash_write_last_counter(token.counter)
   flash_write_subscription_end(token.activated_until)  // isteğe bağlı
   activate_device()
```

---

## 6. Flash Bellek Haritası

| Adres | Boyut | İçerik |
|-------|-------|--------|
| 0x0000 | 16 byte | `device_id` (null-terminated string) |
| 0x0010 | 32 byte | `hmac_key` |
| 0x0030 | 4 byte | `last_counter` (uint32, big-endian) |
| 0x0034 | 4 byte | `subscription_end` (Unix timestamp, uint32) |
| 0x0038 | 1 byte | `activated` flag (0x01 = aktif) |

---

## 7. LED / Gösterge Durumları

| Durum | LED |
|-------|-----|
| Bekleme (kart yok) | Mavi, sabit |
| Kart tespit edildi | Sarı, yanıp söner |
| Doğrulama başarılı | Yeşil, 3 sn |
| Doğrulama başarısız | Kırmızı, 3 sn |
| Süre dolmuş abonelik | Kırmızı, hızlı yanıp söner |

---

## 8. Hata Kodları

| Kod | Sebep | Aksiyon |
|-----|-------|---------|
| `ERR_WRONG_DEVICE` | device_id uyuşmuyor | Kırmızı LED, loglama |
| `ERR_EXPIRED` | valid_until geçmiş | Kırmızı LED |
| `ERR_REPLAY` | counter ≤ last_counter | Kırmızı LED, uyarı log |
| `ERR_HMAC` | HMAC doğrulanamadı | Kırmızı LED, güvenlik log |
| `ERR_PARSE` | Token JSON parse hatası | Kırmızı LED |
| `ERR_SELECT` | SELECT APDU reddedildi | Yeniden dene (max 3) |

---

## 9. Üretim Programlama

Her cihaz fabrikadan çıkarken şunlar flash'a yazılır:

```
device_id  → "SJP-XXX" formatında, Supabase devices tablosuyla eşleşmeli
hmac_key   → Supabase devices.hmac_key alanıyla aynı (32 byte rastgele)
last_counter → 0
subscription_end → 0 (aktif değil)
```

`hmac_key` oluşturma (Supabase tarafı):
```sql
UPDATE devices
SET hmac_key = encode(gen_random_bytes(32), 'hex')
WHERE device_id = 'SJP-XXX';
```

---

## 10. Bağımlılıklar

- **react-native-hce** v0.3.0 — Telefon tarafı HCE
- **AID:** `F053415246550100` — `apdu_service.xml` ve firmware'de eşleşmeli
- **Token geçerlilik süresi:** 5 dakika (Edge Function tarafında ayarlanır)
- **Counter:** Supabase `devices.last_counter` ile senkron (her token üretiminde +1)
