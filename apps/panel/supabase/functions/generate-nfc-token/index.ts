// Supabase Edge Function — Deno runtime
// Deploy: supabase functions deploy generate-nfc-token
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  device_id: string   // UUID
  partner_id: string  // UUID
  receipt_id: string  // UUID
  amount: number
}

interface DeviceRow {
  id: string
  device_id: string          // text — örn. "DEV-0042"
  hmac_key: string | null
  last_counter: number
  subscription_end_date: string | null  // date → "YYYY-MM-DD"
  partner_id: string | null
}

serve(async (req: Request) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }

  try {
    // 1. Request body parse
    let body: RequestBody
    try {
      body = await req.json() as RequestBody
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Geçersiz JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const { device_id, partner_id, receipt_id, amount } = body

    if (!device_id || !partner_id || !receipt_id || amount === undefined) {
      return new Response(
        JSON.stringify({ success: false, error: 'Eksik parametre: device_id, partner_id, receipt_id, amount zorunludur' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 2. Service role client — hmac_key'e erişmek için
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Sunucu yapılandırma hatası' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    })

    // 3. Device'ı çek
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('id, device_id, hmac_key, last_counter, subscription_end_date, partner_id')
      .eq('id', device_id)
      .single()

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cihaz bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    const dev = device as DeviceRow

    // 4. HMAC key kontrolü
    if (!dev.hmac_key) {
      return new Response(
        JSON.stringify({ success: false, error: 'HMAC key atanmamış' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 5. Yeni end_date hesapla (+30 gün)
    const now = new Date()
    let baseDate: Date

    if (dev.subscription_end_date) {
      const existing = new Date(dev.subscription_end_date + 'T00:00:00Z')
      baseDate = existing > now ? existing : now
    } else {
      baseDate = now
    }

    const newEndDate = new Date(baseDate)
    newEndDate.setDate(newEndDate.getDate() + 30)

    // 6. Counter artır
    const newCounter = (dev.last_counter ?? 0) + 1

    // 7. 12 byte mesaj oluştur (DataView, big-endian)
    //    byte 0-3: device_id UUID'nin ilk 8 hex karakteri → uint32
    //    byte 4-7: end_date unix timestamp (saniye)
    //    byte 8-11: newCounter
    const messageBuffer = new ArrayBuffer(12)
    const view = new DataView(messageBuffer)

    // device_id alanı UUID formatında — tire sıyrıp ilk 8 hex al
    const deviceIdHex = dev.device_id.replace(/-/g, '').substring(0, 8)
    const deviceIdUint32 = parseInt(deviceIdHex, 16)
    view.setUint32(0, deviceIdUint32, false)  // big-endian

    const endDateUnix = Math.floor(newEndDate.getTime() / 1000)
    view.setUint32(4, endDateUnix, false)     // big-endian

    view.setUint32(8, newCounter, false)       // big-endian

    // 8. HMAC-SHA256 hesapla (Web Crypto API — Deno native)
    const keyBytes = new TextEncoder().encode(dev.hmac_key)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    )

    const sig = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer)
    const hmac8 = new Uint8Array(sig).slice(0, 8)

    // 9. 20 byte payload: message(12) + hmac(8)
    const payload = new Uint8Array(20)
    payload.set(new Uint8Array(messageBuffer), 0)
    payload.set(hmac8, 12)

    // 10. devices tablosunu güncelle
    const { error: updateError } = await supabase
      .from('devices')
      .update({
        last_counter: newCounter,
        subscription_end_date: newEndDate.toISOString().split('T')[0],
        last_renewed_at: new Date().toISOString(),
      })
      .eq('id', device_id)

    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, error: 'Cihaz güncellenemedi: ' + updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // 11. Encode: base64 + hex
    const payloadBase64 = btoa(String.fromCharCode(...payload))
    const payloadHex = Array.from(payload)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    return new Response(
      JSON.stringify({
        success: true,
        payload_base64: payloadBase64,
        payload_hex: payloadHex,
        end_date: newEndDate.toISOString(),
        counter: newCounter,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  }
})
