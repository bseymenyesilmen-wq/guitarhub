export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatbotContext = {
  email?: string | null;
  isAdmin: boolean;
};

const ADMIN_EMAILS = (process.env.CHATBOT_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

const DISALLOWED_TOPICS = [
  "terminal",
  "komut çalıştır",
  "komut calistir",
  "shell",
  "ssh",
  "env",
  ".env",
  "api key",
  "secret",
  "supabase key",
  "veritabanı şifresi",
  "veritabani sifresi",
  "dosya oku",
  "dosya sil",
  "deploy et",
  "github'a push",
  "githuba push",
  "vps",
  "sunucuya gir",
];

const ROUTES = [
  { href: "/sarki-ara", label: "Şarkı Ara", keywords: ["şarkı ara", "sarki ara", "şarkı bul", "sarki bul", "repertuara ekle", "şarkı ekle", "sarki ekle"] },
  { href: "/repertuar", label: "Repertuar", keywords: ["repertuar", "kayıtlı şarkı", "kayitli sarki", "favori", "şarkılarım", "sarkilarim"] },
  { href: "/akor-kutuphanesi", label: "Akor Kütüphanesi", keywords: ["akor", "akorlar", "akor örneği", "akor ornegi", "f#m", "bm", "maj7", "min7"] },
  { href: "/gam-kutuphanesi", label: "Gam Kütüphanesi", keywords: ["gam", "gamlar", "mod", "scale", "pentatonik", "blues"] },
  { href: "/", label: "Ana Sayfa", keywords: ["ana sayfa", "anasayfa", "panel", "başlangıç", "baslangic"] },
];

function normalize(value: string) {
  return value.toLocaleLowerCase("tr-TR");
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.includes(normalized);
}

export function asksForRestrictedCapability(message: string) {
  const normalized = normalize(message);
  return DISALLOWED_TOPICS.some((topic) => normalized.includes(topic));
}

export function findRelevantRoute(message: string) {
  const normalized = normalize(message);
  return ROUTES.find((route) => route.keywords.some((keyword) => normalized.includes(normalize(keyword)))) ?? null;
}

export function buildPublicFallbackReply(message: string) {
  if (asksForRestrictedCapability(message)) {
    return "Bu konuda yardımcı olamam; Burak bu chatbot'a terminal, sunucu, gizli anahtar veya sistem işlemleri için izin vermedi. GuitarHub içinde şarkı arama, repertuar, akorlar ve gamlar konusunda yardımcı olabilirim.";
  }

  const route = findRelevantRoute(message);
  if (route) {
    return `Tabii. Bunun için **${route.label}** bölümünü kullanabilirsin: [${route.label}](${route.href}).`;
  }

  return "GuitarHub içinde yardımcı olabilirim. Şunları sorabilirsin: `Nereden şarkı arayabilirim?`, `Akorlara nereden bakarım?`, `Gamları nasıl açarım?`, `Repertuarımı nerede görürüm?`";
}

export function buildSystemPrompt(context: ChatbotContext) {
  const identity = context.isAdmin
    ? "Kullanıcı yetkili Burak hesabı. Yine de bu web chatbot içinde terminal, dosya sistemi, deploy veya gizli anahtar işlemi yapma; sadece açıklama ve site içi yönlendirme yap."
    : "Kullanıcı public/normal kullanıcı. Burak izin vermediği için terminal, dosya sistemi, sunucu, deploy, GitHub push, API key, env, veritabanı şifresi gibi konularda yardım etme.";

  return `Sen GuitarHub web sitesindeki Yoda adlı yardımcı chatbotsun. Türkçe, kısa ve net konuş.

${identity}

Kapsam:
- Kullanıcıya GuitarHub içinde yol göster.
- Şarkı arama için /sarki-ara linkini ver.
- Repertuar için /repertuar linkini ver.
- Akorlar için /akor-kutuphanesi linkini ver.
- Gamlar için /gam-kutuphanesi linkini ver.
- Gitar, akor, gam, repertuar kullanımı ve site navigasyonu hakkında yardım et.

Yasak:
- Terminal komutu çalıştırma veya çalıştırmış gibi davranma.
- Sunucuya/VPS'e erişme, dosya okuma/yazma, gizli anahtar isteme veya gösterme.
- Yetkisiz kullanıcıya proje yönetimi, deploy, kod değiştirme, veritabanı yönetimi yaptırma.

Eğer kullanıcı yasak bir şey isterse şu anlamda cevap ver: "Burak bu işlem için izin vermedi; burada sadece GuitarHub kullanımı ve gitar içerikleri için yardımcı olabilirim."`;
}

export function buildConversationMessages(input: string, history: ChatMessage[], context: ChatbotContext) {
  return [
    { role: "system" as const, content: buildSystemPrompt(context) },
    ...history.slice(-8),
    { role: "user" as const, content: input },
  ];
}
