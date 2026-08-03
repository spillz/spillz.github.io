const CACHE_NAME="dropship3d-proto-v1";
const BASE="/dropship3d-proto/";
const APP_SHELL=[
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}icon-192.png`,
  `${BASE}icon-512.png`,
  `${BASE}icon.svg`
];

async function cacheAppShell(){
  const cache=await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL);
  const response=await fetch(`${BASE}index.html`,{cache:"no-cache"});
  if(!response.ok)return;
  const html=await response.clone().text();
  await cache.put(`${BASE}index.html`,response);
  const baseUrl=new URL(BASE,self.location.origin);
  const urls=[...html.matchAll(/\b(?:href|src)="([^"]+)"/g)]
    .map(match=>new URL(match[1],baseUrl).href)
    .filter(url=>url.startsWith(baseUrl.href));
  await Promise.all(urls.map(url=>cache.add(url).catch(()=>{})));
}

self.addEventListener("install",event=>{
  event.waitUntil(
    cacheAppShell()
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET")return;
  event.respondWith(
    fetch(event.request)
      .then(response=>{
        const copy=response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      })
      .catch(()=>caches.match(event.request).then(cached=>cached||caches.match(`${BASE}index.html`)))
  );
});
