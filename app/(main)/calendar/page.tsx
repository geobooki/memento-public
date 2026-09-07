"use client";
import { useMemo, useState } from "react";
import { Calendar, EntryCard, Header, Summary } from "../../../components/record-widgets";
import { useRecords } from "../../../components/records-provider";
import { formatKoreanDate, localDate } from "../../../lib/date";

export default function CalendarPage() {
  const [selected, setSelected] = useState(localDate());
  const { entries } = useRecords();
  const selectedEntries = useMemo(
    () => entries.filter((entry) => entry.date === selected).sort((a, b) => a.time.localeCompare(b.time)),
    [entries, selected],
  );

  return (
    <>
      <Header title="날짜별 보기" onSearch={() => {}} />
      <Calendar selectedDate={selected} onSelect={setSelected} />
      <div className="mt-8">
        <Summary date={selected} />
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="m-0 text-lg font-bold">{formatKoreanDate(selected)} 메모</h2>
            <p className="mt-1 text-xs text-muted">선택한 날짜에 작성한 기록이에요.</p>
          </div>
          <span className="text-xs font-semibold text-muted">{selectedEntries.length}개</span>
        </div>
        <div className="relative pl-7 before:absolute before:bottom-1 before:left-2 before:top-1 before:border-l before:border-dashed before:border-[#dcd8d0]">
          {selectedEntries.length ? selectedEntries.map((entry) => <EntryCard key={entry.id} entry={entry} />) : <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center text-sm text-muted">이 날짜에는 남겨진 메모가 없어요.</div>}
        </div>
      </div>
    </>
  );
}
