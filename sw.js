/* W Group web-app shell — service worker.
 * Caches ONLY this small shell (page, icons) so the app opens instantly and shows a friendly
 * offline screen. It never touches the business app or its data (those always come live from Google). */
var CACHE = 'wg-shell-v1';
var SHELL = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/maskable-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-64.png', './icons/logo-white.png'];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(SHELL); }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){ return k!==CACHE; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  var req=e.request, url=new URL(req.url);
  if(req.method!=='GET' || url.origin!==self.location.origin) return;   // Google / app traffic: untouched
  // network first (so edits to config.js and the page arrive at once), cached copy when offline
  e.respondWith(fetch(req).then(function(res){
    var copy=res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); });
    return res;
  }).catch(function(){
    return caches.match(req).then(function(hit){ return hit || caches.match('./index.html'); });
  }));
});
