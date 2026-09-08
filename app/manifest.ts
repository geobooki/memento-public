import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "memento — 오늘의 기록",
    short_name: "memento",
    description: "하루의 생각을 빠르게 기록하고 정리하는 공간",
    start_url: "/",
    display: "standalone",
    background_color: "#fff8f2",
    theme_color: "#fff8f2",
    icons: [
      { src: "/icon.svg", sizes: "64x64", type: "image/svg+xml" },
      { src: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
