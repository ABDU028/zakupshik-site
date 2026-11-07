// Минимальный service worker: нужен, чтобы браузер предлагал «Установить приложение». Ничего не кэширует — панель всегда свежая.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
