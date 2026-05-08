-- Sosyal medya yönetim tabloları
-- Instagram post kuyruğu, DM şablonları, hesap bağlantısı, DM logları

-- Post kuyruğu (ajan tarafından üretilir, admin onaylar)
CREATE TABLE IF NOT EXISTS social_posts (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform         TEXT NOT NULL DEFAULT 'instagram',
  caption          TEXT NOT NULL,
  image_url        TEXT,
  image_brief      TEXT,
  hashtags         TEXT[],
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','pending','approved','rejected','scheduled','published')),
  scheduled_at     TIMESTAMPTZ,
  published_at     TIMESTAMPTZ,
  ig_media_id      TEXT,
  rejection_reason TEXT,
  created_by       TEXT NOT NULL DEFAULT 'agent',
  approved_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Bağlı sosyal medya hesapları (Meta Graph API token)
CREATE TABLE IF NOT EXISTS social_accounts (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform         TEXT NOT NULL DEFAULT 'instagram',
  username         TEXT NOT NULL,
  access_token     TEXT,
  token_expires_at TIMESTAMPTZ,
  page_id          TEXT,
  ig_user_id       TEXT,
  is_active        BOOLEAN DEFAULT FALSE,
  connected_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- DM otomatik yanıt şablonları
CREATE TABLE IF NOT EXISTS social_dm_templates (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT NOT NULL,
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  response_text    TEXT NOT NULL,
  is_active        BOOLEAN DEFAULT TRUE,
  priority         INTEGER DEFAULT 0,
  use_count        INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- DM işlem logu
CREATE TABLE IF NOT EXISTS social_dm_logs (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id        TEXT NOT NULL,
  sender_username  TEXT,
  message_text     TEXT,
  response_text    TEXT,
  template_id      UUID REFERENCES social_dm_templates(id) ON DELETE SET NULL,
  was_auto_replied BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_social_posts_updated_at ON social_posts;
CREATE TRIGGER trg_social_posts_updated_at
  BEFORE UPDATE ON social_posts
  FOR EACH ROW EXECUTE FUNCTION update_social_posts_updated_at();

-- RLS (sadece SUPER_ADMIN erişir)
ALTER TABLE social_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_dm_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_dm_logs      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_social_posts"
  ON social_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "super_admin_social_accounts"
  ON social_accounts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "super_admin_social_dm_templates"
  ON social_dm_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

CREATE POLICY "super_admin_social_dm_logs"
  ON social_dm_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM partners
      WHERE id = auth.uid() AND role = 'SUPER_ADMIN'
    )
  );

-- Örnek DM şablonları
INSERT INTO social_dm_templates (name, trigger_keywords, response_text, priority) VALUES
  (
    'Fiyat Sorusu',
    ARRAY['fiyat','ücret','ne kadar','maliyet','kira'],
    'Merhaba! Şarjup cihaz kiralama fiyatlarımız sarjup.com.tr/fiyatlandirma adresinde detaylı olarak yer almaktadır. Sorularınız için 0540 366 41 41 numaramızı arayabilirsiniz.',
    10
  ),
  (
    'Demo / Tanıtım Talebi',
    ARRAY['demo','tanıtım','bilgi','nasıl','nasıl çalışır'],
    'Merhaba! Şarjup akıllı şarj sistemi hakkında ücretsiz demo için info@sarjup.com.tr adresine yazabilir veya 0540 366 41 41''i arayabilirsiniz. Size özel sunum ayarlayalım!',
    5
  ),
  (
    'İletişim',
    ARRAY['iletişim','ulaşmak','telefon','email','adres'],
    'Bize ulaşmak için: 📧 info@sarjup.com.tr | 📞 0540 366 41 41 | 🌐 sarjup.com.tr',
    1
  )
ON CONFLICT DO NOTHING;
