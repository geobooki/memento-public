import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "memento — 오늘의 기록", description: "하루의 생각을 빠르게 기록하고 정리하는 공간", icons: { icon: "/icon.svg", apple: "/apple-touch-icon.svg" }, appleWebApp: { capable: true, title: "memento", statusBarStyle: "default" } };
export const viewport: Viewport = { themeColor: "#fff8f2", width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ko"><body>{children}</body></html>; }
