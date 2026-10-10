(() => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  const resetKey = 'pwa-cache-reset-v1';

  try {
    if (sessionStorage.getItem(resetKey)) {
      return;
    }

    sessionStorage.setItem(resetKey, '1');
  } catch {
    // Storage is blocked (e.g. strict privacy settings). Skip the one-time reset.
    return;
  }

  const unregisterServiceWorkers = navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())));

  const clearCaches = 'caches' in window
    ? caches.keys().then((cacheNames) => Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName))))
    : Promise.resolve();

  Promise.all([unregisterServiceWorkers, clearCaches])
    .then(() => {
      if (navigator.serviceWorker.controller) {
        window.location.reload();
      }
    })
    .catch(() => {});
})();
