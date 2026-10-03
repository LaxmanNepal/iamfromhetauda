self.addEventListener("install",()=>self.skipWaiting());
self.addEventListener("activate",e=>e.waitUntil(self.clients.claim()));
self.addEventListener("push",e=>{
  let d={title:"I Am From Hetauda",body:"नयाँ समाचार उपलब्ध छ।",url:"./",image:"./logo.jpg"};
  try{d=Object.assign(d,e.data?e.data.json():{})}catch(_){}
  e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:"./logo.jpg",image:d.image,badge:"./logo.jpg",tag:d.id||"news",data:{url:d.url||"./"},renotify:true}));
});
self.addEventListener("notificationclick",e=>{
  e.notification.close();
  const url=new URL(e.notification.data?.url||"./",self.location.origin).href;
  e.waitUntil(clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{
    for(const c of cs){if("focus" in c){c.navigate(url);return c.focus();}}
    return clients.openWindow(url);
  }));
});