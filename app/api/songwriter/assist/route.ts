import { NextResponse } from "next/server";

type SongwriterRequest = {
  title?: string;
  keyName?: string;
  sectionName?: string;
  suggestionType?: string;
  moodPreset?: string;
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

function suggestionTypeLabel(value?: string) {
  switch (value) {
    case "lyrics-only":
      return "Sadece söz öner";
    case "chords-only":
      return "Sadece akor öner";
    case "polish-lyrics":
      return "Sözleri güçlendir";
    default:
      return "Devamını yaz";
  }
}

function moodPresetLabel(value?: string) {
  switch (value) {
    case "happy":
      return "Mutlu";
    case "romantic":
      return "Romantik";
    case "angry":
      return "Öfkeli";
    case "hopeful":
      return "Umutlu";
    case "dark":
      return "Karanlık";
    case "arabesk":
      return "Arabesk";
    case "rock":
      return "Rock";
    case "pop":
      return "Pop";
    case "lofi":
      return "Lo-fi";
    default:
      return "Hüzünlü";
  }
}

const CHORD_LINE_PATTERN = /^\s*(?:[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\/[A-G](?:#|b)?)?\s*)+$/i;

function extractLyricLines(notebook: string) {
  return notebook
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("[") && !CHORD_LINE_PATTERN.test(line));
}

function normalizeLyricLine(line: string) {
  return line
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-zçğıöşü0-9\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function lineTokens(line: string) {
  return normalizeLyricLine(line).split(" ").filter((word) => word.length > 2);
}

function sharedTokenRatio(a: string, b: string) {
  const first = new Set(lineTokens(a));
  const second = new Set(lineTokens(b));
  if (!first.size || !second.size) return 0;
  const shared = [...first].filter((word) => second.has(word)).length;
  return shared / Math.min(first.size, second.size);
}

function detectRhymeHint(notebook: string) {
  const lyricLines = extractLyricLines(notebook).slice(-4);
  const endings = lyricLines
    .map((line) => normalizeLyricLine(line).split(/\s+/).pop() ?? "")
    .filter(Boolean)
    .map((word) => word.slice(-4));
  return endings.length ? endings.join(" / ") : "yok";
}

function suggestedLyricsNeedRewrite(suggestedLyrics: string, notebook: string) {
  const existingLines = extractLyricLines(notebook).map(normalizeLyricLine).filter(Boolean);
  const suggestedLines = suggestedLyrics.split(/\r?\n/).map(normalizeLyricLine).filter(Boolean);
  if (!suggestedLines.length) return true;

  const repeatsInsideSuggestion = suggestedLines.some((line, index) => suggestedLines.slice(index + 1).some((other) => sharedTokenRatio(line, other) >= 0.65));
  const copiesExistingLine = suggestedLines.some((line) => existingLines.some((existing) => line === existing || sharedTokenRatio(line, existing) >= 0.72));
  return repeatsInsideSuggestion || copiesExistingLine;
}

function fallbackSuggestion(notebook: string, sectionName: string, suggestionType?: string, moodPreset?: string): SongwriterSuggestion {
  const lower = notebook.toLocaleLowerCase("tr-TR");
  const selectedMood = moodPresetLabel(moodPreset);
  const existingRhymeHint = detectRhymeHint(notebook);
  const sadWords = ["gece", "yalnız", "özledim", "ağla", "kırık", "yorgun", "duman", "acı"];
  const isSad = moodPreset === "sad" || sadWords.some((word) => lower.includes(word));
  const isBridge = sectionName.toLocaleLowerCase("tr-TR").includes("bridge");
  const isChorus = sectionName.toLocaleLowerCase("tr-TR").includes("nakarat");

  return {
    mood: selectedMood,
    idea: isBridge
      ? "Bridge bölümünde gerilimi biraz artırıp nakarata temiz çöz."
      : isChorus
        ? "Nakaratta cümleyi daha kısa, tekrar edilebilir ve akılda kalır yap."
        : `Aynı havayı bozmadan 1-2 satır devam ettir. Kafiye ipucu: ${existingRhymeHint}.`,
    suggestedChords: isSad ? "Am        F        C        G" : moodPreset === "lofi" ? "Am7       Dm7      G7       Cmaj7" : moodPreset === "rock" || moodPreset === "angry" ? "Em        G        D        A" : "C         G        Am       F",
    suggestedLyrics: isSad
      ? "İçimde susmayan bir gece var\nAdını söylesem yine dağılır"
      : moodPreset === "happy"
        ? "Güneş gibi doğdu içime sesin\nBugün her yol bize çıkar"
        : moodPreset === "romantic"
          ? "Elini tutsam şehir susar\nKalbim adını yavaşça yazar"
          : moodPreset === "angry"
            ? "Kırdığın yerden ayağa kalktım\nBu defa susmam, ateşi yaktım"
            : moodPreset === "arabesk"
              ? "Yaktın beni gecelerin ortasında\nAdın kaldı sigaramın dumanında"
              : "Yeniden başlar gibi bak bana\nSesinle açılır bu karanlık",
  };
}

function sanitizeSuggestion(suggestion: SongwriterSuggestion, notebook: string, sectionName: string, suggestionType?: string, moodPreset?: string): SongwriterSuggestion {
  if (!suggestedLyricsNeedRewrite(suggestion.suggestedLyrics, notebook)) return suggestion;
  const safe = fallbackSuggestion(notebook, sectionName, suggestionType, moodPreset);
  return {
    ...safe,
    idea: `${safe.idea} Yeni satırlar mevcut sözden kopyalanmadan, sadece duygu ve kafiye uyumuyla üretildi.`,
  };
}

function parseSuggestion(raw: string | null, notebook: string, sectionName: string, suggestionType?: string, moodPreset?: string): SongwriterSuggestion {
  if (!raw) return fallbackSuggestion(notebook, sectionName, suggestionType, moodPreset);
  const cleaned = raw.replace(/^```json/i, "").replace(/^```/, "").replace(/```$/, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as Partial<SongwriterSuggestion>;
    if (parsed.suggestedChords && parsed.suggestedLyrics) {
      return sanitizeSuggestion({
        mood: String(parsed.mood ?? "öneri"),
        idea: String(parsed.idea ?? "Bu bölüme uygun bir devam önerisi."),
        suggestedChords: String(parsed.suggestedChords),
        suggestedLyrics: String(parsed.suggestedLyrics),
      }, notebook, sectionName, suggestionType, moodPreset);
    }
  } catch {
    // Fallback below.
  }
  return fallbackSuggestion(notebook, sectionName, suggestionType, moodPreset);
}

async function callHermes(body: SongwriterRequest) {
  const apiKey = envValue("HERMES_API_KEY");
  const baseUrl = envValue("HERMES_API_URL").replace(/\/$/, "");
  const model = envValue("HERMES_API_MODEL") || "hermes-agent";
  if (!apiKey || !baseUrl) return null;

  const suggestionLabel = suggestionTypeLabel(body.suggestionType);
  const selectedMood = moodPresetLabel(body.moodPreset);
  const existingRhymeHint = detectRhymeHint(body.notebook || "");
  const prompt = `Şarkı sözü ve akor önerisi üret.
Kullanıcı GuitarHub Şarkı Yaz içinde beste yapıyor.
Yoda chat değilsin; sayfanın otomatik beste öneri sistemisin.
Sadece JSON dön. Markdown yok.
JSON şeması: {"mood":"...","idea":"...","suggestedChords":"...","suggestedLyrics":"..."}
Başlık: ${body.title || "Yeni Şarkı"}
Ton: ${body.keyName || "belirsiz"}
Bölüm: ${body.sectionName || "Nakarat"}
İstenen öneri tipi: ${suggestionLabel}
Duygu seçimi: ${selectedMood}
Kafiye ipucu: ${existingRhymeHint}
Defter:
${body.notebook || ""}
Kurallar:
- Önce mevcut sözleri analiz et: ana duygu, imgeler, son kelimeler, kafiye/uyak hissi.
- Sözlerin duygusunu analiz et ama seçilen duygu öncelikli: ${selectedMood}; öneri duygusal olarak passend olmalı.
- Bu duyguya göre söz ve akor öner: hüzünlü/mutlu/romantik/öfkeli/umutlu/karanlık/arabesk/rock/pop/lo-fi olabilir.
- Son satırların kafiye ucuna yaklaş; tam aynı kelimeyi tekrar etmek zorunda değilsin ama uyak hissi korunsun.
- Sözlerin imgesini ve kelime dünyasını koru; başka bir şarkı gibi değil aynı şarkının devamı gibi yaz.
- Kullanıcının yazdığı satırı, cümleyi veya özgün kelime grubunu kopyalama; aynı sözleri yeniden söyleme.
- Önerilen iki satır kendi içinde de birbirini tekrar etmesin; aynı fiil, aynı imge veya aynı cümle kalıbını arka arkaya kullanma.
- Mevcut sözden sadece duygu, tema, ritim ve kafiye ipucu al; yeni söz özgün olsun ama şarkının havasına uysun.
- Aynı kelimeleri birebir kopyalama; yeni ama bağlı bir satır üret.
- Var olan akorlara uyumlu 3-4 akorlu bir satır öner.
- suggestedChords tek satır olsun, akorlar boşluklu dizilsin.
- suggestedLyrics 1-2 satır Türkçe şarkı sözü olsun.
- Çok uzun yazma.
- Eğer öneri tipi "Devamını yaz" ise seçilen bölümün doğal devamını yaz; Bölüm Nakarat ise daha tekrar edilebilir ve güçlü, Bölüm Bridge ise geçiş hissi veren farklı ama uyumlu renk kullan.
- Eğer öneri tipi "Sadece söz öner" ise suggestedLyrics'i güçlendir, suggestedChords alanında mevcut/uyumlu akoru kısa tut.
- Eğer öneri tipi "Sadece akor öner" ise suggestedChords'u öne çıkar, suggestedLyrics alanında mevcut sözleri bozma ve kısa not yaz.
- Eğer öneri tipi "Sözleri güçlendir" ise mevcut sözleri aynı anlamda daha kafiyeli, daha doğal ve daha vurucu yap.
- Sadece istenen alanı güçlendir; kullanıcı söz istediyse gereksiz akor kalabalığı, akor istediyse gereksiz yeni söz yazma.
`;

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
  const suggestionType = body?.suggestionType?.trim() ?? "continue";
  const moodPreset = body?.moodPreset?.trim() ?? "sad";

  const raw = await callHermes(body ?? {}).catch(() => null);
  const suggestion = parseSuggestion(raw, notebook, sectionName, suggestionType, moodPreset);
  return NextResponse.json(suggestion);
}
