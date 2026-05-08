-- Migration 009: AI analysis columns for payment_receipts
-- Supabase SQL Editor'da çalıştırın.

ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS ai_extracted_amount numeric,
  ADD COLUMN IF NOT EXISTS ai_confidence      text,
  ADD COLUMN IF NOT EXISTS ai_analysis_notes  text,
  ADD COLUMN IF NOT EXISTS ai_analyzed_at     timestamptz,
  ADD COLUMN IF NOT EXISTS ai_status          text DEFAULT 'pending';

-- ai_status değerleri: 'pending' | 'done' | 'failed'
-- ai_confidence değerleri: 'high' | 'low' | null
