# GuitarHub Profesyonel Ürün, Mimari ve Eğitim Tasarımı

Tarih: 2026-06-29

Bu doküman GuitarHub'ı mobile-first, sahne kullanımına hazır ve gitar öğrenmeye odaklanan profesyonel bir platforma dönüştürmek için ürün, yazılım mimarisi ve gitar eğitimi perspektiflerini birleştirir.

Hedef seviye: Ultimate Guitar + Songsterr + Chordify + Guitar Pro yaklaşımına yakın; ancak kişisel repertuar, pratik takibi ve gitar eğitimi tarafı daha güçlü olan modern bir PWA.

## 0. Temel Ürün Prensipleri

1. Mobile First ana mimaridir; responsive sonradan eklenen süs değildir.
2. Telefon kullanıcıları için tek elle kullanım önceliklidir.
3. Sahne modu ayrı bir ürün modu olarak tasarlanır.
4. Akor, gam, mod ve teori verileri mümkün olduğunca deterministik ve lokal çalışabilir olmalıdır.
5. AI gitar koçu kritik eğitim katmanı olur; ancak temel teori motoru AI'a bağımlı olmamalıdır.
6. Offline çalışma MVP sonrası ana rekabet avantajıdır.
7. Veri modeli önce kişisel repertuar ve performans akışını güvenceye alır; sonra eğitim/AI katmanı genişletilir.

## 1. Mevcut Durum Analizi

Mevcut güçlü taraflar:

- Next.js 16, TypeScript ve Tailwind ile modern temel var.
- Supabase Auth ve kişisel repertuar hazır.
- Şarkı ekleme/silme, favoriler, notlar, pratik takibi gibi çekirdek kullanıcı değerleri başlamış.
- Repertuarim.com scraping ve `/api/song-search` route'u ürün değerini artırıyor.
- Akor/gam/teori sayfaları mevcut; bunlar profesyonel veri modeline dönüştürülebilir.

Mevcut eksikler:

- Üst navigasyon telefon için ideal değil; mobile bottom navigation gerekli.
- Akor kütüphanesi statik ve sınırlı; varyasyon, parmak numarası, barre ve zorluk verisi yok.
- Gam sistemi gerçek klavye/fretboard modeli değil; ASCII diyagram düzeyinde.
- Şarkı görüntüleme sahne kullanımına hazır değil: full screen, auto-scroll, wake lock, metronom, bottom toolbar yok.
- Offline/PWA katmanı eksik.
- Eğitim merkezi ve AI koç için bilgi mimarisi henüz yok.

## 2. Mobile First UI Mimarisi

### 2.1 Telefon Navigasyonu

Telefonlarda üst menü kaldırılır. Sabit alt navigasyon kullanılır.

Alt menü öğeleri:

1. Ana Sayfa
2. Repertuar
3. Şarkı Ara
4. Pratik
5. Profil

Alt menü kuralları:

- `position: fixed; bottom: 0; left: 0; right: 0`
- Safe area desteği: `pb-[env(safe-area-inset-bottom)]`
- Minimum dokunma alanı: 44x44 px
- Önerilen dokunma alanı: 48x48 px
- Aktif sekme yüksek kontrastlı kırmızı/amber tonla gösterilir.
- Şarkı sahne modunda alt menü gizlenir.

Tablet ve desktop:

- Tablet landscape: sol rail + içerik bölümü.
- Desktop: üst/yan navigasyon opsiyonel; mobil mimari bozulmamalı.

Önerilen component yapısı:

- `app/components/navigation/MobileBottomNav.tsx`
- `app/components/navigation/DesktopTopNav.tsx`
- `app/components/navigation/AppShell.tsx`
- `app/components/navigation/StageShell.tsx`

### 2.2 Telefon Ekran Kuralları

- Ana CTA butonları ekranın alt üçte birlik bölgesinde olmalı.
- Liste elemanları 56-72 px yükseklikte olmalı.
- Inputlar en az 48 px yüksekliğinde olmalı.
- Dialog yerine bottom sheet tercih edilmeli.
- Akor, gam, şarkı aksiyonları baş parmak erişiminde olmalı.

