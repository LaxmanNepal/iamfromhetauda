/* I Am From Hetauda — News Feed 10.0 Story Timeline */
(function(){
'use strict';
if(window.__IFH_STORY_TIMELINE__)return;window.__IFH_STORY_TIMELINE__=true;
var $=function(s){return document.querySelector(s)};
function age(n){var d=new Date(n.published||'');return isNaN(d)?999:Math.max(0,(Date.now()-d.getTime())/60000)}
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function render(n){
 var host=$('#ifhTimeline');if(!host)return;
 var g=n&&n.__story_group||[];
 if(g.length<2){host.style.display='none';return}
 g=g.slice().sort(function(a,b){return new Date(a.published||0)-new Date(b.published||0)}).slice(-8);
 host.style.display='block';
 var title=n.title||g[g.length-1].title;
 host.querySelector('.ifhTimelineTitle').textContent=title;
 host.querySelector('.ifhTimelineList').innerHTML=g.map(function(x,i){
  var last=i===g.length-1;
  return '<button class="ifhTimelineItem '+(last?'current':'')+'" data-timeline-id="'+esc(x.id)+'"><span class="ifhTimelineDot"></span><span><strong>'+(last?'अहिलेको अपडेट':'अपडेट '+(i+1))+'</strong><b>'+esc(x.title)+'</b><small>'+(x.source||'')+' • '+(age(x)<60?Math.floor(age(x))+' मिनेट अघि':age(x)<1440?Math.floor(age(x)/60)+' घण्टा अघि':Math.floor(age(x)/1440)+' दिन अघि')+'</small></span></button>'
 }).join('');
 host.querySelectorAll('[data-timeline-id]').forEach(function(b){b.onclick=function(){if(window.openById)window.openById(b.dataset.timelineId)}});
}
function mount(){
 if($('#ifhTimeline'))return true;
 var radar=$('#ifhNewsRadar')||$('.status');if(!radar)return false;
 var el=document.createElement('section');el.id='ifhTimeline';el.className='ifhTimeline';
 el.innerHTML='<div class="ifhTimelineHead"><span>STORY TIMELINE</span><h2>🕒 घटनाक्रम</h2><p class="ifhTimelineTitle"></p></div><div class="ifhTimelineList"></div>';
 radar.parentNode.insertBefore(el,radar.nextSibling);el.style.display='none';return true;
}
function start(){
 if(!mount()){setTimeout(start,300);return}
 document.addEventListener('ifh:smart-ranked',function(e){
  var a=e.detail&&e.detail.items||[],n=a.find(function(x){return x.__story_count>1});
  if(n)render(n);else $('#ifhTimeline').style.display='none';
 });
 setTimeout(function(){var a=window.IFHSmartRanked||[],n=a.find(function(x){return x.__story_count>1});if(n)render(n)},900);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();