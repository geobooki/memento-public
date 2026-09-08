export type Category = string;
export type View = "today" | "calendar" | "todos" | "settings";
export type Entry = { id: string; date: string; time: string; text: string; category: Category; done: boolean; history?: EntryRevision[] };
export type EntryRevision = { id: string; previousText: string; nextText: string; changedAt: string };
export type CategoryOption = { key: Category; label: string; color: string; dot: string };
