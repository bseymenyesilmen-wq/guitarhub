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
};

type OpenAiChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

function getProviderConfig() {
  const apiKey = process.env.AI_CHAT_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || "";
  const baseUrl = process.env.AI_CHAT_API_URL || (process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1");
  const model = process.env.AI_CHAT_MODEL || (process.env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini");
  return { apiKey, baseUrl: baseUrl.replace(/\/$/, ""), model };
}

async function callChatProvider(input: string, history: ChatMessage[]) {
  const { apiKey, baseUrl, model } = getProviderConfig();
  if (!apiKey) return null;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.45,
      messages: buildConversationMessages(input, history),
    }),
  });

  if (!response.ok) return null;

  const payload = (await response.json().catch(() => null)) as OpenAiChatResponse | null;
  return payload?.choices?.[0]?.message?.content?.trim() || null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatbotRequest | null;
  const message = body?.message?.trim() ?? "";
  const history = Array.isArray(body?.history) ? body.history : [];

  if (!message) {
    return NextResponse.json({ reply: "Mesaj boş olamaz." }, { status: 400 });
  }

  if (asksForRestrictedCapability(message)) {
    return NextResponse.json({ reply: RESTRICTED_REPLY });
  }

  const providerReply = await callChatProvider(message, history).catch(() => null);
  const reply = providerReply || buildFallbackReply(message);

  return NextResponse.json({ reply });
}
