'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// ─── Post Actions ────────────────────────────────────────────────────────────

export async function approvePost(postId: string, scheduledAt?: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_posts')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
      ...(scheduledAt ? { scheduled_at: scheduledAt, status: 'scheduled' } : {}),
    })
    .eq('id', postId)

  if (error) throw new Error(error.message)
  revalidatePath('/sosyal-medya')
  return { success: true }
}

export async function rejectPost(postId: string, reason: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_posts')
    .update({
      status: 'rejected',
      rejection_reason: reason,
    })
    .eq('id', postId)

  if (error) throw new Error(error.message)
  revalidatePath('/sosyal-medya')
  return { success: true }
}

export async function createPost(data: {
  caption: string
  image_brief?: string
  hashtags?: string[]
  scheduled_at?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('social_posts').insert({
    caption: data.caption,
    image_brief: data.image_brief ?? null,
    hashtags: data.hashtags ?? [],
    scheduled_at: data.scheduled_at ?? null,
    status: 'pending_approval',
    created_by: 'agent',
  })

  if (error) throw new Error(error.message)
  revalidatePath('/sosyal-medya')
  return { success: true }
}

export async function publishPost(postId: string) {
  // Instagram Graph API stub — bağlantı kurulduğunda implement edilecek
  revalidatePath('/sosyal-medya')
  return { success: false, error: 'API bağlantısı bekleniyor' }
}

// ─── DM Template Actions ──────────────────────────────────────────────────────

export async function saveDmTemplate(data: {
  name: string
  trigger_keywords: string[]
  response_text: string
  priority?: number
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('social_dm_templates').insert({
    name: data.name,
    trigger_keywords: data.trigger_keywords,
    response_text: data.response_text,
    priority: data.priority ?? 0,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/sosyal-medya')
  return { success: true }
}

export async function deleteDmTemplate(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_dm_templates')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/sosyal-medya')
  return { success: true }
}

export async function updateDmTemplate(
  id: string,
  updates: Partial<{
    name: string
    trigger_keywords: string[]
    response_text: string
    priority: number
    is_active: boolean
  }>
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('social_dm_templates')
    .update(updates)
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/sosyal-medya')
  return { success: true }
}

// ─── Account Actions ──────────────────────────────────────────────────────────

export async function saveAccount(data: {
  access_token: string
  page_id: string
  ig_user_id: string
  username: string
}) {
  const supabase = await createClient()

  // Mevcut instagram hesabını sil, yenisini ekle
  await supabase
    .from('social_accounts')
    .delete()
    .eq('platform', 'instagram')

  const { error } = await supabase.from('social_accounts').insert({
    platform: 'instagram',
    username: data.username,
    access_token: data.access_token,
    page_id: data.page_id,
    ig_user_id: data.ig_user_id,
    is_active: true,
    connected_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
  revalidatePath('/sosyal-medya')
  return { success: true }
}
