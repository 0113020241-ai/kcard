// 인터넷이 없어도 열리도록 파일을 캐시한다. 파일을 고치면 VERSION을 올릴 것.
const VERSION = "v6";
const FILES = ["./", "index.html", "manifest.json", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener("install", (e) => {
  // 파일 하나가 없어도 설치가 통째로 실패하지 않게 한 개씩 담는다.
  // (addAll은 하나라도 404면 전체가 실패해서 앱이 옛 버전에 갇힌다)
  e.waitUntil(
    caches.open(VERSION).then((c) => Promise.allSettled(FILES.map((f) => c.add(f))))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// 온라인이면 최신 파일, 오프라인이면 캐시
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(VERSION).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
