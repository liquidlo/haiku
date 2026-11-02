// Офлайн-читалка: страница кладётся в кэш при первом открытии,
// дальше отдаётся из кэша, а сеть обновляет копию в фоне.
var CACHE = 'haiku-v1';
var PAGE = new URL('./', self.location).pathname;
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll([PAGE, PAGE+'index.html']); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if (e.request.method!=='GET') return;
  var u = new URL(e.request.url);
  if (u.origin!==self.location.origin || u.pathname.indexOf(PAGE)!==0) return;
  e.respondWith(caches.open(CACHE).then(function(c){
    return c.match(e.request, {ignoreSearch:true}).then(function(hit){
      var net = fetch(e.request).then(function(r){ if(r.ok) c.put(e.request, r.clone()); return r; }).catch(function(){ return hit; });
      return hit || net;
    });
  }));
});
