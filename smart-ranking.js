/* I Am From Hetauda — News Feed 6.0 Smart Ranking */
(function(){
'use strict';
if(window.__IFH_SMART_RANK__)return;window.__IFH_SMART_RANK__=true;
var KEY='ifh_rank_signals',last=[];
function get(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function put(x){try{localStorage.setItem(KEY,JSON.stringify(x))}catch(e){}}
function local(n){var s=((n.title||'')+' '+(n.description||'')+' '+(n.category||'')).toLowerCase();return n.local===true||/hetauda|हेटौंडा|हेटौँडा|मकवानपुर|makwanpur/.test(s)}
function age(n){var d=new Date(n.published||'');return isNaN(d)?999:Math.max(0,(Date.now()-d.getTime())/3600000)}
function read(n){var x=get();return Number(x[n.id]||0)}
function score(n){
 var s=Number(n.score||0);
 var h=age(n);
 if(h<.5)s+=38;else if(h<1)s+=30;else if(h<3)s+=22;else if(h<6)s+=16;else if(h<12)s+=10;else if(h<24)s+=6;else if(h<48)s+=2;
 s+=Number(n.source_count||0)*10;
 if(n.verified)s+=16;
 if(local(n))s+=26;
 if(n.image_local||n.image)s+=4;
 s+=Math.min(24,read(n)*3);
 if(/breaking|तत्काल|ब्रेकिङ|आपतकाल|भूकम्प|बाढी|पहिरो|मृत्यु|निर्वाचन|सरकार|प्रधानमन्त्री/.test(String(n.title||'').toLowerCase()))s+=8;
 return s;
}
function rank(items){
 var groups=window.IFHStoryGroups?window.IFHStoryGroups(items):items.slice();
 groups.forEach(function(n){n.__smart_score=score(n)});
 groups.sort(function(a,b){return b.__smart_score-a.__smart_score});
 var out=[],cat={},src={},title=[];
 groups.forEach(function(n){
   var c=n.category||'other',sameCat=(cat[c]||0)>=3,s=(n.source||'unknown'),sameSrc=(src[s]||0)>=2;
   var t=String(n.title||'').toLowerCase().replace(/\s+/g,' ').slice(0,55);
   var dup=title.some(function(x){return x===t});
   if(dup)return;
   if(sameCat&&out.length<8)return;
   if(sameSrc&&out.length<8)return;
   out.push(n);cat[c]=(cat[c]||0)+1;src[s]=(src[s]||0)+1;title.push(t);
 });
 groups.forEach(function(n){if(out.indexOf(n)<0)out.push(n)});
 return out;
}
function track(items){
 var map={};last.forEach(function(n){map[n.id]=n});
 var now=get();
 (items||[]).slice(0,30).forEach(function(n){if(n.id){now[n.id]=Math.min(8,(Number(now[n.id])||0)+.25)}});put(now);
}
function inject(items){
 var ranked=rank(items||[]);
 window.IFHSmartRanked=ranked;
 var event=new CustomEvent('ifh:smart-ranked',{detail:{items:ranked}});
 document.dispatchEvent(event);
 return ranked;
}
function hook(){
 var old=window.IFHloadNews;
 if(!old||old.__smartWrapped)return setTimeout(hook,500);
 function wrapped(){
   return old.apply(this,arguments).then(function(){if(window.allNews)inject(window.allNews);return arguments});
 }
 wrapped.__smartWrapped=true;
 window.IFHloadNews=wrapped;
}
function start(){
 var oldFetch=window.fetch;
 window.fetch=function(input,init){
   return oldFetch.call(this,input,init).then(function(r){
     try{var u=typeof input==='string'?input:input.url||'';if(u.indexOf('./data/news.json')>=0){var clone=r.clone();clone.json().then(function(d){if(d&&Array.isArray(d.items)){last=d.items;track(d.items);inject(d.items)}}).catch(function(){})}}catch(e){}
     return r;
   });
 };
}
window.IFHSmartRank=function(items){return inject(items)};
window.IFHSmartRankScore=score;
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();