const CACHE_NAME = 'mycalc-cache-v11';

const APP_SHELL = [
    './',
    './index.html',
    './MyCalc.html',
    './manifest.webmanifest?v=7',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './vendor/tailwindcss.js',
    './vendor/jquery.min.js',
    './vendor/math.min.js',
    './vendor/mathquill/mathquill.min.css',
    './vendor/mathquill/mathquill.min.js'
];

self.addEventListener('install', (event) => {
    // 先缓存应用壳和本地 vendoring 的依赖，保证主页面可离线打开。
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // 清理旧缓存，避免旧版本资源残留。
    event.waitUntil(
        caches.keys().then((keys) => Promise.all(
            keys
                .filter((key) => key !== CACHE_NAME)
                .map((key) => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then((networkResponse) => {
                // 运行时缓存首次访问到的资源，跨域脚本通常会返回 opaque 响应。
                if (
                    !networkResponse ||
                    (!networkResponse.ok && networkResponse.type !== 'opaque')
                ) {
                    return networkResponse;
                }

                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            });
        })
    );
});
