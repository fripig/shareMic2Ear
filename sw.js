/* shareMic2Ear service worker — 離線可用 + 背景更新
 *
 * 策略：stale-while-revalidate。先回快取讓頁面立刻開起來，同時在背景抓新版；
 * 抓到的內容若與快取不同就通知頁面，由使用者決定何時重新載入
 * （監聽進行中自動重新載入會直接切斷音訊，所以絕不自動 reload）。
 */
"use strict";

const CACHE = "sharemic2ear-v1";

// 相對於 sw.js 所在目錄，因此部署到 GitHub Pages 子路徑也不用改
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
];

// 這些網址由 SW 負責供應；其餘一律直接走網路，不進快取
const shellUrls = new Set(SHELL.map((p) => new URL(p, self.registration.scope).href));
const indexUrl = new URL("./", self.registration.scope).href;

// 背景更新可能比新頁面掛上 message 監聽器還快，所以除了主動推播，
// 也把「有新版待套用」記下來，讓頁面載入後補問一次
let pendingUpdate = false;

self.addEventListener("install", (e) => {
  // 不呼叫 skipWaiting()：新版本先進入 waiting，等使用者按下「重新載入」才接手
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (e) => {
  const type = e.data && e.data.type;
  if (type === "SKIP_WAITING") self.skipWaiting();
  if (type === "CHECK_UPDATE" && pendingUpdate && e.source) {
    e.source.postMessage({ type: "CONTENT_UPDATED", url: indexUrl });
  }
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 導覽請求一律對應到 app shell，離線時才開得起來
  if (req.mode === "navigate") {
    e.respondWith(swr(e, indexUrl));
    return;
  }
  if (shellUrls.has(url.href)) e.respondWith(swr(e, url.href));
});

async function swr(e, key) {
  const req = e.request;
  const cache = await caches.open(CACHE);
  const cached = await cache.match(key);

  const network = fetch(req).then(async (res) => {
    if (!res || !res.ok || res.type === "opaque") return res;
    const fresh = !cached || stamp(res) !== stamp(cached);
    await cache.put(key, res.clone());
    // sw.js 沒動、只有內容改版時，走的就是這條通知
    if (cached && fresh) { pendingUpdate = true; notify(key); }
    return res;
  }).catch(() => null);

  // 送出去的就是目前快取的版本，所以先當作已是最新；
  // 底下的背景更新若發現伺服器上有更新，會再把旗標立回來
  if (req.mode === "navigate") pendingUpdate = false;

  // 先回快取時，背景更新要靠 waitUntil 撐住，否則 SW 可能提早被收掉
  if (cached) {
    e.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}

// 用驗證標頭判斷內容有沒有換過；GitHub Pages 兩個都會給
function stamp(res) {
  return res.headers.get("etag") || res.headers.get("last-modified") || "";
}

async function notify(key) {
  const clients = await self.clients.matchAll({ type: "window" });
  for (const c of clients) c.postMessage({ type: "CONTENT_UPDATED", url: key });
}
