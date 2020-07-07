importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

workbox.setConfig({
    debug: false
});

// app files cache strategy
workbox.precaching.precacheAndRoute([{
    url: 'index.html',
    revision: '1'
}, {
    url: 'map.css',
    revision: '1'
}, {
    url: 'map.js',
    revision: '2',

}, {
    url: 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.3.1/css/ol.css',
    revision: '1',

}, {
    url: 'https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.3.1/build/ol.js',
    revision: '1'
}]);

// tile cache strategy
workbox.routing.registerRoute(function(o, e) {
    const s = o.url.href;
    if (s.includes('openstreetmap') || s.includes('tiles.virtualearth.net'))
        return true;
    return false;
}, new workbox.strategies.CacheFirst({
    cacheName: 'map_tiles',
    plugins: [new workbox.expiration.ExpirationPlugin({
        maxEntries: 2000,
        maxAgeSeconds: 365 * 24 * 60 * 60,
    })],
}));


// we could do a bunch of sexy ui upgrade stuff,
// for now just force an update
self.addEventListener('activate', function(event) {
	return self.clients.claim();
});
