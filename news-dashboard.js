/* I Am From Hetauda — News Feed 9.0 Personal News Dashboard */
(function(){
'use strict';
if(window.__IFH_DASHBOARD__)return;window.__IFH_DASHBOARD__=true;
var $=function(s){return document.querySelector(s)},all=[],mode='all';
function local(n){return n.local===true||/hetauda|हेटौंडा|हेटौँडा|मकवानपुर|makwanpur/i.test((n.title||'')+' '+(n.description||''))}
function age(n){var d=new Date(n.published||'');return isNaN(d)?999:Math.max(0,(Date.now()-d.getTime())/60000)}
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&quot;'[c]||c,'"' :'&quot;'}[c]})}
function score(n){return Number(n.__smart_score||n.score||0)+(local(n)?20:0)+(Number(n.source_count||0)*6)+(age(n)<60?20:0)}
function mount(){
 if($('#ifhDashboard'))return true;
 var host=$('#ifhNewsRadar')||$('.status');
 if(!host)return false;
 var el=document.createElement('section');el.id='ifhDashboard';el.className='ifhDash';
 el.innerHTML='<div class="ifhDashHead"><div><span class="ifhDashKicker">MY NEWS DESK</span><h2>📰 आजको समाचार डेस्क</h2><p>मुख्य समाचार, हेटौंडा र तपाईंका रुचि — एउटै ठाउँमा</p></div><button id="ifhDashRefresh">↻</button></div><div class="ifhDashTabs"><button data-dash="all" class="active">मुख्य</button><button data-dash="local">📍 हेटौंडा</button><button data-dash="fresh">⚡ ताजा</button><button data-dash="verified">✓ verified</button></div><div id="ifhDashList"></div>';
 host.parentNode.insertBefore(el,host.nextSibling);
 $('#ifhDashRefresh').onclick=function(){if(window.IFHloadNews)window.IFHloadNews()};
 el.querySelectorAll('[data-dash]').forEach(function(b){b.onclick=function(){mode=b.dataset.dash;el.querySelectorAll('[data-dash]').forEach(function(x){x.classList.toggle('active',x===b)});render(all)}});
 return true;
}
function render(items){
 all=Array.isArray(items)?items.slice():all;
 if(!mount())return;
 var a=all.slice();
 if(mode==='local')a=a.filter(local);
 if(mode==='fresh')a.sort(function(x,y){return age(x)-age(y)});
 if(mode==='verified')a=a.filter(function(n){return n.verified===true||Number(n.source_count||0)>1});
 if(mode==='all')a.sort(function(x,y){return score(y)-score(x)});
 a=a.slice(0,6);
 var list=$('#ifhDashList');if(!list)return;
 list.innerHTML=a.map(function(n,i){var im=n.image_local||n.image||'';return '<button class="ifhDashItem" data-dash-id="'+String(n.id||'').replace(/"/g,'&quot;')+'"><span class="ifhDashRank">'+(i+1)+'</span>'+(im?'<img src="'+String(im).replace(/"/g,'&quot;')+'" loading="lazy" alt="">':'<span class="ifhDashNoImg">📰</span>')+'<span class="ifhDashBody"><strong>'+esc(n.title)+'</strong><small>'+(local(n)?'📍 Hetauda • ':'')+(n.source||'')+' • '+(age(n)<1?'अहिले':age(n)<60?Math.floor(age(n))+' मिनेट अघि':Math.floor(age(n)/60)+' घण्टा अघि')+(Number(n.source_count||0)>1?' • '+n.source_count+' स्रोत':'')+'</small></span></button>'}).join('');
 list.querySelectorAll('[data-dash-id]').forEach(function(b){b.onclick=function(){if(window.openById)window.openById(b.dataset.dashId)}});
}
function start(){
 if(!mount()){setTimeout(start,300);return}
 document.addEventListener('ifh:smart-ranked',function(e){render(e.detail&&e.detail.items||[])});
 setTimeout(function(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)},700);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHNewsDashboardRender=render;
})();