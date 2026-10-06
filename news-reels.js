/* I Am From Hetauda — News Feed 12.0 Read Mode + 24H News Reels */
(function(){
'use strict';
if(window.__IFH_READ_REELS__)return;window.__IFH_READ_REELS__=true;
var $=function(s){return document.querySelector(s)},items=[];
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function age(n){var d=new Date(n.published||'');if(isNaN(d))return 999999;return Math.max(0,(Date.now()-d.getTime())/60000)}
function mount(){
 if($('#ifhReels'))return true;
 var host=$('#ifhDashboard')||$('#ifhNewsRadar')||$('.status');if(!host)return false;
 var el=document.createElement('section');el.id='ifhReels';el.className='ifhReels';
 el.innerHTML='<div class="ifhReelsHead"><div><span>NEWS REELS • 24 HOURS</span><h2>🎬 पछिल्लो २४ घण्टाका समाचार</h2><p>TikTok/Reels जस्तै — swipe गर्दै छोटो समाचार हेर्नुहोस्</p></div><button id="ifhReelsReset">↻</button></div><div class="ifhReelsViewport"><div class="ifhReelsTrack" id="ifhReelsTrack"></div></div>';
 host.parentNode.insertBefore(el,host.nextSibling);
 $('#ifhReelsReset').onclick=function(){render(items)};
 return true;
}
function render(a){
 items=Array.isArray(a)?a.slice():items;if(!mount())return;
 var now=Date.now(),fresh=items.filter(function(n){var m=age(n);return m<=1440&&m>=-10});
 fresh.sort(function(a,b){return (Number(b.source_count||0)*8+(b.verified?12:0)+(age(a)-age(b)))});
 var track=$('#ifhReelsTrack');
 if(!fresh.length){track.innerHTML='<div class="ifhReelsEmpty">पछिल्लो २४ घण्टामा समाचार उपलब्ध छैन।</div>';return}
 track.innerHTML=fresh.slice(0,30).map(function(n,i){
  var im=n.image_local||n.image||'';
  return '<article class="ifhReel" data-id="'+esc(n.id)+'"><div class="ifhReelBg">'+(im?'<img src="'+esc(im)+'" loading="lazy" alt="">':'')+'</div><div class="ifhReelShade"></div><div class="ifhReelContent"><div class="ifhReelTop"><b>NEWS '+(i+1)+'</b><span>'+(age(n)<60?Math.floor(age(n))+' मिनेट अघि':Math.floor(age(n)/60)+' घण्टा अघि')+'</span></div><div><small>'+(n.source||'')+(n.verified?' • ✓ VERIFIED':'')+'</small><h3>'+esc(n.title)+'</h3><p>'+esc(n.description||'')+'</p><button data-reel-open="'+esc(n.id)+'">समाचार पढ्नुहोस् →</button></div></div></article>'
 }).join('');
 track.querySelectorAll('[data-reel-open]').forEach(function(b){b.onclick=function(e){e.stopPropagation();if(window.openById)window.openById(b.dataset.reelOpen)}});
 track.querySelectorAll('.ifhReel').forEach(function(c){c.onclick=function(){if(window.openById)window.openById(c.dataset.id)}});
}
function start(){
 if(!mount()){setTimeout(start,300);return}
 document.addEventListener('ifh:smart-ranked',function(e){render(e.detail&&e.detail.items||[])});
 setTimeout(function(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)},1000);
 setInterval(function(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)},300000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHRenderReels=render;
})();