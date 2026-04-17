"use client";

import { useEffect } from "react";

export function PWARegistry() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const clearDeploymentCaches = async () => {
      if (!("caches" in window)) {
        return;
      }

      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("wish2skill-"))
          .map((key) => caches.delete(key).catch(() => undefined))
      );
    };

    const removeLegacyServiceWorkers = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const hadRegistrations = registrations.length > 0;

      await Promise.all(
        registrations.map((registration) => registration.unregister().catch(() => false))
      );
      await clearDeploymentCaches();

      const reloadKey = "wish2skill-sw-reset";
      if (hadRegistrations && !window.sessionStorage.getItem(reloadKey)) {
        window.sessionStorage.setItem(reloadKey, "done");
        window.location.reload();
        return;
      }

      window.sessionStorage.removeItem(reloadKey);
    };

    removeLegacyServiceWorkers().catch((error) => {
      console.error("Service worker cleanup failed:", error);
    });
  }, []);

  return null;
}
