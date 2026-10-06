/* I Am From Hetauda — Live Feed 5.0 */
(function(){
'use strict';
if(window.__IFH_LIVE_FEED__)return;window.__IFH_LIVE_FEED__=true;
var lastIds=[],timer=0,checking=false;
function ids(items){return (items||[]).slice(0,80).map(function(n){return String(n.id||n.link||n.title||'')})}
function getNews(){return fetch('./data/news.json?live='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok)throw Error(r.status);return r.json()})}
function currentIds(){return Array.prototype.slice.call(document.querySelectorAll('#news .card[data-id]')).map(function(x){return x.getAttribute('data-id')||''})}
function banner(count){
 var b=document.getElementById('ifhLiveBanner');
 if(!b){b=document.createElement('button');b.id='ifhLiveBanner';b.type='button';b.setAttribute('aria-live','polite');b.onclick=function(){b.classList.remove('show');if(window.IFHloadNews)window.IFHloadNews()};document.body.appendChild(b)}
 b.textContent='🔴 '+count+' नयाँ समाचार उपलब्ध छन् — हेर्नुहोस्';
 b.classList.add('show');
}
function css(){
 if(document.getElementById('ifh-live-style'))return;
 var s=document.createElement('style');s.id='ifh-live-style';s.textContent='#ifhLiveBanner{position:fixed;left:50%;top:78px;transform:translate(-50%,-18px) scale(.96);opacity:0;pointer-events:none;z-index:105;background:#111827;color:#fff;border:0;border-radius:999px;padding:10px 16px;font-size:11px;font-weight:900;box-shadow:0 14px 35px #0004;transition:.22s;cursor:pointer;max-width:calc(100% - 24px);white-space:nowrap}#ifhLiveBanner.show{transform:translate(-50%,0) scale(1);opacity:1;pointer-events:auto}@media(max-width:600px){#ifhLiveBanner{top:112px;font-size:10px}}';document.head.appendChild(s)
}
function check(){
 if(checking||!navigator.onLine)return;checking=true;
 getNews().then(function(d){
   var fresh=ids(d.items||[]);
   if(!lastIds.length){lastIds=fresh;return}
   var old={};lastIds.forEach(function(x){old[x]=1});
   var added=fresh.filter(function(x){return x&&!old[x]});
   if(added.length){banner(added.length);document.dispatchEvent(new CustomEvent('ifh:new-stories',{detail:{count:added.length,ids:added}}))}
   lastIds=fresh;
 }).catch(function(){}).finally(function(){checking=false})
}
function start(){
 css();setTimeout(function(){lastIds=currentIds();check()},2500);
 timer=setInterval(check,120000);
 window.addEventListener('online',check);
 document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')check()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHCheckLive=check;
})();