### 2.3 Tablet Modu

Tablet özellikle canlı performans için tasarlanır.

Landscape layout:

- Sol panel: setlist, repertuar veya şarkı listesi.
- Sağ panel: aktif şarkı.
- Alt veya sağ floating toolbar: transpoze, metronom, auto-scroll, stage mode.

Önerilen route:

- `/stage`
- `/stage/setlist/[id]`

## 3. Akor Kütüphanesi

### 3.1 Kapsam

Desteklenecek akor aileleri:

- Major
- Minor
- Dominant 7
- Major 7
- Minor 7
- Dim
- Aug
- Sus2
- Sus4
- Add9
- 6
- 9
- 11
- 13
- Slash Chords
- Barre Chords

Örnek akorlar:

- A
- Am
- A7
- Am7
- Amaj7
- Asus4
- Aadd9
- A/C#
- F#m
- F#m7
- Bm7
- G#dim

### 3.2 Akor Veri Modeli

Akor verisi başlangıçta `lib/music-theory/chords.ts` içinde statik üretilebilir. V1 sonrası Supabase'e taşınabilir.

TypeScript model önerisi:

```ts
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type ChordPosition = {
  id: string;
  name: string;              // Pozisyon 1, E-shape barre, A-shape barre
  frets: Array<number | "x">; // low E -> high E, örn [2,4,4,2,2,2]
  fingers: Array<number | 0>; // 0 open/mute, 1 index, 2 middle, 3 ring, 4 pinky
  baseFret: number;
  barre?: {
    fret: number;
    fromString: number;       // 1 high E, 6 low E
    toString: number;
    finger: 1 | 2 | 3 | 4;
  };
  notes: string[];
  intervals: string[];        // 1, b3, 5, b7
  difficulty: Difficulty;
  tags: string[];             // open, barre, movable, jazz, beginner
};

export type ChordDefinition = {
  symbol: string;             // F#m7
  root: string;               // F#
  quality: string;            // minor7
  bass?: string;              // slash chord için C#
  aliases: string[];
  formula: string[];          // 1 b3 5 b7
  notes: string[];
  positions: ChordPosition[];
};
```

### 3.3 Akor Teori Motoru

Akor notaları manuel girilmemeli; formülden hesaplanmalı.

Temel nota dizisi:

`C C# D D# E F F# G G# A A# B`

Akor formülleri:

- Major: `1 3 5`
- Minor: `1 b3 5`
- 7: `1 3 5 b7`
- Maj7: `1 3 5 7`
- Min7: `1 b3 5 b7`
- Dim: `1 b3 b5`
- Aug: `1 3 #5`
- Sus2: `1 2 5`
- Sus4: `1 4 5`
- Add9: `1 3 5 9`
- 6: `1 3 5 6`
- 9: `1 3 5 b7 9`
- 11: `1 3 5 b7 9 11`
- 13: `1 3 5 b7 9 11 13`

Önerilen dosyalar:

- `lib/music-theory/notes.ts`
- `lib/music-theory/intervals.ts`
- `lib/music-theory/chord-formulas.ts`
- `lib/music-theory/chord-positions.ts`
- `lib/music-theory/chord-search.ts`

### 3.4 Akor Kütüphanesi UX

Telefon:

- Üstte büyük arama inputu.
- Altında yatay aile filtreleri: Major, Minor, 7, Maj7, Min7, Sus, Add, Barre.
- Kartlar tek kolon.
- Akora dokununca popup değil bottom sheet açılır.

Bottom sheet içeriği:

1. Büyük akor adı: `F#m`
2. Notalar: `F# A C#`
3. Formül: `1 b3 5`
4. Aktif diagram
5. Parmak numaraları
6. Barre etiketi: `2. perde full barre`
7. Zorluk: Beginner / Intermediate / Advanced
8. Alternatif pozisyon carousel'i
9. Kullanım ipucu: “F#m genelde E-shape barre ile çalınır.”

Tablet/Desktop:

