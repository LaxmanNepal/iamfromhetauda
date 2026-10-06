/* I Am From Hetauda — News Feed 8.0 News Radar */
(function(){
'use strict';
if(window.__IFH_NEWS_RADAR__)return;window.__IFH_NEWS_RADAR__=true;
var $=function(s){return document.querySelector(s)},last='';
function age(n){var d=new Date(n.published||'');return isNaN(d)?999:Math.max(0,(Date.now()-d.getTime())/60000)}
function render(items){
 var host=$('#ifhNewsRadar');if(!host)return;
 var groups=(items||[]).filter(function(n){return n.__story_count>1});
 groups.sort(function(a,b){return (b.__story_count||1)-(a.__story_count||1)});
 groups=groups.slice(0,5);
 var key=groups.map(function(n){return n.id}).join('|');if(key===last)return;last=key;
 if(!groups.length){host.style.display='none';return} host.style.display='block';
 host.querySelector('.ifhRadarList').innerHTML=groups.map(function(n){
   var sources=(n.__story_sources||n.related_sources||[n.source]).slice(0,6);
   var g=n.__story_group||[n],times=g.map(function(x){return new Date(x.published||'')}).filter(function(d){return !isNaN(d)});
   times.sort(function(a,b){return a-b});
   var first=times[0],latest=times[times.length-1],duration=first&&latest?Math.max(0,Math.round((latest-first)/60000)):0;
   return '<button class="ifhRadarItem" data-radar-id="'+String(n.id||'').replace(/"/g,'&quot;')+'"><span class="ifhRadarCount">'+(n.__story_count||2)+' स्रोत</span><span class="ifhRadarBody"><strong>'+String(n.title||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</strong><small>'+sources.join(' • ')+' '+(duration?'• '+duration+' मिनेटमा अपडेट':'• पछिल्लो '+(age(n)<60?Math.floor(age(n))+' मिनेट अघि':'आज') )+'</small></span><span>→</span></button>'
 }).join('');
 host.querySelectorAll('[data-radar-id]').forEach(function(b){b.onclick=function(){if(window.openById)window.openById(b.dataset.radarId)}});
}
function mount(){
 if($('#ifhNewsRadar'))return true;
 var status=$('.status');if(!status)return false;
 var el=document.createElement('section');el.id='ifhNewsRadar';el.className='ifhRadar';
 el.innerHTML='<div class="ifhRadarHead"><div><span>STORY RADAR</span><h2>🛰️ एउटै घटनाको अपडेट</h2><p>विभिन्न स्रोतबाट आएको एउटै समाचारलाई एउटै ठाउँमा हेर्नुहोस्।</p></div></div><div class="ifhRadarList"></div>';
 status.parentNode.insertBefore(el,status);
 return true;
}
function start(){if(!mount()){setTimeout(start,300);return}
 document.addEventListener('ifh:smart-ranked',function(e){render(e.detail&&e.detail.items||[])});
 setTimeout(function(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)},500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHNewsRadarRender=render;
})();