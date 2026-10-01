import webpush from "web-push";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || request.headers.get("authorization") !== `Bearer ${expected}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const subject = process.env.VAPID_SUBJECT || "mailto:memento@example.com";
  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return NextResponse.json({ error: "VAPID keys are not configured." }, { status: 500 });
  webpush.setVapidDetails(subject, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  const supabase = getSupabaseAdmin(); const now = new Date().toISOString();
  const { data: todos, error } = await supabase.from("entries").select("id, user_id, text, reminder_at").eq("category", "todo").eq("done", false).not("reminder_at", "is", null).lte("reminder_at", now).is("reminder_sent_at", null).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let sent = 0;
  for (const todo of todos ?? []) {
    const { data: subscriptions } = await supabase.from("push_subscriptions").select("id, endpoint, p256dh, auth").eq("user_id", todo.user_id);
    let delivered = false;
    for (const subscription of subscriptions ?? []) {
      try { await webpush.sendNotification({ endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } }, JSON.stringify({ title: "memento 할 일 알림", body: todo.text, url: "/todos", icon: "/apple-touch-icon.svg", badge: "/icon.svg" })); delivered = true; } catch (pushError: any) { if (pushError?.statusCode === 404 || pushError?.statusCode === 410) await supabase.from("push_subscriptions").delete().eq("id", subscription.id); }
    }
    if (delivered || !(subscriptions ?? []).length) { await supabase.from("entries").update({ reminder_sent_at: now }).eq("id", todo.id); sent += delivered ? 1 : 0; }
  }
  return NextResponse.json({ ok: true, checked: todos?.length ?? 0, sent });
}
