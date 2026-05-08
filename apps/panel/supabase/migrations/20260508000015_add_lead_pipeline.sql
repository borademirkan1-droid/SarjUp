-- Lead pipeline kolonları
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS pipeline_status TEXT DEFAULT 'new'
    CHECK (pipeline_status IN ('new','contacted','qualified','proposal','won','lost')),
  ADD COLUMN IF NOT EXISTS pipeline_note TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leads_pipeline_status ON leads(pipeline_status);
