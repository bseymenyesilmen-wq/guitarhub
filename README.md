# GuitarHub

GuitarHub; repertuar, akor arama, pratik takibi ve müzik teorisi sayfaları olan bir Next.js uygulamasıdır.

## Teknoloji

- Next.js 16
- React 19
- Supabase Auth + Database
- Netlify deployment
- Şarkı/akor arama için `/api/song-search` Next.js API route'u

## Local çalıştırma

```bash
npm install
cp .env.example .env.local
npm run dev
```

`.env.local` içine şunları gir:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Ardından tarayıcıda aç:

```text
http://localhost:3000
```

## Netlify kurulumu

Netlify'da GitHub reposunu bağlarken:

- Base directory: boş bırak
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `22`

Environment variables kısmına şunları ekle:

```bash
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

`netlify.toml` dosyası projede hazırdır ve `@netlify/plugin-nextjs` kullanır.

## Önemli notlar

- `.env.local` GitHub'a gönderilmez.
- Eski ayrı Express backend Netlify için gerekli değildir; şarkı arama artık Next.js API route içinde çalışır.
- Netlify deployment için sadece bu frontend klasörünü repo kökü olarak kullan.

## Kontrol komutları

```bash
npm run lint
npm run build
```

Bu iki komut başarılı olmalıdır.
