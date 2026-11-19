"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { writeEntry } from "../lib/entry-persistence";
import { usePathname } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, supabaseConfigured } from "../lib/supabase";
import { autoCategory, defaultCategories } from "../lib/categories";
import { localDate } from "../lib/date";
import { defaultReminderAt, effectiveTodoDate } from "../lib/todo";
import type { Category, CategoryOption, Entry, EntryRevision, TodoDetails } from "../lib/types";

type Store = { error: string | null; retry: () => void; entries: Entry[]; session: Session | null; loading: boolean; configured: boolean; categories: CategoryOption[]; add: (text: string, category: Category | "auto") => Promise<boolean>; toggle: (entry: Entry) => Promise<void>; updateText: (entry: Entry, text: string) => Promise<boolean>; updateCategory: (entry: Entry, category: Category) => Promise<void>; updateTodoDetails: (entry: Entry, details: TodoDetails) => Promise<void>; deleteEntry: (entry: Entry) => Promise<boolean>; addCategory: (label: string) => Promise<void>; signOut: () => Promise<void> };
const Ctx = createContext<Store | null>(null); const client = getSupabaseBrowserClient();
const rowToRevision = (row: any): EntryRevision => ({ id: row.id, previousText: row.previous_text, nextText: row.next_text, changedAt: row.changed_at });
const rowToEntry = (row: any, history: EntryRevision[] = []): Entry => ({ id: row.id, date: row.entry_date, time: String(row.entry_time).slice(0, 5), text: row.text, category: row.category, done: row.done, priority: row.priority ?? "normal", dueDate: row.due_date ?? null, dueTime: row.due_time ? String(row.due_time).slice(0, 5) : null, reminderAt: row.reminder_at ?? null, reminderSentAt: row.reminder_sent_at ?? null, history });

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null); const [localReady, setLocalReady] = useState(false); const pathname = usePathname(); const [entries, setEntries] = useState<Entry[]>([]); const [session, setSession] = useState<Session | null>(null); const [loading, setLoading] = useState(supabaseConfigured); const [categories, setCategories] = useState(defaultCategories);
  const load = async (userId: string) => {
    if (!client) return;
    setLoading(true); setError(null);
    try {
      const includeHistory = pathname !== "/todos" && pathname !== "/settings";
      const [result, revisionsResult] = await Promise.all([
        client.from("entries").select("*").eq("user_id", userId).order("entry_date", { ascending: false }).order("entry_time", { ascending: false }),
        includeHistory ? client.from("entry_revisions").select("id, entry_id, previous_text, next_text, changed_at").eq("user_id", userId).order("changed_at", { ascending: false }) : Promise.resolve({ data: [], error: null })
      ]);
      if (result.error) { setError("기록을 불러오지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요."); return; }
      const historyByEntry = new Map<string, EntryRevision[]>();
      (revisionsResult.data ?? []).forEach((row: any) => { const list = historyByEntry.get(row.entry_id) ?? []; list.push(rowToRevision(row)); historyByEntry.set(row.entry_id, list); });
      const today = localDate();
      const mapped = (result.data ?? []).map(row => rowToEntry(row, historyByEntry.get(row.id) ?? []));
      const normalized = mapped.map(item => {
        if (item.category !== "todo" || item.done) return item;
        const dueDate = effectiveTodoDate(item, today);
        const needsReminder = !item.reminderAt || (item.dueDate !== dueDate && !item.reminderSentAt);
        return { ...item, dueDate, reminderAt: needsReminder ? defaultReminderAt(dueDate) : item.reminderAt, reminderSentAt: needsReminder ? null : item.reminderSentAt };
      });
      setEntries(normalized);
      if (revisionsResult.error) setError("기록은 불러왔지만 수정 이력을 불러오지 못했어요.");
      await Promise.all(normalized.filter((item, i) => item.category === "todo" && !item.done && (item.dueDate !== mapped[i].dueDate || item.reminderAt !== mapped[i].reminderAt)).map(item => writeEntry({ due_date: item.dueDate, reminder_at: item.reminderAt, reminder_sent_at: null }, values => client.from("entries").update(values).eq("id", item.id).eq("user_id", userId))));
    } catch { setError("기록을 불러오지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요."); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (!client) { try { const saved = localStorage.getItem("memento-entries"); if (saved) { const parsed = JSON.parse(saved); if (!Array.isArray(parsed)) throw new Error(); setEntries(parsed); } setLocalReady(true); } catch { setError("브라우저의 기록을 읽지 못했어요. 저장 공간을 확인해 주세요."); } return; } let active = true; client.auth.getSession().then(({ data }) => { if (!active) return; setSession(data.session); setLoading(false); }); const { data } = client.auth.onAuthStateChange((_event, next) => { setSession(next); setLoading(false); if (!next) setEntries([]); }); return () => { active = false; data.subscription.unsubscribe(); }; }, []);
  useEffect(() => { if (session) { load(session.user.id); const custom = session.user.user_metadata?.categories; if (Array.isArray(custom)) setCategories([...defaultCategories, ...custom]); } }, [session, pathname]);
  useEffect(() => { if (!client && localReady) { try { localStorage.setItem("memento-entries", JSON.stringify(entries)); } catch { setError("브라우저에 기록을 저장하지 못했어요. 저장 공간을 확인해 주세요."); } } }, [entries, localReady]);
  const value = useMemo<Store>(() => ({ error, retry: () => { if (session) void load(session.user.id); }, entries, session, loading, configured: supabaseConfigured, categories,
    add: async (text, chosen) => {
      setError(null);
      if (client && !session) { setError("로그인 상태를 확인한 뒤 다시 시도해 주세요."); return false; }
      const category = chosen === "auto" ? autoCategory(text) : chosen;
      const now = new Date(); const date = localDate(now);
      if (client && session) {
        try {
          const { data, error: saveError } = await writeEntry({ user_id: session.user.id, entry_date: date, entry_time: now.toTimeString().slice(0, 5), text, category, done: false, priority: "normal", due_date: category === "todo" ? date : null, reminder_at: category === "todo" ? defaultReminderAt(date, now) : null, reminder_sent_at: null }, values => client.from("entries").insert(values).select("*").single());
          if (saveError || !data) { setError("기록을 저장하지 못했어요. 입력 내용은 유지했으니 다시 시도해 주세요."); return false; }
          setEntries(items => [rowToEntry(data), ...items]); return true;
        } catch { setError("기록을 저장하지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요."); return false; }
      }
      if (!localReady) { setError("브라우저 저장 공간을 사용할 수 없어 기록을 저장하지 못했어요."); return false; }
      setEntries(items => [{ id: String(Date.now()), date, time: now.toTimeString().slice(0, 5), text, category, done: false, priority: "normal", dueDate: category === "todo" ? date : null, dueTime: null, reminderAt: category === "todo" ? defaultReminderAt(date) : null, reminderSentAt: null, history: [] }, ...items]); return true;
    },
    toggle: async entry => { const done = !entry.done; setEntries(items => items.map(item => item.id === entry.id ? { ...item, done } : item)); if (client && session) await client.from("entries").update({ done }).eq("id", entry.id).eq("user_id", session.user.id); },
    updateText: async (entry, text) => { const nextText = text.trim(); if (!nextText || nextText === entry.text.trim()) return false; const changedAt = new Date().toISOString(); const revision: EntryRevision = { id: `revision-${Date.now()}`, previousText: entry.text, nextText, changedAt }; setEntries(items => items.map(item => item.id === entry.id ? { ...item, text: nextText, history: [revision, ...(item.history ?? [])] } : item)); if (client && session) { const { error } = await client.from("entries").update({ text: nextText }).eq("id", entry.id).eq("user_id", session.user.id); if (error) return false; await client.from("entry_revisions").insert({ entry_id: entry.id, user_id: session.user.id, previous_text: entry.text, next_text: nextText, changed_at: changedAt }); } return true; },
    updateCategory: async (entry, category) => { setEntries(items => items.map(item => item.id === entry.id ? { ...item, category } : item)); if (client && session) await client.from("entries").update({ category }).eq("id", entry.id).eq("user_id", session.user.id); },
    updateTodoDetails: async (entry, details) => { const dueDate = details.dueDate ?? effectiveTodoDate({ ...entry, ...details }, localDate()); const reminderAt = details.reminderAt ?? defaultReminderAt(dueDate); const normalized = { ...details, dueDate, reminderAt }; setEntries(items => items.map(item => item.id === entry.id ? { ...item, ...normalized, reminderSentAt: null } : item)); if (client && session) await writeEntry({ priority: normalized.priority, due_date: normalized.dueDate, due_time: normalized.dueTime, reminder_at: normalized.reminderAt, reminder_sent_at: null }, values => client.from("entries").update(values).eq("id", entry.id).eq("user_id", session.user.id)); },
    deleteEntry: async entry => { setEntries(items => items.filter(item => item.id !== entry.id)); if (client && session) { const { error } = await client.from("entries").delete().eq("id", entry.id).eq("user_id", session.user.id); if (error) { setEntries(items => [entry, ...items]); return false; } } return true; },
    addCategory: async label => { const next = { key: `custom-${Date.now()}`, label, color: "bg-stone-soft text-stone-ink", dot: "bg-stone-ink" }; const custom = categories.filter(item => !defaultCategories.some(base => base.key === item.key)); setCategories(items => [...items, next]); if (client && session) await client.auth.updateUser({ data: { categories: [...custom, next] } }); },
    signOut: async () => { if (client) await client.auth.signOut(); }
  }), [entries, session, loading, categories, error, localReady, pathname]); return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useRecords() { const value = useContext(Ctx); if (!value) throw new Error("useRecords must be used within RecordsProvider"); return value; }
