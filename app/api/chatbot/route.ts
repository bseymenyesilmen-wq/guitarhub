import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  asksForRestrictedCapability,
  buildConversationMessages,
  buildPublicFallbackReply,
  isAdminEmail,
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function getBearerToken(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? "";
}

async function getUserEmail(request: Request) {
  const token = getBearerToken(request);
  if (!token || !supabaseUrl || !supabaseAnonKey) return null;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data } = await supabase.auth.getUser(token);
  return data.user?.email ?? null;
}

function getProviderConfig() {
  const apiKey = process.env.AI_CHAT_API_KEY || process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY || "";
  const baseUrl = process.env.AI_CHAT_API_URL || (process.env.OPENROUTER_API_KEY ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1");
  const model = process.env.AI_CHAT_MODEL || (process.env.OPENROUTER_API_KEY ? "openai/gpt-4o-mini" : "gpt-4o-mini");
  return { apiKey, baseUrl: baseUrl.replace(/\/$/, ""), model };
}

async function callChatProvider(input: string, history: ChatMessage[], email: string | null, isAdmin: boolean) {
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
      temperature: 0.3,
      messages: buildConversationMessages(input, history, { email, isAdmin }),
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

  const email = await getUserEmail(request);
  const isAdmin = isAdminEmail(email);

  if (!isAdmin && asksForRestrictedCapability(message)) {
    return NextResponse.json({ reply: buildPublicFallbackReply(message), isAdmin });
  }

  const providerReply = await callChatProvider(message, history, email, isAdmin).catch(() => null);
  const reply = providerReply || buildPublicFallbackReply(message);

  return NextResponse.json({ reply, isAdmin });
}
