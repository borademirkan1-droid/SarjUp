// @sarjup/types
// Tek kaynak — panel, mobile ve website buradan import eder.
// Supabase proje: turvyyedodkpnvlrorst

export type PartnerStatus = 'active' | 'inactive' | 'pending'
export type BusinessType = 'cafe' | 'restaurant' | 'hotel' | 'mall' | 'hospital' | 'other'
export type BusinessStatus = 'active' | 'inactive' | 'debt'
export type DeviceStatus = 'active' | 'stock' | 'maintenance' | 'broken' | 'retired'
export type PaymentMethod = 'iyzico' | 'bank' | 'cash' | 'mail_order' | 'other'
export type PaymentStatus = 'completed' | 'pending' | 'failed' | 'refunded'
export type ActorType = 'admin' | 'partner'
export type ReceiptStatus = 'pending' | 'approved' | 'rejected'
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'rejected'
export type LeadSource = 'google_maps_scraper' | 'web_form' | 'manual'
export type InvoiceStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'cancelled'
export type SignatureStatus = 'pending' | 'otp_sent' | 'completed' | 'rejected' | 'expired' | 'cancelled'

// ---------- Row types ----------

export interface PartnerRow {
  id: string
  full_name: string
  tc_no: string
  phone: string
  email: string
  city: string
  district: string
  address: string
  company_name: string | null
  tax_number: string | null
  commission_rate: number
  status: PartnerStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface BusinessRow {
  id: string
  partner_id: string
  name: string
  business_type: BusinessType
  phone: string
  email: string | null
  address: string
  city: string
  district: string
  contact_person: string
  contact_phone: string
  device_count: number
  monthly_fee: number
  contract_start_date: string
  status: BusinessStatus
  notes: string | null
  created_at: string
}

export interface DeviceRow {
  id: string
  device_id: string
  serial_number: string
  business_id: string | null
  partner_id: string | null
  production_batch: string | null
  production_date: string
  activation_date: string | null
  last_maintenance: string | null
  battery_health: number
  status: DeviceStatus
  subscription_end_date: string | null
  hmac_key: string | null
  last_counter: number
  last_renewed_at: string | null
  total_uses: number
  total_usage_hours: number
  monthly_avg_usage: number
  stock_location: string | null
  notes: string | null
  created_at: string
}

export interface PaymentRow {
  id: string
  transaction_no: string
  business_id: string
  partner_id: string
  amount: number
  commission_rate: number
  commission_amount: number
  net_amount: number
  method: PaymentMethod
  status: PaymentStatus
  iyzico_transaction_id: string | null
  bank_reference: string | null
  invoice_exists: boolean
  refund_info: Record<string, unknown> | null
  paid_at: string | null
  created_at: string
}

export interface PaymentReceiptRow {
  id: string
  partner_id: string
  device_id: string | null
  payment_id: string | null
  amount: number
  receipt_url: string
  receipt_filename: string | null
  status: ReceiptStatus
  rejection_reason: string | null
  admin_note: string | null
  reviewed_by: string | null
  nfc_token_id: string | null
  created_at: string
  reviewed_at: string | null
  ai_extracted_amount: number | null
  ai_confidence: string | null
  ai_analysis_notes: string | null
  ai_analyzed_at: string | null
  ai_status: string | null
  payment_method: string
  iyzico_conversation_id: string | null
}

export interface ActivityLogRow {
  id: string
  actor_id: string
  actor_type: ActorType
  action: string
  resource_type: string
  resource_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}

export type LeadPipelineStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'won'
  | 'lost'

export interface LeadRow {
  id: string
  first_name: string
  last_name: string | null
  email: string | null
  phone: string | null
  business_name: string | null
  business_type: string | null
  region: string | null
  message: string | null
  status: LeadStatus
  source: LeadSource
  notes: string | null
  assigned_to: string | null
  converted_partner_id: string | null
  created_at: string
  updated_at: string
  // Pipeline kolonları (migration: 20260508000015_add_lead_pipeline)
  pipeline_status: LeadPipelineStatus | null
  pipeline_note: string | null
  last_contacted_at: string | null
}

export interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
  vatRate: number
}