- Sol: akor listesi/filtreler
- Sağ: seçili akor detay paneli

### 3.5 Akor Diagram Component

Önerilen component:

- `app/components/chords/ChordDiagram.tsx`
- `app/components/chords/ChordBottomSheet.tsx`
- `app/components/chords/ChordPositionTabs.tsx`

Diagram SVG olmalı; metin/ASCII değil.

SVG gereksinimleri:

- 6 tel, 4-5 perde
- Open/mute işaretleri
- Parmak numarası daireleri
- Barre çizgisi
- Base fret etiketi
- Responsive genişlik

## 4. Gam Sistemi

### 4.1 Gam Kapsamı

Root seçenekleri:

- C
- C#
- D
- D#
- E
- F
- F#
- G
- G#
- A
- A#
- B

C seçildiğinde gösterilecekler:

- C Major
- C Minor
- C Pentatonic Major
- C Pentatonic Minor
- C Blues
- C Harmonic Minor
- C Melodic Minor
- C Dorian
- C Phrygian
- C Lydian
- C Mixolydian
- C Aeolian
- C Locrian

### 4.2 Gam Formülleri

- Major / Ionian: `1 2 3 4 5 6 7`
- Natural Minor / Aeolian: `1 2 b3 4 5 b6 b7`
- Pentatonic Major: `1 2 3 5 6`
- Pentatonic Minor: `1 b3 4 5 b7`
- Blues: `1 b3 4 b5 5 b7`
- Harmonic Minor: `1 2 b3 4 5 b6 7`
- Melodic Minor: `1 2 b3 4 5 6 7`
- Dorian: `1 2 b3 4 5 6 b7`
- Phrygian: `1 b2 b3 4 5 b6 b7`
- Lydian: `1 2 3 #4 5 6 7`
- Mixolydian: `1 2 3 4 5 6 b7`
- Locrian: `1 b2 b3 4 b5 b6 b7`

### 4.3 Gitar Klavyesi Modeli

Standard tuning:

- E2
- A2
- D3
- G3
- B3
- E4

Fret range:

- Telefon MVP: 0-12 perde yatay kaydırma
- V1: 0-24 perde
- Tablet/Desktop: 0-24 perde, zoom

TypeScript model:

```ts
export type FretNote = {
  string: 1 | 2 | 3 | 4 | 5 | 6;
  fret: number;
  note: string;
  octave?: number;
  isRoot: boolean;
  interval?: string;
};
```

### 4.4 Gam UX

Telefon:

- Root selector yatay chip listesi.
- Scale selector bottom sheet veya segmented list.
- Klavye yatay kaydırılabilir.
- Pinch-to-zoom destekli.
- Root notalar kırmızı/amber.
- Diğer gam notaları mavi/mor.
- Interval etiketi aç/kapat switch'i.

Klavye üzerinde gösterilecekler:

- Root notalar farklı renkte.
- Interval dereceleri: `1`, `b3`, `3`, `4`, `5`, `b7`.
- Fret numaraları üstte.
- Open string notaları solda.

Önerilen componentler:

- `app/components/fretboard/Fretboard.tsx`
- `app/components/fretboard/FretboardNote.tsx`
- `app/components/scales/ScalePicker.tsx`
- `app/components/scales/RootNoteSelector.tsx`

## 5. Mod Sistemi

Her mod için içerik alanları:

- Teori açıklaması
- Formül
- Interval yapısı
- Duygusal karakter
- Kullanıldığı müzik türleri
- Örnek sanatçılar
- Örnek şarkılar
- Tipik akor/progresyon ilişkisi
- Gitar üzerinde başlangıç pozisyonu

Mod içerikleri:

### Ionian / Major

- Formül: `1 2 3 4 5 6 7`
- Karakter: parlak, merkezli, mutlu
- Türler: pop, rock, folk, country
- Akorlar: I, IV, V, vi

### Dorian

