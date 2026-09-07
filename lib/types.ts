export type Category = string;
export type View = "today" | "calendar" | "todos" | "settings";
export type Entry = { id: string; date: string; time: string; text: string; category: Category; done: boolean };
export type CategoryOption = { key: Category; label: string; color: string; dot: string };
