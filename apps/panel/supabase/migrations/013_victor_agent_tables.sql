-- Victor Control Center: ajan izleme ve sohbet tabloları

-- Victor ile yapılan sohbet mesajları
CREATE TABLE IF NOT EXISTS victor_messages (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  session_id  TEXT,
  trace_id    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Ajanlara atanan görevler
CREATE TABLE IF NOT EXISTS agent_tasks (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name       TEXT NOT NULL,
  task_description TEXT NOT NULL,
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  priority         TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  result           TEXT,
  assigned_by      TEXT DEFAULT 'victor',
  trace_id         TEXT,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  completed_at     TIMESTAMPTZ
);

-- Ajan aktivite logu (her adım, tool çağrısı, vb.)
CREATE TABLE IF NOT EXISTS agent_activity (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_name  TEXT NOT NULL,
  action      TEXT NOT NULL,
  details     JSONB DEFAULT '{}',
  task_id     UUID REFERENCES agent_tasks(id) ON DELETE SET NULL,
  trace_id    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS agent_tasks_updated_at ON agent_tasks;
CREATE TRIGGER agent_tasks_updated_at
  BEFORE UPDATE ON agent_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- İndeksler (sorgu hızı için)
CREATE INDEX IF NOT EXISTS idx_victor_messages_session  ON victor_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_victor_messages_created  ON victor_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent        ON agent_tasks(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status       ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_created      ON agent_tasks(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_activity_agent     ON agent_activity(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_activity_task      ON agent_activity(task_id);
CREATE INDEX IF NOT EXISTS idx_agent_activity_created   ON agent_activity(created_at DESC);

-- RLS: Service role her şeyi yapabilir, anon sadece okur
ALTER TABLE victor_messages  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tasks      ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity   ENABLE ROW LEVEL SECURITY;

-- Victor dashboard'u anon key ile okuyabilir (local app)
CREATE POLICY "anon_read_victor_messages"  ON victor_messages  FOR SELECT USING (true);
CREATE POLICY "anon_read_agent_tasks"      ON agent_tasks      FOR SELECT USING (true);
CREATE POLICY "anon_read_agent_activity"   ON agent_activity   FOR SELECT USING (true);

-- Service role tam erişim
CREATE POLICY "service_all_victor_messages" ON victor_messages  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_agent_tasks"     ON agent_tasks      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_agent_activity"  ON agent_activity   FOR ALL USING (true) WITH CHECK (true);
