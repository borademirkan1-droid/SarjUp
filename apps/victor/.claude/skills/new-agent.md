# Skill: Yeni Victor Ajanı Ekle

Victor paneline yeni ajan eklerken kullan.

## Adımlar

1. `prompts/agents.ts` dosyasına system prompt ekle:
```typescript
"ajan-adi": `${SARJUP_CONTEXT}
Sen Şarjup'un [uzmanlık alanı] ajanısın.

UZMANLIK ALANLARIN:
- ...

ÇALIŞMA TARZI:
- Somut, çalışır çıktı üret
- Türkçe açıkla

Verilen görevi tamamla.`,
```

2. `components/AgentPanel.tsx` dosyasına ajan kartı ekle

3. Eğer tool use gerekiyorsa `app/api/agents/execute/route.ts` içine tool tanımları ekle

4. Deploy: `git add -A && git commit -m "feat: <ajan-adi> ajanı eklendi" && git push`

## Ajan İsimlendirme
Kısa, kebab-case, Türkçe: `fullstack-gelistirici`, `veri-panel`, `tedarik-zinciri`

## Tool Use Şablonu
```typescript
const tools: Anthropic.Tool[] = [
  {
    name: "web_search",
    description: "Web'de arama yap",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Arama sorgusu" }
      },
      required: ["query"]
    }
  }
]
```