- Formül: `1 2 b3 4 5 6 b7`
- Karakter: minor ama umutlu; natural minor'a göre 6. derece aydınlık verir.
- Türler: jazz, blues, fusion, funk, rock
- Örnek sanatçılar: Carlos Santana, Miles Davis, John Mayer
- Örnek şarkılar: So What, Oye Como Va, Another Brick in the Wall yaklaşımı
- Kullanım: min7 vamp üstünde çok güçlüdür. Örnek: Dm7 üstüne D Dorian.

### Phrygian

- Formül: `1 b2 b3 4 5 b6 b7`
- Karakter: karanlık, İspanyol/Doğu tınısı
- Türler: flamenco, metal, progressive rock
- Kullanım: minor akor üstünde b2 gerilimi.

### Lydian

- Formül: `1 2 3 #4 5 6 7`
- Karakter: rüya gibi, havada, sinematik
- Türler: film müziği, fusion, progressive
- Kullanım: maj7#11 ve major vamp üstünde.

### Mixolydian

- Formül: `1 2 3 4 5 6 b7`
- Karakter: major ama bluesy/rock; dominant duygu
- Türler: blues, rock, funk, country
- Kullanım: dominant 7 akor üstünde.

### Aeolian / Natural Minor

- Formül: `1 2 b3 4 5 b6 b7`
- Karakter: karanlık, hüzünlü
- Türler: rock, metal, pop ballad
- Kullanım: minor tonal merkez.

### Locrian

- Formül: `1 b2 b3 4 b5 b6 b7`
- Karakter: dengesiz, gerilimli
- Türler: jazz, metal, deneysel
- Kullanım: m7b5 akor üstünde.

## 6. Şarkı Görüntüleme Sistemi

### 6.1 Şarkı Formatı

Hedef: Akorlar ve sözler düzgün hizalı görünmeli.

Örnek:

```text
G          D
Bugün yine

Em         C
Seni düşündüm
```

Mevcut ayrı `chords` ve `lyrics/notes` alanları uzun vadede yetersiz kalabilir. Önerilen içerik formatı:

1. MVP: `chords` alanını monospaced hizalı tut, satır satır render et.
2. V1: ChordPro benzeri format destekle:

```text
[G]Bugün [D]yine
[Em]Seni [C]düşündüm
```

3. V2: ChordPro parser + düzenleyici + transpoze motoru.

### 6.2 Akor Tıklama

Şarkı ekranında akor token'ları tıklanabilir olmalı.

Telefon:

- Akora tıkla.
- Alttan bottom sheet açılır.
- Akor diagramı, notalar, alternatif pozisyonlar, zorluk gösterilir.

Tablet/Desktop:

- Sağ panel veya popover kullanılabilir.

### 6.3 Sahne Kullanımı

Şarkı ekranı sahnede kullanım için ayrı mod içermeli.

Özellikler:

- Tam ekran modu
- Büyük yazı modu
- Otomatik scroll
- Scroll hızı ayarı
- Screen Wake Lock API ile ekran kapanmasını engelleme
- Karanlık sahne modu
- Tek dokunuşla ton değiştirme
- Tek dokunuşla metronom açma
- Tek dokunuşla sonraki şarkıya geçme

Önerilen componentler:

- `app/components/song/SongViewer.tsx`
- `app/components/song/ChordLine.tsx`
- `app/components/song/StageToolbar.tsx`
- `app/components/song/AutoScrollControls.tsx`
- `app/components/metronome/Metronome.tsx`

## 7. Gitar Eğitim Merkezi

Eğitim merkezi sadece blog sayfası olmamalı; interaktif öğrenme alanı olmalı.

Ana modüller:

1. Akor dersleri
2. Gam dersleri
3. Mod dersleri
4. Aralıklar
5. Triadlar
6. Arpejler
7. Fonksiyonel armoni
8. Akor kurulum mantığı
9. Solo geliştirme
10. Doğaçlama
11. Kulak eğitimi

### 7.1 Ders Veri Modeli

```ts
export type Lesson = {
  id: string;
  slug: string;
  title: string;
  category: "chords" | "scales" | "modes" | "intervals" | "triads" | "arpeggios" | "harmony" | "solo" | "ear-training";
  level: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  summary: string;
  sections: LessonSection[];
  exercises: Exercise[];
};
```

