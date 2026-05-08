# Skill: Git Worktree — Paralel Geliştirme

Aynı anda hem main'de hotfix hem de yeni feature geliştirmek için kullan.

## Yeni Worktree Aç
```bash
# sarjup-panel dizinindeyken:
git worktree add "../sarjup-panel-<özellik-adı>" -b feature/<özellik-adı>
```
Örnek: `git worktree add "../sarjup-panel-iyzico" -b feature/iyzico`

## Mevcut Worktree'leri Listele
```bash
git worktree list
```

## Worktree'yi Kaldır (iş bitince)
```bash
git worktree remove "../sarjup-panel-<özellik-adı>"
git branch -d feature/<özellik-adı>
```

## Kullanım Senaryosu
1. Production'da bug çıktı → `sarjup-panel/` klasöründe (main) düzelt
2. Yeni özellik geliştiriyorsun → `sarjup-panel-iyzico/` klasöründe (feature branch) çalış
3. İkisi birbirini etkilemez, branch switch yok, stash yok
