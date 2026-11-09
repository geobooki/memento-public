"use client";
import { useState } from "react";
import { getSupabaseBrowserClient } from "../lib/supabase";
import { MedicationForm, useMedications } from "./medication-provider";

const labels: Record<keyof MedicationForm, string> = { name: "약 이름", ingredient: "성분", doseAmount: "1회 복용량", doseUnit: "단위", schedule: "복용 시점", instructions: "복용법·횟수·기간" };
export function PrescriptionImport() {
  const { importMedications } = useMedications();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<MedicationForm[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const extract = async () => {
    if (!file || busy) return;
    setBusy(true); setRows([]); setWarnings([]); setConfirmed(false); setMessage("");
    try {
      if (file.size > 3 * 1024 * 1024) throw new Error("3MB 이하 파일을 선택해 주세요.");
      const client = getSupabaseBrowserClient();
      const session = client ? (await client.auth.getSession()).data.session : null;
      if (!session) throw new Error("로그인 후 처방전을 인식할 수 있습니다.");
      const body = new FormData(); body.append("file", file);
      const response = await fetch("/api/medications/extract", { method: "POST", headers: { Authorization: `Bearer ${session.access_token}` }, body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "처방전 인식에 실패했습니다.");
      setRows(data.medications); setWarnings(data.warnings);
      if (!data.medications.length) setMessage("약을 찾지 못했습니다. 약 목록이 선명하게 보이는 처방전으로 다시 시도해 주세요.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "인식에 실패했습니다."); }
    finally { setBusy(false); }
  };
  const save = async () => {
    if (!confirmed || !rows.length || busy) return;
    setBusy(true); setMessage("");
    try {
      if (!await importMedications(rows)) throw new Error("등록하지 못했습니다. 다시 시도해 주세요.");
      setMessage(`${rows.length}개의 약을 등록했어요.`); setRows([]); setConfirmed(false);
    } catch (error) { setMessage(error instanceof Error ? error.message : "등록하지 못했습니다."); }
    finally { setBusy(false); }
  };
  return <section className="mb-7 rounded-xl border border-line bg-white p-5">
    <h2 className="text-base font-bold">처방전으로 약 등록</h2>
    <p className="my-3 text-xs leading-6 text-muted">처방전 사진이나 PDF를 올리면 약 이름과 복용 정보를 자동으로 읽어요. JPG·PNG·WebP·PDF, 최대 3MB. 인식할 때 파일이 OpenAI로 전송됩니다.</p>
    <input aria-label="처방전 파일" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" disabled={busy} onChange={event => { setFile(event.target.files?.[0] ?? null); setRows([]); setWarnings([]); setMessage(""); setConfirmed(false); }} className="mb-3 block w-full text-xs" />
    <button disabled={!file || busy} onClick={extract} className="rounded-lg bg-coral px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{busy ? "처리 중…" : "처방전 자동 인식"}</button>
    {warnings.length > 0 && <ul className="mt-4 list-disc pl-4 text-xs text-coral-ink">{warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>}
    {rows.length > 0 && <div className="mt-5 grid gap-3"><p className="text-xs text-muted">{rows.length}개 약을 찾았어요. 빈칸은 판독되지 않은 정보입니다. 원본과 비교하고 필요한 부분만 수정해 주세요.</p>
      {rows.map((row, index) => <fieldset key={index} disabled={busy} className="rounded-lg border border-line p-3"><legend className="px-1 text-xs font-bold">약 {index + 1}</legend><div className="grid gap-2 sm:grid-cols-2">{(Object.keys(labels) as (keyof MedicationForm)[]).map(key => <label key={key} className="grid gap-1 text-xs text-muted">{labels[key]}<input value={row[key]} onChange={event => { setConfirmed(false); setRows(items => items.map((item, i) => i === index ? { ...item, [key]: event.target.value } : item)); }} placeholder="판독 정보 없음" className="rounded border border-line px-3 py-2 text-sm text-ink" /></label>)}</div><button onClick={() => { setRows(items => items.filter((_, i) => i !== index)); setConfirmed(false); }} className="mt-2 text-xs text-muted underline">이 약 제외</button></fieldset>)}
      <label className="flex items-start gap-2 text-xs leading-5"><input type="checkbox" checked={confirmed} disabled={busy} onChange={event => setConfirmed(event.target.checked)} />처방전 원본과 약 이름·1회 복용량·복용법을 확인했어요.</label>
      <button disabled={busy || !confirmed || rows.some(row => !row.name.trim())} onClick={save} className="rounded-lg bg-ink px-4 py-2 text-xs font-bold text-white disabled:opacity-50">확인한 약 {rows.length}개 등록</button>
    </div>}
    {message && <p role="status" className="mt-3 text-xs leading-6">{message}</p>}
  </section>;
}
