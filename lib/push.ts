function base64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export async function subscribeToPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) throw new Error("이 브라우저는 백그라운드 알림을 지원하지 않습니다.");
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!publicKey) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY가 설정되지 않았습니다.");
  const registration = await navigator.serviceWorker.register("/sw.js");
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") throw new Error("알림 권한이 허용되지 않았습니다.");
  const subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToUint8Array(publicKey) });
  const response = await fetch("/api/push/subscribe", { method: "POST", headers: { "content-type": "application/json" }, credentials: "include", body: JSON.stringify(subscription.toJSON()) });
  if (!response.ok) throw new Error("푸시 구독을 저장하지 못했습니다.");
  return subscription;
}