### 7.2 Eğitim Akışı

Beginner path:

1. Gitar klavyesindeki notalar
2. Açık akorlar
3. Basit ritim
4. Major/minor farkı
5. İlk repertuar
6. Transpoze ve capo mantığı

Intermediate path:

1. Barre chords
2. Pentatonik ve blues
3. Triadlar
4. Modlara giriş
5. Fonksiyonel armoni
6. Doğaçlama motifleri

Advanced path:

1. 7'li/9'lu/11'li/13'lü akorlar
2. Modal interchange
3. Arpej tabanlı solo
4. Outside playing
5. Reharmonization
6. Kulak eğitimi ve analiz

## 8. AI Gitar Koçu

AI koç öğretmen gibi cevap vermeli; kısa, pratik ve gitar üzerinde uygulanabilir olmalı.

Kullanıcı soruları:

- Bu şarkının tonu ne?
- Bu akor hangi gamın içinde?
- Bu progresyon neden çalışıyor?
- Bu solo hangi modda?
- F#m üzerine ne çalabilirim?
- Blues öğrenmek için ne çalışmalıyım?

### 8.1 AI Mimari Yaklaşımı

AI sadece serbest chat olmamalı. Deterministik teori motoru + AI açıklama katmanı kullanılmalı.

Akış:

1. Kullanıcı soru sorar.
2. Sistem repertuar/akor/gam bağlamını çıkarır.
3. Teori motoru olası cevapları üretir.
4. AI bunları öğretmen diliyle açıklar.
5. Cevap egzersiz önerisiyle biter.

Önerilen dosyalar:

- `app/api/ai-coach/route.ts`
- `lib/ai/coach-prompts.ts`
- `lib/ai/music-context.ts`
- `lib/music-theory/key-detection.ts`
- `lib/music-theory/progression-analysis.ts`

### 8.2 Cevap Stili

Örnek: “F#m üzerine ne çalabilirim?”

Cevap yapısı:

1. Kısa cevap: F# minor pentatonic güvenli başlangıçtır.
2. Akor notaları: F# A C#.
3. Güvenli gamlar: F# natural minor, F# minor pentatonic, F# Dorian bağlama göre.
4. Pratik egzersiz: 5 dakika sadece chord tone hedefle.
5. Uyarı: Arkadaki progresyonu bilmeden kesin mod söylemek doğru değildir.

## 9. Offline Mod ve PWA

### 9.1 PWA Gereksinimleri

- `manifest.webmanifest`
- iOS/Android install metadata
- Service worker
- Offline fallback screen
- App icon setleri
- Theme color: dark

Önerilen paket:

- `next-pwa` yerine Next 16 uyumluluğu kontrol edilerek custom service worker da değerlendirilmeli.

### 9.2 Offline Veri

Offline erişilecekler:

- Şarkılar
- Akorlar
- Notlar
- Setlistler
- Pratik hedefleri

Teknik öneri:

- IndexedDB: offline veri saklama.
- Supabase sync queue: online olunca değişiklikleri gönderme.
- Conflict strategy: `updated_at` + kullanıcıya “local/remote seç” ekranı.

Önerilen dosyalar:

- `lib/offline/db.ts`
- `lib/offline/sync-queue.ts`
- `lib/offline/cache-strategy.ts`
- `app/offline/page.tsx`

## 10. Performans

Zorunlular:

- Lazy loading
- Virtualized lists
- Image optimization
- PWA cache
- Offline cache
- Fast initial load

Teknik kurallar:

- Büyük repertuar listelerinde virtualization: `@tanstack/react-virtual`.
- Akor/gam verileri route bazlı lazy import.
- Fretboard SVG memoize edilmeli.
- Şarkı viewer render satır bazında optimize edilmeli.
- AI endpoint streaming response desteklemeli.
- Supabase sorguları sayfalı yapılmalı.

## 11. Veritabanı Tasarımı

Mevcut `songs` tablosu korunur, genişletilir.

Önerilen tablolar:

### `songs`

