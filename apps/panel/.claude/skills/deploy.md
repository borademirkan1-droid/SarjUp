# Skill: Deploy (sarjup-panel)

Sarjup admin paneli Vercel'e deploy etmek için kullan.

## Adımlar

1. TypeScript derleme kontrolü:
```bash
npx tsc --noEmit
```
Hata varsa düzelt, deploy etme.

2. Değişiklikleri commit et:
```bash
git add -A
git commit -m "<type>: <açıklama>"
# type: feat | fix | chore | refactor | hotfix
```

3. Push et (Vercel otomatik deploy başlar):
```bash
git push
```

4. Deploy durumunu kontrol et:
```bash
vercel ls
```

5. Canlıyı test et:
- https://admin.sarjup.com.tr → login çalışıyor mu?
- İlgili sayfayı aç, hata var mı?

## Hotfix (Acil)
```bash
git add -A && git commit -m "hotfix: [sorun]" && git push
```

## Rollback
```bash
vercel rollback
```
