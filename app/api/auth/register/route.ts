import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { usernameToAuthEmail, normalizeUsername } from "@/lib/authUsername";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { name?: string; username?: string; password?: string } | null;
  const name = body?.name?.trim() ?? "";
  const username = normalizeUsername(body?.username ?? "");
  const password = body?.password ?? "";
  const email = usernameToAuthEmail(username);

  if (!name || !username || !password) {
    return NextResponse.json({ error: "İsim, kullanıcı adı ve şifre zorunludur." }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ error: "Kullanıcı adı en az 3 harf/rakam içermeli." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    return NextResponse.json({ error: "Kayıt servisi yapılandırılmamış." }, { status: 500 });
  }

  if (!serviceKey) {
    if (!anonKey) return NextResponse.json({ error: "Kayıt servisi yapılandırılmamış." }, { status: 500 });
    const publicClient = createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: signupError } = await publicClient.auth.signUp({
      email,
      password,
      options: { data: { name, username } },
    });
    if (signupError) {
      const duplicate = signupError.message.toLowerCase().includes("already") || signupError.message.toLowerCase().includes("registered");
      return NextResponse.json({ error: duplicate ? "Bu kullanıcı adı alınmış." : signupError.message }, { status: duplicate ? 409 : 400 });
    }
    return NextResponse.json({ ok: true, username, mode: "public-signup" });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: existingProfile } = await admin
    .from("profiles")
    .select("user_id")
    .eq("username", username)
    .maybeSingle();

  if (existingProfile?.user_id) {
    return NextResponse.json({ error: "Bu kullanıcı adı alınmış." }, { status: 409 });
  }

  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, username },
  });

  if (createError) {
    const duplicate = createError.message.toLowerCase().includes("already") || createError.message.toLowerCase().includes("registered");
    return NextResponse.json({ error: duplicate ? "Bu kullanıcı adı alınmış." : createError.message }, { status: duplicate ? 409 : 400 });
  }

  if (userData.user) {
    await admin.from("profiles").upsert({
      user_id: userData.user.id,
      name,
      username,
    }, { onConflict: "user_id" });
  }

  return NextResponse.json({ ok: true, username });
}