- `id`
- `user_id`
- `title`
- `artist`
- `key`
- `capo`
- `bpm`
- `difficulty`
- `chords`
- `lyrics`
- `notes`
- `favorite`
- `created_at`
- `updated_at`

### `setlists`

- `id`
- `user_id`
- `name`
- `description`
- `created_at`
- `updated_at`

### `setlist_songs`

- `id`
- `setlist_id`
- `song_id`
- `position`
- `performance_key`
- `performance_notes`

### `practice_sessions`

- `id`
- `user_id`
- `song_id`
- `minutes`
- `focus_area`
- `notes`
- `created_at`

### `weekly_goals`

- `id`
- `user_id`
- `week_start`
- `target_minutes`
- `target_songs`
- `focus`

### `lesson_progress`

- `id`
- `user_id`
- `lesson_id`
- `status`
- `completed_at`

### `offline_devices`

- `id`
- `user_id`
- `device_name`
- `last_sync_at`

## 12. Roadmap

Tahminler tek geliştirici için verilmiştir. Süreler odaklı geliştirme günüdür.

### MVP: Mobile-first performans/repertuar temeli

| Özellik | Kullanıcı değeri | Teknik zorluk | DB ihtiyacı | Süre |
|---|---:|---:|---|---:|
| Telefon alt navigasyon | Çok yüksek | Düşük | Yok | 0.5 gün |
| Şarkı ekranı mobile layout | Çok yüksek | Orta | Yok | 1 gün |
| Akor bottom sheet | Çok yüksek | Orta | Yok | 1 gün |
| SVG akor diagram component | Çok yüksek | Orta | Yok | 1.5 gün |
| Genişletilmiş akor veri modeli | Yüksek | Orta | Başta yok | 1 gün |
| Stage mode temel ekran | Çok yüksek | Orta | Yok | 1.5 gün |
| Auto-scroll + hız ayarı | Çok yüksek | Orta | Kullanıcı tercihi opsiyonel | 1 gün |
| Metronom temel | Yüksek | Orta | Yok | 1 gün |
| Build/lint kalite kapısı | Yüksek | Düşük | Yok | 0.5 gün |

MVP hedefi: Gitarist telefonda repertuarını açar, sahnede okuyabilir, akora basınca diagram görür.

### V1: Gam/fretboard ve tablet performans modu

| Özellik | Kullanıcı değeri | Teknik zorluk | DB ihtiyacı | Süre |
|---|---:|---:|---|---:|
| Fretboard engine 0-12 | Çok yüksek | Orta | Yok | 1.5 gün |
| Gam formül motoru | Çok yüksek | Orta | Yok | 1 gün |
| Root + scale picker | Yüksek | Düşük | Yok | 0.5 gün |
| Interval gösterimi | Yüksek | Orta | Yok | 0.5 gün |
| Tablet split view | Çok yüksek | Orta | Setlist için evet | 1.5 gün |
| Setlist tabloları | Çok yüksek | Orta | `setlists`, `setlist_songs` | 1 gün |
| Stage setlist geçişi | Çok yüksek | Orta | Evet | 1 gün |
| PWA manifest | Yüksek | Düşük | Yok | 0.5 gün |

V1 hedefi: Tablet ile canlı performans yapılabilir, gamlar gerçek klavyede anlaşılır.

### V2: Eğitim merkezi ve offline güçlendirme

| Özellik | Kullanıcı değeri | Teknik zorluk | DB ihtiyacı | Süre |
|---|---:|---:|---|---:|
| Eğitim merkezi bilgi mimarisi | Yüksek | Orta | `lesson_progress` | 2 gün |
| Mod dersleri | Yüksek | Orta | Opsiyonel | 1.5 gün |
| Triad/arpej dersleri | Yüksek | Orta | Opsiyonel | 1.5 gün |
| Offline IndexedDB cache | Çok yüksek | Yüksek | `offline_devices` opsiyonel | 2.5 gün |
| Sync queue | Çok yüksek | Yüksek | updated_at alanları | 2 gün |
| Virtualized repertuar listeleri | Orta | Orta | Yok | 0.5 gün |
| ChordPro parser | Çok yüksek | Yüksek | `lyrics`/`content` alanı | 2 gün |

