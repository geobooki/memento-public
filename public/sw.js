self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(data.title || "memento 알림", {
    body: data.body || "확인할 할 일이 있어요.",
    icon: data.icon || "/apple-touch-icon.svg",
    badge: data.badge || "/icon.svg",
    data: { url: data.url || "/todos" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const target = new URL(event.notification.data?.url || "/todos", self.location.origin).href;
    const existing = windows.find((window) => window.url === target);
    if (existing) return existing.focus();
    return clients.openWindow(target);
  }));
});
