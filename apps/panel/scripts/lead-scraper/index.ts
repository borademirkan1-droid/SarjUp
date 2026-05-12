import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import { SEARCH_TARGETS, CITIES, SCRAPER_CONFIG, CITY_BATCHES } from './config'
import { REGION_TO_IL } from '../../lib/turkey-regions'

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SECRET_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SECRET_KEY .env.local dosyasında tanımlı olmalı.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// --- CLI arg parsing ---
const args = process.argv.slice(2)
const getArg = (flag: string): string | undefined => {
  const idx = args.indexOf(flag)
  return idx !== -1 ? args[idx + 1] : undefined
}
const hasFlag = (flag: string): boolean => args.includes(flag)

const cliQuery = getArg('--query')
const cliCity = getArg('--city')
const cliBatch = getArg('--batch')
const runAll = hasFlag('--all')
const allQueries = hasFlag('--all-queries')
const noHeadless = hasFlag('--no-headless')

// --- Phone normalizer ---
function normalizePhone(raw: string): string {
  // Strip all non-digit characters except leading +
  let phone = raw.replace(/[^\d+]/g, '')
  // Remove leading +90 if present, then normalize
  if (phone.startsWith('+90')) phone = phone.slice(3)
  // Remove leading 0 (Turkish area codes like 0262)
  if (phone.startsWith('0')) phone = phone.slice(1)
  // Must be 10 digits (5XX XXX XXXX or area code based)
  return '+90' + phone
}

// --- Duplicate checker ---
async function isDuplicate(phone: string, firstName: string, region: string): Promise<boolean> {
  if (phone) {
    const { data } = await supabase
      .from('leads')
      .select('id')
      .eq('phone', phone)
      .limit(1)
    if (data && data.length > 0) return true
  }

  const { data } = await supabase
    .from('leads')
    .select('id')
    .eq('first_name', firstName)
    .eq('region', region)
    .limit(1)
  return !!(data && data.length > 0)
}

