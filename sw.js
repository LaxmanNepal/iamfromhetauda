const DB_NAME="iamfromhetauda-notifications",DB_VERSION=1,STORE="items",CACHE="iamfromhetauda-v3";\nconst SHELL=["./","./index.html","./manifest.webmanifest","./logo.jpg","./data/news.json","./data/push-config.json"];
self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));

function dbOpen(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,DB_VERSION);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:"key"})};
    r.onsuccess=()=>resolve(r.result);
    r.onerror=()=>reject(r.error);
  });
}
function saveRecord(n){
  const item={key:String(n.id||n.tag||n.body||Date.now()),id:n.id||"",title:n.title||"I Am From Hetauda",body:n.body||"",image:n.image||"./logo.jpg",url:n.url||("./?news="+encodeURIComponent(n.id||"")),created:Date.now(),read:false};
  return dbOpen().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");tx.objectStore(STORE).put(item);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
  }));
}
function markRead(key){
  if(!key)return Promise.resolve();
  return dbOpen().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite"),s=tx.objectStore(STORE),g=s.get(key);
    g.onsuccess=()=>{if(g.result){g.result.read=true;s.put(g.result)}};
    tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
  }));
}
self.addEventListener("push",e=>{
  let d={title:"I Am From Hetauda",body:"नयाँ समाचार उपलब्ध छ।",url:"./",image:"./logo.jpg",id:""};
  try{d=Object.assign(d,e.data?e.data.json():{})}catch(_){}
  const notification={title:d.title,body:d.body,url:d.url,image:d.image,id:d.id,tag:d.id||"news"};
  e.waitUntil(Promise.all([
    saveRecord(notification),
    self.registration.showNotification(d.title,{body:d.body,icon:"./logo.jpg",image:d.image||"./logo.jpg",badge:"./logo.jpg",tag:d.id||"news",renotify:true,data:{url:d.url||"./",id:d.id||""}})
  ]).then(()=>self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>Promise.all(cs.map(c=>c.postMessage({type:"NEWS_NOTIFICATION",notification:notification}))))));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const data=e.notification.data||{},key=String(data.id||e.notification.tag||e.notification.body||"");
  const url=new URL(data.url||"./",self.location.origin).href;
  e.waitUntil(markRead(key).catch(()=>{}).then(()=>clients.matchAll({type:"window",includeUncontrolled:true})).then(cs=>{
    for(const c of cs){if("focus" in c){c.navigate(url);return c.focus();}}
    return clients.openWindow(url);
  }));
});\nself.addEventListener("fetch",e=>{const u=new URL(e.request.url);if(e.request.method!=="GET"||u.origin!==self.location.origin)return;if(u.pathname.endsWith("/data/news.json")){e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));return}e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match("./index.html"))));});