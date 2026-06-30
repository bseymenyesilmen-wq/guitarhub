import { NextResponse } from "next/server";
import {
  asksForRestrictedCapability,
  buildConversationMessages,
  buildFallbackReply,
  RESTRICTED_REPLY,
  type ChatMessage,
} from "@/lib/chatbot";

type ChatbotRequest = {
  message?: string;
  history?: ChatMessage[];
  conversationId?: string;
};

type HermesChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function envValue(name: string) {
  const raw = process.env[name]?.trim() ?? "";
  const withoutOptionalKeyPrefix = raw.replace(new RegExp(`^${name}\\s*=\\s*`), "");
  return withoutOptionalKeyPrefix.replace(/^['\"]|['\"]$/g, "").trim();
}

function getHermesConfig() {
  const apiKey = envValue("HERMES_API_KEY");
  const baseUrl = envValue("HERMES_API_URL").replace(/\/$/, "");
  const model = envValue("HERMES_API_MODEL") || "hermes-agent";
  return { apiKey, baseUrl, model };
}

function chatCompletionsUrl(baseUrl: string) {
  if (baseUrl.endsWith("/v1")) {
    return `${baseUrl}/chat/completions`;
  }

  return `${baseUrl}/v1/chat/completions`;
}

async function callHermes(input: string, history: ChatMessage[], conversationId?: string) {
  const { apiKey, baseUrl, model } = getHermesConfig();
  if (!apiKey || !baseUrl) return null;

  const candidateBaseUrls = Array.from(new Set([
    baseUrl,
    baseUrl.replace(":8642", ""),
  ])).filter(Boolean);

  for (const candidateBaseUrl of candidateBaseUrls) {
    try {
      const response = await fetch(chatCompletionsUrl(candidateBaseUrl), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(conversationId ? { "X-Hermes-Session-Key": `guitarhub:${conversationId.slice(0, 180)}` } : {}),
        },
        body: JSON.stringify({
          model,
          temperature: 0.45,
          messages: buildConversationMessages(input, history),
        }),
      });

      if (!response.ok) continue;

      const payload = (await response.json().catch(() => null)) as HermesChatResponse | null;
      const reply = payload?.choices?.[0]?.message?.content?.trim();
      if (reply) return reply;
    } catch {
      // Try the next URL. Netlify functions can fail outbound fetches to non-standard ports.
    }
  }

  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatbotRequest | null;
  const message = body?.message?.trim() ?? "";
  const history = Array.isArray(body?.history) ? body.history : [];
  const conversationId = body?.conversationId?.trim();

  if (!message) {
    return NextResponse.json({ reply: "Mesaj boş olamaz." }, { status: 400 });
  }

  if (asksForRestrictedCapability(message)) {
    return NextResponse.json({ reply: RESTRICTED_REPLY });
  }

  const hermesReply = await callHermes(message, history, conversationId).catch(() => null);
  const reply = hermesReply || buildFallbackReply(message);

  return NextResponse.json({ reply });
}