V2 hedefi: Uygulama öğrenme platformuna dönüşür ve internetsiz sahnede kullanılabilir.

### V3: AI gitar koçu ve ileri seviye analiz

| Özellik | Kullanıcı değeri | Teknik zorluk | DB ihtiyacı | Süre |
|---|---:|---:|---|---:|
| AI coach endpoint | Çok yüksek | Orta/Yüksek | Chat history opsiyonel | 1.5 gün |
| Ton tespiti | Çok yüksek | Orta | Yok | 1.5 gün |
| Progresyon analizi | Çok yüksek | Yüksek | Yok | 2 gün |
| “Bu akor hangi gamda?” motoru | Yüksek | Orta | Yok | 1 gün |
| Kişisel çalışma önerileri | Çok yüksek | Yüksek | practice data | 2 gün |
| Streaming chat UI | Yüksek | Orta | Opsiyonel | 1 gün |
| Gelişmiş kulak eğitimi | Orta/Yüksek | Yüksek | progress | 3 gün |

V3 hedefi: Uygulama sadece repertuar aracı değil, kişisel gitar öğretmeni olur.

## 13. Geliştirme Önceliği

Öncelik sırası kullanıcının istediği şekilde korunur:

1. Telefon kullanıcıları için en değerli özellikler
   - Alt navigasyon
   - Şarkı viewer mobile-first
   - Akor bottom sheet
   - Stage mode temel
   - Auto-scroll

2. Tablet kullanıcıları için en değerli özellikler
   - Landscape split view
   - Setlist + şarkı yan yana
   - Büyük yazı ve tek dokunuş geçişler

3. Sahne kullanımına en çok katkı sağlayan özellikler
   - Fullscreen
   - Wake lock
   - Auto-scroll
   - Transpoze toolbar
   - Metronom
   - Offline setlist

4. Eğitim tarafına en çok katkı sağlayan özellikler
   - Akor diagramları
   - Gam/fretboard sistemi
   - Mod açıklamaları
   - Eğitim merkezi
   - AI gitar koçu

## 14. İlk Uygulama Sırası

Kod tarafında önerilen ilk 10 adım:

1. `AppShell` ve `MobileBottomNav` oluştur.
2. Mevcut `AppNav` kullanımını mobile-first shell'e taşı.
3. `ChordDiagram` SVG componentini yaz.
4. `ChordBottomSheet` yaz.
5. `lib/music-theory` altında nota/interval/akor formül motorunu oluştur.
6. Akor kütüphanesi sayfasını yeni veri modeli ve bottom sheet ile güncelle.
7. Şarkı detay ekranındaki akor chiplerini tıklanabilir yap.
8. Stage mode route'unu ekle.
9. Auto-scroll ve metronom kontrollerini ekle.
10. Build/lint çalıştır, commit ve deploy et.

## 15. Başarı Metrikleri

Ürün metrikleri:

- Kullanıcı başına kayıtlı şarkı sayısı
- Haftalık aktif kullanıcı
- Pratik dakikası
- Stage mode kullanım sayısı
- Offline indirilen setlist sayısı
- Akor/gam ekranı tekrar kullanımı

Teknik metrikler:

- Mobil Lighthouse performans skoru 85+
- First load hızlı olmalı
- Build hatasız
- Supabase sorgu gecikmeleri düşük
- Offline senaryoda kritik ekranlar açılmalı

## 16. Sonuç

GuitarHub'ın en doğru yolu önce “sahnede işe yarayan mobile-first repertuar uygulaması” olmak, sonra “gitar öğrenme platformu”na genişlemektir.

İlk büyük fark yaratacak paket:

- Telefon alt navigasyon
- Şarkı sahne modu
- Akor bottom sheet + SVG diagram
- Fretboard/gam motoru
- Setlist + tablet split view

Bu paket tamamlandığında uygulama sıradan repertuar aracından profesyonel gitarist platformuna geçer.
