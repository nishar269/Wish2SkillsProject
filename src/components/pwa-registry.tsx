"use client";

import { useEffect } from "react";

export function PWARegistry() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const deployId =
      process.env.NEXT_PUBLIC_DEPLOY_ID ||
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ||
      "dev";

    const cleanupKey = `wish2skill-sw-cleanup:${deployId}`;
    const reloadKey = `wish2skill-sw-reload:${deployId}`;

    const hasAlreadyCleanedUp = () => {
      try {
        return window.localStorage.getItem(cleanupKey) === "done";
      } catch {
        return false;
      }
    };

    const markCleanedUp = () => {
      try {
        window.localStorage.setItem(cleanupKey, "done");
      } catch {
        // localStorage can be disabled; best-effort only.
      }
    };

    if (hasAlreadyCleanedUp()) {
      return;
    }

    const clearDeploymentCaches = async (): Promise<number> => {
      if (!("caches" in window)) {
        return 0;
      }

      const keys = await caches.keys();
      const wish2skillKeys = keys.filter((key) => key.startsWith("wish2skill-"));

      await Promise.allSettled(
        wish2skillKeys.map((key) => caches.delete(key).catch(() => undefined))
      );

      return wish2skillKeys.length;
    };

    const removeLegacyServiceWorkers = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations().catch(() => []);
      const hadRegistrations = registrations.length > 0;

      await Promise.allSettled(registrations.map((registration) => registration.unregister()));
      const deletedCacheCount = await clearDeploymentCaches();

      // Mark before potentially reloading to avoid loops.
      markCleanedUp();

      const shouldReload = hadRegistrations || deletedCacheCount > 0;
      if (shouldReload && !window.sessionStorage.getItem(reloadKey)) {
        window.sessionStorage.setItem(reloadKey, "done");
        window.location.reload();
        return;
      }

      window.sessionStorage.removeItem(reloadKey);
    };

    removeLegacyServiceWorkers().catch(() => {
      // Best-effort cleanup only; don't block boot.
      markCleanedUp();
    });
  }, []);

  return null;
}
