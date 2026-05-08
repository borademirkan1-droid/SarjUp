# Skill: Worker Görevi Oluştur / Debug

claude-code worker ile çalışırken kullan.

## Worker Başlatma
```powershell
cd C:\Users\Bora\Projects\victor-app
npm run worker
```

Beklenen çıktı:
```
◆ Claude Code Worker başlatıldı
  Supabase: https://turvyyedodkpnvlrorst.supabase.co
✅ Supabase realtime bağlandı — görev bekleniyor...
```

## Manuel Görev Oluşturma (Supabase)
```sql
INSERT INTO agent_tasks (agent_name, task_description, status)
VALUES ('claude-code', 'Görev açıklaması buraya', 'pending');
```

## Worker Araçları
| Tool | Kullanım |
|------|----------|
| `bash` | PowerShell komutu çalıştır |
| `read_file` | Dosya oku |
| `write_file` | Dosya yaz (tamamen değiştirir) |
| `list_dir` | Dizin listele |
| `stream_update` | Panele ara sonuç gönder |

## Proje Dizinleri (Worker'da)
- `victor-app` → `C:\Users\Bora\Projects\victor-app`
- `sarjup-panel` → `C:\Users\Bora\Projects\sarjup-panel`
- `sarjup-mobile` → `C:\Users\Bora\Projects\sarjup-mobile`

## Hata Ayıklama
- Worker takılı kaldıysa: Ctrl+C ile kapat, tekrar başlat
- Görev `running` kaldıysa DB'de manuel `status = 'failed'` yap
- Log için worker output'u izle
