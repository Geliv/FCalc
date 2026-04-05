const CACHE_NAME = 'mycalc-cache-v3';

const APP_SHELL = [
    './',
    './index.html',
    './MyCalc.html',
    './manifest.webmanifest?v=3',
    './icons/icon-v3.svg',
    './icons/icon-192-v3.png',
    './icons/icon-512-v3.png'
];

const CDN_RESOURCES = [
    'https://cdn.tailwindcss.com',
    'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.10.1/mathquill.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.8.0/math.min.js'
];

self.addEventListener('install', (event) => {
    // 先缓存应用壳，保证主页面和基础资源可离线打开。
    event.waitUntil(
        caches.open(CACHE_NAME).then(async (cache) => {
            await cache.addAll(APP_SHELL);

            // 额外预取跨域依赖，让页面在首次联网安装后也能离线打开。
            await Promise.all(
                CDN_RESOURCES.map(async (url) => {
                    try {
                        const response = await fetch(url, { mode: 'no-cors' });
                        await cache.put(url, response);
                    } catch (error) {
                        console.warn('CDN 资源预缓存失败:', url, error);
                    }
                })
            );
        })
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
