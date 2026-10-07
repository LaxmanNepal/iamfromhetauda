/* I Am From Hetauda — News Feed 13.0 vertical 24H News Reels */
(function(){
'use strict';
if(window.__IFH_VERTICAL_REELS__)return;window.__IFH_VERTICAL_REELS__=true;
var $=function(s){return document.querySelector(s)},items=[],active=0,timer=0;
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function age(n){var d=new Date(n.published||'');if(isNaN(d))return 999999;return Math.max(0,(Date.now()-d.getTime())/60000)}
function mount(){
 if($('#ifhReels13'))return true;
 var host=$('#ifhReels')||$('#ifhDashboard')||$('.status');if(!host)return false;
 var el=document.createElement('section');el.id='ifhReels13';el.className='ifhReels13';
 el.innerHTML='<div class="ifhR13Head"><div><b>NEWS REELS • 24H</b><h2>🎬 समाचार Reels</h2><span>माथि/तल swipe गरेर अर्को समाचार</span></div><button id="ifhR13Close">×</button></div><div class="ifhR13Feed" id="ifhR13Feed"></div>';
 host.parentNode.insertBefore(el,host.nextSibling);
 $('#ifhR13Close').onclick=function(){el.classList.toggle('collapsed');localStorage.setItem('ifh_reels_collapsed',el.classList.contains('collapsed')?'1':'0')};
 if(localStorage.getItem('ifh_reels_collapsed')==='1')el.classList.add('collapsed');
 return true;
}
function render(a){
 items=Array.isArray(a)?a.slice():items;if(!mount())return;
 var fresh=items.filter(function(n){var m=age(n);return m<=1440&&m>=-10});
 fresh.sort(function(a,b){return Number(b.source_count||0)*9+Number(b.verified||0)*15+(age(a)-age(b))});
 var feed=$('#ifhR13Feed');if(!feed)return;
 if(!fresh.length){feed.innerHTML='<div class="ifhR13Empty">पछिल्लो २४ घण्टामा समाचार छैन।</div>';return}
 feed.innerHTML=fresh.slice(0,40).map(function(n,i){
  var im=n.image_local||n.image||'';
  return '<article class="ifhR13Card" data-id="'+esc(n.id)+'"><div class="ifhR13Media">'+(im?'<img src="'+esc(im)+'" loading="'+(i<2?'eager':'lazy')+'" alt="">':'<div class="ifhR13NoImg">📰</div>')+'</div><div class="ifhR13Shade"></div><div class="ifhR13Progress"><i></i></div><div class="ifhR13Text"><div class="ifhR13Meta"><b>'+(n.source||'समाचार')+'</b><span>'+(age(n)<60?Math.floor(age(n))+' मिनेट अघि':Math.floor(age(n)/60)+' घण्टा अघि')+'</span></div><h3>'+esc(n.title)+'</h3><p>'+esc(n.description||'')+'</p><div class="ifhR13Actions"><button data-open="'+esc(n.id)+'">पढ्नुहोस्</button><button data-save="'+esc(n.id)+'">★ सेभ</button><button data-share="'+esc(n.id)+'">↗ शेयर</button></div></div></article>'
 }).join('');
 feed.querySelectorAll('[data-open]').forEach(function(b){b.onclick=function(e){e.stopPropagation();if(window.openById)window.openById(b.dataset.open)}});
 feed.querySelectorAll('[data-save]').forEach(function(b){b.onclick=function(e){e.stopPropagation();var id=b.dataset.save,a=[];try{a=JSON.parse(localStorage.getItem('saved_news')||'[]')}catch(_){}var x=a.indexOf(id);if(x>=0)a.splice(x,1);else a.unshift(id);localStorage.setItem('saved_news',JSON.stringify(a.slice(0,300)));b.textContent=x>=0?'★ सेभ':'✓ सेभ भयो'}});
 feed.querySelectorAll('[data-share]').forEach(function(b){b.onclick=function(e){e.stopPropagation();var id=b.dataset.share,u=location.origin+location.pathname+'?news='+encodeURIComponent(id);if(navigator.share)navigator.share({url:u}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(u)}});
 feed.querySelectorAll('.ifhR13Card').forEach(function(card){card.onclick=function(){if(window.openById)window.openById(card.dataset.id)}});
 setupSwipe(feed);
}
function setupSwipe(feed){
 var sy=0,st=0;
 feed.ontouchstart=function(e){sy=e.touches[0].clientY;st=Date.now()};
 feed.ontouchend=function(e){var dy=e.changedTouches[0].clientY-sy;if(Math.abs(dy)>55&&Date.now()-st<700){var cards=feed.querySelectorAll('.ifhR13Card');if(dy<0&&active<cards.length-1)active++;if(dy>0&&active>0)active--;if(cards[active])cards[active].scrollIntoView({behavior:'smooth',block:'nearest'})}};
 var cards=feed.querySelectorAll('.ifhR13Card');cards.forEach(function(c,i){c.onclick=function(){if(window.openById)window.openById(c.dataset.id)}})
}
function start(){
 if(!mount()){setTimeout(start,300);return}
 document.addEventListener('ifh:smart-ranked',function(e){render(e.detail&&e.detail.items||[])});
 setTimeout(function(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)},800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHRenderVerticalReels=render;
})();