"use client";
import { useState } from "react"; import { Calendar, Header } from "../../../components/record-widgets"; import { localDate } from "../../../lib/date";
export default function CalendarPage() { const [selected, setSelected] = useState(localDate()); return <><Header title="날짜별 보기" onSearch={() => {}} /><Calendar selectedDate={selected} onSelect={setSelected} /></>; }
