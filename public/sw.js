const CACHE_PREFIX = "wish2skill-";

async function clearWish2SkillCaches() {
  const keys = await caches.keys();
  await Promise.all(
    keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key))
  );
}

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    clearWish2SkillCaches()
      .then(async () => {
        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        await self.registration.unregister();
        await Promise.all(
          clients.map((client) => {
            if ("navigate" in client) {
              return client.navigate(client.url);
            }

            return Promise.resolve();
          })
        );
      })
      .catch(() => self.registration.unregister())
  );
});
