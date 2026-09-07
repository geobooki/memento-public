export function localDate(date = new Date()) { const offset = date.getTimezoneOffset() * 60000; return new Date(date.getTime() - offset).toISOString().slice(0, 10); }
export function formatKoreanDate(value: string, options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", weekday: "short" }) { return new Intl.DateTimeFormat("ko-KR", options).format(new Date(`${value}T00:00:00`)).replace("요일", ""); }
export function monthLabel(value: string) { return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(new Date(`${value}T00:00:00`)); }
export function moveDate(value: string, amount: number) { const date = new Date(`${value}T00:00:00`); date.setDate(date.getDate() + amount); return localDate(date); }
