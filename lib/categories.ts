import type { Category, CategoryOption } from "./types";
export const defaultCategories: CategoryOption[] = [
  { key: "work", label: "업무", color: "bg-lavender text-lavender-ink", dot: "bg-lavender-ink" },
  { key: "journal", label: "일기", color: "bg-blue-soft text-blue-ink", dot: "bg-blue-ink" },
  { key: "emotion", label: "감정", color: "bg-coral-soft text-coral-ink", dot: "bg-coral" },
  { key: "todo", label: "할 일", color: "bg-yellow-soft text-yellow-ink", dot: "bg-yellow-ink" },
  { key: "idea", label: "아이디어", color: "bg-green-soft text-green-ink", dot: "bg-green-ink" },
  { key: "other", label: "기타", color: "bg-stone-soft text-stone-ink", dot: "bg-stone-ink" }
];
export function autoCategory(text: string): Category {
  const value = text.trim();
  // 감정 표현은 “해야/정리/확인” 같은 단어가 함께 들어가도 감정으로 우선 분류합니다.
  if (/느낌|기분|행복|불안|걱정|힘들|편안|감정|집중이 안|스트레스|우울|속상|슬프|외롭|두렵|무섭|짜증|화가|답답|피곤|지침|지쳤|설레|뿌듯|감사|긴장|마음이|괜찮지 않|좋다|싫다/.test(value)) return "emotion";
  if (/해야|하기|제출|완료|확인|보내|정리/.test(value)) return "todo";
  if (/회의|업무|프로젝트|캠페인|고객|제안서/.test(value)) return "work";
  if (/아이디어|어떨까|생각/.test(value)) return "idea";
  if (/오늘|점심|아침|저녁|하루/.test(value)) return "journal";
  return "other";
}
