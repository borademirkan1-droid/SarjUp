'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function approveReceipt(
  receiptId: string,
  adminNote?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum bulunamadı.' }

  const { data: receipt, error: fetchError } = await supabase
    .from('payment_receipts')
    .select('id, partner_id, device_id, payment_id, amount, status')
    .eq('id', receiptId)
    .single()

  if (fetchError || !receipt) return { success: false, error: 'Dekont bulunamadı.' }
  if (receipt.status !== 'pending') return { success: false, error: 'Bu dekont zaten işleme alınmış.' }

  const { error: updateError } = await supabase
    .from('payment_receipts')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      admin_note: adminNote ?? null,
    })
    .eq('id', receiptId)

  if (updateError) return { success: false, error: 'Güncelleme başarısız: ' + updateError.message }

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    actor_type: 'admin',
    action: 'approve_receipt',
    resource_type: 'payment_receipts',
    resource_id: receiptId,
    details: { partner_id: receipt.partner_id, device_id: receipt.device_id, amount: receipt.amount },
  })

  if (receipt.device_id) {
    const { error: fnError } = await supabase.functions.invoke('generate-nfc-token', {
      body: {
        receipt_id: receiptId,
        device_id: receipt.device_id,
        partner_id: receipt.partner_id,
        payment_id: receipt.payment_id,
        amount: receipt.amount,
      },
    })
    if (fnError) console.error('[approveReceipt] Edge Function hatası:', fnError.message)
  }

  revalidatePath('/dekontlar')
  return { success: true }
}

export async function rejectReceipt(
  receiptId: string,
  rejectionReason: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Oturum bulunamadı.' }

  const { data: receipt, error: fetchError } = await supabase
    .from('payment_receipts')
    .select('id, status, partner_id, device_id, amount')
    .eq('id', receiptId)
    .single()

  if (fetchError || !receipt) return { success: false, error: 'Dekont bulunamadı.' }
  if (receipt.status !== 'pending') return { success: false, error: 'Bu dekont zaten işleme alınmış.' }

  const { error: updateError } = await supabase
    .from('payment_receipts')
    .update({
      status: 'rejected',
      rejection_reason: rejectionReason,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', receiptId)

  if (updateError) return { success: false, error: 'Güncelleme başarısız: ' + updateError.message }

  await supabase.from('activity_logs').insert({
    actor_id: user.id,
    actor_type: 'admin',
    action: 'reject_receipt',
    resource_type: 'payment_receipts',
    resource_id: receiptId,
    details: { partner_id: receipt.partner_id, device_id: receipt.device_id, amount: receipt.amount, reason: rejectionReason },
  })

  revalidatePath('/dekontlar')
  return { success: true }
}