export interface InvoiceRow {
  id: string
  partner_id: string | null
  external_id: string | null
  invoice_no: string | null
  ettn: string | null
  status: InvoiceStatus
  receiver_vkn: string
  receiver_title: string
  subtotal: number
  vat_total: number
  total: number
  currency: string
  invoice_date: string
  pdf_url: string | null
  lines: InvoiceLine[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface SignatureSessionRow {
  id: string
  document_type: string
  document_ref_id: string
  document_hash: string
  document_title: string
  signer_phone: string
  signer_name: string
  external_session_id: string | null
  status: SignatureStatus
  signature_value: string | null
  certificate_serial: string | null
  expires_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ---------- Insert / Update types ----------

export type PartnerInsert = Omit<PartnerRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type PartnerUpdate = Partial<PartnerInsert>

export type BusinessInsert = Omit<BusinessRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}
export type BusinessUpdate = Partial<BusinessInsert>

export type DeviceInsert = Omit<DeviceRow, 'id' | 'created_at' | 'last_renewed_at'> & {
  id?: string
  created_at?: string
  last_renewed_at?: string | null
}
export type DeviceUpdate = Partial<DeviceInsert>

export type PaymentInsert = Omit<PaymentRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}
export type PaymentUpdate = Partial<PaymentInsert>

export type PaymentReceiptInsert = Omit<PaymentReceiptRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}
export type PaymentReceiptUpdate = Partial<PaymentReceiptInsert>

export type ActivityLogInsert = Omit<ActivityLogRow, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

export type LeadInsert = Omit<LeadRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type LeadUpdate = Partial<LeadInsert>

export type InvoiceInsert = Omit<InvoiceRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type InvoiceUpdate = Partial<InvoiceInsert>

export type SignatureSessionInsert = Omit<SignatureSessionRow, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}
export type SignatureSessionUpdate = Partial<SignatureSessionInsert>

// ---------- Convenience aliases ----------

export type Partner = PartnerRow
export type Business = BusinessRow
export type Device = DeviceRow
export type Payment = PaymentRow
export type PaymentReceipt = PaymentReceiptRow
export type ActivityLog = ActivityLogRow
export type Lead = LeadRow
export type Invoice = InvoiceRow

// ---------- Joined / enriched types ----------

export interface BusinessWithPartner extends BusinessRow {
  partner?: Pick<PartnerRow, 'id' | 'full_name' | 'email' | 'phone'> | null
}

export interface PaymentReceiptWithRelations extends PaymentReceiptRow {
  partner?: Pick<PartnerRow, 'id' | 'full_name' | 'email' | 'phone'> | null
  device?: Pick<DeviceRow, 'id' | 'device_id' | 'serial_number'> | null
}

export interface DeviceWithRelations extends DeviceRow {
  business?: Pick<BusinessRow, 'id' | 'name' | 'city'> | null
  partner?: Pick<PartnerRow, 'id' | 'full_name'> | null
}

export interface PaymentWithRelations extends PaymentRow {
  business?: Pick<BusinessRow, 'id' | 'name'> | null
  partner?: Pick<PartnerRow, 'id' | 'full_name'> | null
}

// ---------- Supabase Database interface ----------

export interface Database {
  public: {
    Tables: {
      partners: {
        Row: PartnerRow
        Insert: PartnerInsert
        Update: PartnerUpdate
        Relationships: []
      }
      businesses: {
        Row: BusinessRow
        Insert: BusinessInsert
        Update: BusinessUpdate
        Relationships: []
      }
      devices: {
        Row: DeviceRow
        Insert: DeviceInsert
        Update: DeviceUpdate
        Relationships: []
      }
      payments: {
        Row: PaymentRow
        Insert: PaymentInsert
        Update: PaymentUpdate
        Relationships: []
      }
      payment_receipts: {
        Row: PaymentReceiptRow
        Insert: PaymentReceiptInsert
        Update: PaymentReceiptUpdate
        Relationships: []
      }
      activity_logs: {
        Row: ActivityLogRow
        Insert: ActivityLogInsert
        Update: Partial<ActivityLogInsert>
        Relationships: []
      }
      leads: {
        Row: LeadRow
        Insert: LeadInsert
        Update: LeadUpdate
        Relationships: []
      }
      invoices: {
        Row: InvoiceRow
        Insert: InvoiceInsert
        Update: InvoiceUpdate
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      partner_status: PartnerStatus
      business_type: BusinessType
      business_status: BusinessStatus
      device_status: DeviceStatus
      payment_method: PaymentMethod
      payment_status: PaymentStatus
      actor_type: ActorType
      receipt_status: ReceiptStatus
      lead_status: LeadStatus
      invoice_status: InvoiceStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
