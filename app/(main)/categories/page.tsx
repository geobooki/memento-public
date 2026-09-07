"use client";

import { useMemo, useState } from "react";
import { EntryCard, Header } from "../../../components/record-widgets";
import { useRecords } from "../../../components/records-provider";

export default function CategoriesPage() {
  const { entries, categories } = useRecords();
  const [selected, setSelected] = useState("all");
  const [query, setQuery] = useState("");
  const visible = useMemo(() => entries
    .filter((entry) => selected === "all" || entry.category === selected)
    .filter((entry) => !query || entry.text.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)), [entries, selected, query]);

  return <><Header title="카테고리별 모아보기" onSearch={setQuery} /><div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3"><button onClick={() => setSelected("all")} className={`rounded-xl border p-4 text-left ${selected === "all" ? "border-ink bg-ink text-white" : "border-line bg-white"}`}><span className="block text-xs text-muted">{selected === "all" ? "전체 기록" : "전체"}</span><strong className="mt-2 block text-2xl">{entries.length}</strong></button>{categories.map((category) => { const count = entries.filter((entry) => entry.category === category.key).length; return <button key={category.key} onClick={() => setSelected(category.key)} className={`rounded-xl border p-4 text-left ${selected === category.key ? "border-ink bg-ink text-white" : "border-line bg-white"}`}><span className={`inline-block rounded px-2 py-1 text-[10px] font-bold ${selected === category.key ? "bg-white/15 text-white" : category.color}`}>{category.label}</span><strong className="mt-2 block text-2xl">{count}</strong></button>; })}</div><div className="mb-4 flex items-end justify-between"><div><h2 className="m-0 text-lg font-bold">{selected === "all" ? "모든 기록" : categories.find((category) => category.key === selected)?.label} 기록</h2><p className="mt-1 text-xs text-muted">날짜와 관계없이 한곳에서 확인할 수 있어요.</p></div><span className="text-xs font-semibold text-muted">{visible.length}개</span></div><div className="relative pl-7 before:absolute before:bottom-1 before:left-2 before:top-1 before:border-l before:border-dashed before:border-[#dcd8d0]">{visible.length ? visible.map((entry) => <EntryCard key={entry.id} entry={entry} />) : <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">조건에 맞는 기록이 없어요.</div>}</div></>;
}
