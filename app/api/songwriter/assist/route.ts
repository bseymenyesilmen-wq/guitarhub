import { NextResponse } from "next/server";

type SongwriterRequest = {
  title?: string;
  keyName?: string;
  sectionName?: string;
  notebook?: string;
};

type HermesSongwriterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

type SongwriterSuggestion = {
  mood: string;
  idea: string;
  suggestedChords: string;
  suggestedLyrics: string;
};

function envValue(name: string) {
  const raw = process.env[name]?.trim() ?? "";
  const withoutOptionalKeyPrefix = raw.replace(new RegExp(`^${name}\\s*=\\s*`), "");
  return withoutOptionalKeyPrefix.replace(/^['\"]|['\"]$/g, "").trim();
}

function chatCompletionsUrl(baseUrl: string) {
  return baseUrl.endsWith("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
}

function fallbackSuggestion(notebook: string, sectionName: string): SongwriterSuggestion {
  const lower = notebook.toLocaleLowerCase("tr-TR");
  const sadWords = ["gece", "yalnız", "özledim", "ağla", "kırık", "yorgun", "duman", "acı"];
  const isSad = sadWords.some((word) => lower.includes(word));
  const isBridge = sectionName.toLocaleLowerCase("tr-TR").includes("bridge");

  return {
    mood: isSad ? "hüzünlü" : "umutlu",
    idea: isBridge ? "Bridge bölümünde gerilimi biraz artırıp nakarata temiz çöz." : "Nakaratta melodiyi aç, cümleleri daha kısa ve akılda kalır yap.",
    suggestedChords: isSad ? "Am        F        C        G" : "C         G        Am       F",
    suggestedLyrics: isSad
      ? "İçimde susmayan bir gece var\nAdını söylesem yine dağılır"
      : "Yeniden başlar gibi bak bana\nSesinle açılır bu karanlık",
  };
}

function parseSuggestion(raw: string | null, notebook: string, sectionName: string): SongwriterSuggestion {
  if (!raw) return fallbackSuggestion(notebook, sectionName);
  const cleaned = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<SongwriterSuggestion>;
    if (parsed.suggestedChords && parsed.suggestedLyrics) {
      return {
        mood: String(parsed.mood ?? "öneri"),
        idea: String(parsed.idea ?? "Bu bölüme uygun bir devam önerisi."),
        suggestedChords: String(parsed.suggestedChords),
        suggestedLyrics: String(parsed.suggestedLyrics),
      };
    }
  } catch {
    // Fallback below.
  }
  return fallbackSuggestion(notebook, sectionName);
}

async function callHermes(body: SongwriterRequest) {
  const apiKey = envValue("HERMES_API_KEY");
  const baseUrl = envValue("HERMES_API_URL").replace(/\/$/, "");
  const model = envValue("HERMES_API_MODEL") || "hermes-agent";
  if (!apiKey || !baseUrl) return null;

  const prompt = `Şarkı sözü ve akor önerisi üret.
Kullanıcı GuitarHub Şarkı Yaz içinde beste yapıyor.
Yoda chat değilsin; sayfanın otomatik beste öneri sistemisin.
Sadece JSON dön. Markdown yok.
JSON şeması: {"mood":"...","idea":"...","suggestedChords":"...","suggestedLyrics":"..."}
Başlık: ${body.title || "Yeni Şarkı"}
Ton: ${body.keyName || "belirsiz"}
Bölüm: ${body.sectionName || "Nakarat"}
Defter:
${body.notebook || ""}
Kurallar:
- Sözlerin duygusunu analiz et: hüzünlü/mutlu/karanlık/umutlu.
- Var olan akorlara uyumlu 3-4 akorlu bir satır öner.
- suggestedChords tek satır olsun, akorlar boşluklu dizilsin.
- suggestedLyrics 1-2 satır Türkçe şarkı sözü olsun.
- Çok uzun yazma.`;

  const candidateBaseUrls = Array.from(new Set([baseUrl, baseUrl.replace(":8642", "")])).filter(Boolean);
  for (const candidateBaseUrl of candidateBaseUrls) {
    try {
      const response = await fetch(chatCompletionsUrl(candidateBaseUrl), {
        method: "POST",
        signal: AbortSignal.timeout(9000),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "X-Hermes-Session-Key": "guitarhub:songwriter-system",
        },
        body: JSON.stringify({
          model,
          temperature: 0.7,
          messages: [
            { role: "system", content: "Sen GuitarHub içinde çalışan müzik beste yardım sistemisin. Sadece istenen JSON'u döndür." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!response.ok) continue;
      const payload = (await response.json().catch(() => null)) as HermesSongwriterResponse | null;
      const content = payload?.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    } catch {
      // Try next candidate.
    }
  }
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as SongwriterRequest | null;
  const notebook = body?.notebook?.trim() ?? "";
  const sectionName = body?.sectionName?.trim() ?? "Nakarat";

  const raw = await callHermes(body ?? {}).catch(() => null);
  const suggestion = parseSuggestion(raw, notebook, sectionName);
  return NextResponse.json(suggestion);
}
