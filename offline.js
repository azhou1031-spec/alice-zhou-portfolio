if ('serviceWorker' in navigator) {
  const status = document.createElement('span');
  status.setAttribute('role', 'status');
  status.style.cssText = 'display:block;margin-top:10px;font:12px Arial,sans-serif;color:#777';
  document.querySelector('footer').append(status);
  status.textContent = 'Saving portfolio for offline viewing…';
  navigator.serviceWorker.register('./sw.js').then(async registration => {
    await navigator.serviceWorker.ready;
    status.textContent = 'Available offline on this device';
    const requestStorage = () => {
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
    };
    requestStorage();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (worker) worker.addEventListener('statechange', () => {
        if (worker.state === 'redundant' && !navigator.serviceWorker.controller) {
          status.textContent = 'Offline download incomplete. Reopen with internet to retry.';
        }
      });
    });
  }).catch(() => {
    status.textContent = 'Offline download incomplete. Reopen with internet to retry.';
  });
}
