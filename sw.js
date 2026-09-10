const SURUM='fd-yazilim-mobil-v22';
const KABUK=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',event=>event.waitUntil(caches.open(SURUM).then(cache=>cache.addAll(KABUK)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==SURUM).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  event.respondWith(fetch(event.request).then(response=>{const copy=response.clone();caches.open(SURUM).then(cache=>cache.put(event.request,copy));return response}).catch(()=>caches.match(event.request).then(cached=>cached||caches.match('./index.html'))));
});
self.addEventListener('push',event=>{
  let veri={title:'FD YAZILIM',body:'Yeni bir bildiriminiz var.',icon:'./icon-192.png',badge:'./icon-192.png',url:'./'};
  try{if(event.data)veri={...veri,...event.data.json()}}catch(_){if(event.data)veri.body=event.data.text()}
  event.waitUntil(self.registration.showNotification(veri.title||'FD YAZILIM',{
    body:veri.body||'',icon:veri.icon||'./icon-192.png',badge:veri.badge||'./icon-192.png',
    data:{url:veri.url||'./',notificationId:veri.notificationId||'',title:veri.title||'FD YAZILIM',body:veri.body||''},tag:'fd-yazilim-duyuru-'+(veri.notificationId||Date.now()),renotify:true
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const veri=event.notification.data||{},hedefUrl=new URL(veri.url||'./',self.location.href);
  hedefUrl.searchParams.set('fdPushTitle',veri.title||event.notification.title||'FD YAZILIM');hedefUrl.searchParams.set('fdPushMessage',veri.body||event.notification.body||'Yeni bir bildiriminiz var.');if(veri.notificationId)hedefUrl.searchParams.set('fdPushId',veri.notificationId);const hedef=hedefUrl.href;
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(pencereler=>{
    for(const pencere of pencereler){if(pencere.url.startsWith(self.location.origin)&&'focus' in pencere){pencere.postMessage({type:'FD_PUSH_NOTIFICATION_OPEN',notificationId:veri.notificationId||'',title:veri.title||event.notification.title||'FD YAZILIM',body:veri.body||event.notification.body||''});return pencere.focus()}}
    return clients.openWindow?clients.openWindow(hedef):undefined;
  }));
});
