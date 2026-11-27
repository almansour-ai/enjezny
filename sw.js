// إنجزني service worker: كاش بسيط عشان التطبيق يفتح بسرعة ويشتغل لو النت ضعيف.
const CACHE = 'anjezny-v36';
const SHELL = [
    './',
    'index.html',
    'privacy.html',
    'style.css?v=19',
    'app.js',
    'providers.js',
    'hero.png',
    'logo-header.png',
    'founder-v7.jpg',
    'founder-gehad-v5.jpg',
    'founder-hawary-v1.jpg',
    'manifest.webmanifest',
    'icons/icon-192.png',
    'icons/icon-512.png',
    'apple-touch-icon.png',
    'apple-touch-icon-167.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => Promise.all(SHELL.map((u) => fetch(new Request(u, { cache: 'reload' })).then((res) => { if (!res.ok) throw new Error(u); return cache.put(u, res); })))).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return; // الخطوط واللينكات الخارجية من الشبكة مباشرة

    // ملفات التثبيت (.apk): من الشبكة دائمًا، بدون كاش، عشان أي نسخة جديدة تنزل فورًا
    if (url.pathname.endsWith('.apk')) return;

    if (req.mode === 'navigate') {
        // الصفحات: الشبكة أولاً، ولو النت قطع هات من الكاش
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req).then((hit) => hit || caches.match('index.html')))
        );
        return;
    }

    // قايمة الصنايعية: الشبكة أولاً عشان أي تحديث يظهر فورًا، والكاش احتياطي لو النت قطع
    if (url.pathname.endsWith('providers.js')) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((cache) => cache.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req))
        );
        return;
    }

    // الملفات الثابتة: الكاش أولاً
    event.respondWith(
        caches.match(req).then((hit) => hit || fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
            return res;
        }))
    );
});
