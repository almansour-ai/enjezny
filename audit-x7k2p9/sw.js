const C="ars-v11";
const FILES=["./manifest.webmanifest","./icon-512.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
  const r=e.request;
  if(r.mode==="navigate"){
    e.respondWith(
      fetch(r).then(n=>{const cp=n.clone();caches.open(C).then(c=>c.put("./index.html",cp));return n;})
      .catch(()=>caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(caches.match(r).then(m=>m||fetch(r)));
});
