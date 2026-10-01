import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const subscription = await request.json();
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) return NextResponse.json({ error: "잘못된 푸시 구독 정보입니다." }, { status: 400 });
  const { error } = await supabase.from("push_subscriptions").upsert({ user_id: user.id, endpoint: subscription.endpoint, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth, expiration_time: subscription.expirationTime ?? null, last_used_at: new Date().toISOString() }, { onConflict: "endpoint" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
