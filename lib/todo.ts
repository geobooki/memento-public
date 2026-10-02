import { localDate } from "./date";
import type { Entry } from "./types";

// 사용자가 시간을 직접 입력하지 않아도 받을 기본 알림 시각입니다.
export const DEFAULT_REMINDER_HOUR = 18;

const pad = (value: number) => String(value).padStart(2, "0");

export function effectiveTodoDate(entry: Pick<Entry, "date" | "done" | "dueDate">, today = localDate()) {
  const date = entry.dueDate ?? entry.date;
  return !entry.done && date < today ? today : date;
}

export function defaultReminderAt(date: string, now = new Date()) {
  const today = localDate(now);
  const scheduled = new Date(`${date}T${pad(DEFAULT_REMINDER_HOUR)}:00:00`);

  // 오늘 작성했거나 오래된 미완료 항목을 오늘로 옮겼는데 기본 시각도 지난 경우,
  // 즉시 알림을 보내지 않고 5분 뒤에 한 번 알립니다.
  if (date === today && scheduled.getTime() <= now.getTime()) {
    return new Date(now.getTime() + 5 * 60 * 1000).toISOString();
  }
  return scheduled.toISOString();
}
