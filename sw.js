// TheGermanStefan Service Worker — injects level-nav.js into every HTML page
const NAV_SCRIPT = '<script src="/level-nav.js"><\/script>';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', event => {
  const req = event.request;
  // Only intercept HTML navigation requests
  if (req.mode !== 'navigate') return;

  event.respondWith(
    fetch(req).then(response => {
      if (!response.ok) return response;
      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('text/html')) return response;

      return response.text().then(html => {
        // Only inject if not already present
        if (html.includes('level-nav.js')) return new Response(html, {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });

        const injected = html.includes('</body>')
          ? html.replace('</body>', NAV_SCRIPT + '\n</body>')
          : html + '\n' + NAV_SCRIPT;

        return new Response(injected, {
          status: response.status,
          statusText: response.statusText,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      });
    }).catch(() => fetch(req))
  );
});
