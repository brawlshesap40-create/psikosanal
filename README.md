# Psikosanal

Online psikolog randevu platformu. Danışanlar psikolog arayıp inceleyebilir, randevu alıp online ödeme yapabilir, paket satın alabilir, mesajlaşabilir ve görüşme sonrası değerlendirme bırakabilir. Psikologlar profillerini yönetir, müsaitlik/paket tanımlar ve randevularını takip eder. Adminler psikolog başvurularını onaylar, ödemeleri ve yorumları yönetir.

## Monorepo yapısı

npm workspaces ile yönetilen bir monorepo:

- **`apps/web`** — Next.js uygulaması (App Router). Sitenin tamamı: genel sayfalar, danışan/psikolog/admin panelleri, server action'lar. Kendi çerez tabanlı oturum (session) sistemini kullanır.
- **`apps/api`** — Fastify tabanlı, JWT access/refresh token ile çalışan bağımsız bir REST API. `apps/web`'den ayrı, client-agnostic bir backend (ör. ileride bir mobil uygulama için) — kendi oturum sistemi yerine bearer token kullanır.
- **`packages/core`** — Framework'ten bağımsız iş mantığı (domain servisleri, validasyon şemaları, `DomainError`). Hem `apps/web` hem `apps/api` buradaki servisleri çağırır; iş kuralları tek yerde tanımlıdır.
- **`packages/db`** — Paylaşılan Drizzle ORM şeması ve veritabanı istemcisi.

### `packages/core` deseni

Her domain (`auth`, `appointments`, `payments`, ...) kendi `service.ts` dosyasında düz, async fonksiyonlar olarak tanımlanır — veritabanına doğrudan `@psikosanal/db` üzerinden erişir ve hata durumunda `DomainError` (kod + mesaj + HTTP status) fırlatır. `apps/web`'in server action'ları bu hatayı yakalayıp mevcut `{error: string}` form state şekline çevirir; `apps/api`'nin route'ları aynı hatayı `{error: {code, message}}` JSON zarfına çevirir. Next.js'e özgü şeyler (`cookies()`, `redirect()`, `revalidatePath()`, FormData ayrıştırma) her zaman `apps/web` tarafında kalır, asla `packages/core`'a sızmaz.

## Kurulum

```bash
npm install
```

### Ortam değişkenleri

- Kök dizinde `.env.local` — `apps/web` ve veritabanı scriptleri (`db:*`) için. Şablon: [.env.example](.env.example).
- `apps/api/.env` — `apps/api` için, ayrı `API_JWT_SECRET` dahil. Şablon: [apps/api/.env.example](apps/api/.env.example).
- `apps/api/.env.test` — `apps/api` testleri için (gitignored), CI'da bunun yerine workflow'un kendi `env:` bloğu kullanılır.

### Yerel servisler (Postgres + MinIO)

```bash
docker compose up -d
```

### Veritabanı

```bash
npm run db:migrate   # mevcut migration'ları uygula
npm run db:seed      # demo veri + admin kullanıcı oluştur
```

## Geliştirme

```bash
npm run dev       # apps/web (Next.js, http://localhost:3000)
npm run dev:api   # apps/api (Fastify, http://localhost:3001)
```

## Scriptler (kökten, tüm workspace'lere yayılır)

| Komut | Açıklama |
|---|---|
| `npm run build` | Tüm workspace'leri derler |
| `npm run lint` | ESLint (apps/web) |
| `npm run typecheck` | `tsc --noEmit` (her workspace) |
| `npm run test` | Vitest (her workspace) |
| `npm run db:generate` | Yeni Drizzle migration üretir |
| `npm run db:studio` | Drizzle Studio açar |

## Testler

`apps/api`'nin testleri `psikosanal_test` adlı gerçek bir Postgres veritabanına karşı çalışır (Docker Compose'daki postgres servisi üzerinde, CI'da ayrı bir servis konteyneri olarak). `packages/core`'daki testler saf birim testleridir, veritabanı gerektirmez.
