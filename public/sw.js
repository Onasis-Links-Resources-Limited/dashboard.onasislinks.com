self.addEventListener("push", (event) => {
  let data = {
    title: "Onasis Links",
    body: "You have a new notification",
    url: "/dashboard",
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch (err) {
    console.warn("[sw] Failed to parse push payload:", err);
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      tag: data.tag || "onasis-default",
      data: { url: data.url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        for (const win of wins) {
          if (win.url.includes(url) && "focus" in win) return win.focus();
        }
        return self.clients.openWindow(url);
      }),
  );
});
