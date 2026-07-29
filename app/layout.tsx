import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "memento — 오늘의 기록",
  description: "하루의 생각을 빠르게 기록하고 정리하는 공간"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