// --- Scrape a single query+city combination ---
async function scrapeQueryCity(
  query: string,
  city: string,
  businessType: string,
  browser: ReturnType<typeof chromium.launch> extends Promise<infer T> ? T : never
) {
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query + ' ' + city)}`
  const context = await browser.newContext({ locale: 'tr-TR' })
  const page = await context.newPage()

  console.log(`\n🔍 Arıyor: "${query}" in "${city}" → ${searchUrl}`)

  try {
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })

    // Cookie consent
    try {
      const acceptBtn = page.locator('button:has-text("Tümünü kabul et")')
      if (await acceptBtn.isVisible({ timeout: 4000 })) {
        await acceptBtn.click()
        await page.waitForTimeout(1000)
      }
    } catch {
      // No cookie banner, continue
    }

    // Wait for results feed
    try {
      await page.waitForSelector('div[role="feed"]', { timeout: 15000 })
    } catch {
      console.log(`  ⚠️  Sonuç bulunamadı: "${query}" in "${city}"`)
      await context.close()
      return
    }

    // Scroll to load results
    for (let i = 0; i < SCRAPER_CONFIG.scrollIterations; i++) {
      await page.evaluate(() => {
        const feed = document.querySelector('div[role="feed"]')
        if (feed) feed.scrollTop += 1500
      })
      await page.waitForTimeout(1200)
    }

    // Collect result links
    const resultLinks = await page.$$eval(
      'div[role="feed"] a[href*="/maps/place/"]',
      (els) => [...new Set(els.map((el) => (el as HTMLAnchorElement).href))]
    )

    const limited = resultLinks.slice(0, SCRAPER_CONFIG.maxResultsPerQuery)
    console.log(`  📋 ${limited.length} sonuç bulundu`)

    for (const link of limited) {
      try {
        const detailPage = await context.newPage()
        await detailPage.goto(link, { waitUntil: 'domcontentloaded', timeout: 20000 })
        await detailPage.waitForTimeout(1500)

        // Name
        const name = await detailPage.$eval('h1', (el) => el.textContent?.trim() || '').catch(() => '')

        // Address
        const address = await detailPage
          .$eval('button[data-item-id="address"]', (el) => el.textContent?.trim() || '')
          .catch(() => '')

        // Phone
        const rawPhone = await detailPage
          .$eval('button[data-item-id*="phone"]', (el) => el.textContent?.trim() || '')
          .catch(() => '')
        const phone = rawPhone ? normalizePhone(rawPhone) : ''

        // Website
        const website = await detailPage
          .$eval('a[data-item-id="authority"]', (el) => (el as HTMLAnchorElement).href || '')
          .catch(() => '')

        await detailPage.close()

        if (!name) {
          console.log(`  ⚠️  İsim alınamadı, atlanıyor`)
          continue
        }

        // Duplicate check
        const duplicate = await isDuplicate(phone, name, city)
        if (duplicate) {
          console.log(`  ⟳ Skip (duplicate): ${name} | ${phone || 'telefon yok'} | ${city}`)
          continue
        }

        // il / ilce hesapla
        const ilValue = REGION_TO_IL[city] ?? city
        const ilceValue = REGION_TO_IL[city] !== city ? city : null

        // Insert to Supabase
        const { error } = await supabase.from('leads').insert({
          first_name: name,
          phone: phone || null,
          business_type: businessType,
          region: city,
          il: ilValue,
          ilce: ilceValue,
          message: address || null,
          notes: website || null,
          status: 'new',
          source: 'google_maps_scraper',
        })

        if (error) {
          console.log(`  ❌ Insert hatası: ${name} — ${error.message}`)
        } else {
          console.log(`  ✓ Insert: ${name} | ${phone || 'telefon yok'} | ${city}`)
        }

        await page.waitForTimeout(SCRAPER_CONFIG.delayBetweenResults)
      } catch (err: any) {
        console.log(`  ❌ Sonuç hatası: ${err?.message || err}`)
      }
    }
  } catch (err: any) {
    console.log(`  ❌ Sayfa hatası "${query}" in "${city}": ${err?.message || err}`)
  } finally {
    await context.close()
  }

  await new Promise((r) => setTimeout(r, SCRAPER_CONFIG.delayBetweenQueries))
}

// --- Main ---
async function main() {
  const headless = !noHeadless && SCRAPER_CONFIG.headless
  const browser = await chromium.launch({ headless })

  try {
    if (cliBatch !== undefined) {
      // Belirli batch: --batch 0, --batch 1, ...
      const batchIndex = parseInt(cliBatch, 10)
      const batchCities = CITY_BATCHES[batchIndex]
      if (!batchCities) {
        console.error(`❌ Geçersiz batch numarası: ${batchIndex}. 0–${CITY_BATCHES.length - 1} arası olmalı.`)
        process.exit(1)
      }
      console.log(`\n🚀 Batch ${batchIndex} başlıyor: ${batchCities.join(', ')}\n`)
      for (const city of batchCities) {
        for (const target of SEARCH_TARGETS) {
          await scrapeQueryCity(target.query, city, target.businessType, browser)
        }
      }
    } else if (runAll) {
      // Tüm config: tüm sorgular x tüm şehirler
      for (const city of CITIES) {
        for (const target of SEARCH_TARGETS) {
          await scrapeQueryCity(target.query, city, target.businessType, browser)
        }
      }
    } else if (cliCity && allQueries) {
      // Tek şehir, tüm kategoriler
      for (const target of SEARCH_TARGETS) {
        await scrapeQueryCity(target.query, cliCity, target.businessType, browser)
      }
    } else if (cliQuery && cliCity) {
      // Tek sorgu + tek şehir
      const target = SEARCH_TARGETS.find((t) => t.query === cliQuery)
      const businessType = target?.businessType || 'other'
      await scrapeQueryCity(cliQuery, cliCity, businessType, browser)
    } else {
      console.error('Kullanım:\n  --query "kafe" --city "İzmit"\n  --city "İzmit" --all-queries\n  --all\n  --batch 0')
      process.exit(1)
    }
  } finally {
    await browser.close()
    console.log('\n✅ Scraper tamamlandı.')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
