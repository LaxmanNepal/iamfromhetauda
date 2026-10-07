/* I Am From Hetauda — News Feed 14.0 vertical 24H News Reels autoplay */
(function(){
'use strict';
if(window.__IFH_VERTICAL_REELS__)return;window.__IFH_VERTICAL_REELS__=true;
var $=function(s){return document.querySelector(s)},items=[],active=0,timer=null,paused=false,duration=6500,observer=null,lastFeed=null;

function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function age(n){var d=new Date(n.published||'');if(isNaN(d))return 999999;return Math.max(0,(Date.now()-d.getTime())/60000)}
function ago(n){var m=age(n);return m<60?Math.floor(m)+' मिनेट अघि':Math.floor(m/60)+' घण्टा अघि'}
function saved(id){try{return JSON.parse(localStorage.getItem('saved_news')||'[]').indexOf(id)>=0}catch(e){return false}}
function mount(){
 if($('#ifhReels13'))return true;
 var host=$('#ifhReels')||$('#ifhDashboard')||$('.status');if(!host)return false;
 var el=document.createElement('section');el.id='ifhReels13';el.className='ifhReels13';
 el.innerHTML='<div class="ifhR13Head"><div><b>NEWS REELS • 24H</b><h2>🎬 समाचार Reels</h2><span>तपाईंका लागि • पछिल्लो २४ घण्टा</span></div><div class="ifhR13Tools"><button id="ifhR13Play" aria-label="Auto play रोक्नुहोस्">❚❚</button><button id="ifhR13Close" aria-label="Reels बन्द">×</button></div></div><div class="ifhR13Feed" id="ifhR13Feed"></div>';
 host.parentNode.insertBefore(el,host.nextSibling);
 $('#ifhR13Close').onclick=function(){el.classList.toggle('collapsed');localStorage.setItem('ifh_reels_collapsed',el.classList.contains('collapsed')?'1':'0');stopTimer()};
 $('#ifhR13Play').onclick=function(){paused=!paused;updatePlay();if(paused)stopTimer();else startTimer()};
 if(localStorage.getItem('ifh_reels_collapsed')==='1')el.classList.add('collapsed');
 injectCss();
 return true;
}
function injectCss(){
 if($('#ifh-r14-style'))return;
 var s=document.createElement('style');s.id='ifh-r14-style';s.textContent='.ifhR13Tools{display:flex;gap:6px}.ifhR13Tools button{border:0;border-radius:999px;width:38px;height:38px;background:rgba(0,0,0,.42);color:#fff;font-size:15px;cursor:pointer}.ifhR13Card{position:relative;overflow:hidden}.ifhR13Progress i{display:block;width:0;height:100%;transition:none}.ifhR13Card.ifhR13Active .ifhR13Progress i{width:0}.ifhR13Card.ifhR13Seen .ifhR13Progress i{width:100%}.ifhR13Text{z-index:3}.ifhR13Head{position:relative;z-index:5}';
 document.head.appendChild(s);
}
function ranked(a){
 var fresh=(Array.isArray(a)?a:[]).filter(function(n){var m=age(n);return m<=1440&&m>=-10});
 fresh.sort(function(a,b){return Number(b.source_count||0)*9+Number(b.verified||0)*15+(age(a)-age(b))});
 return fresh.slice(0,40);
}
function render(a){
 items=ranked(a&&a.length?a:items);if(!mount())return;
 var feed=$('#ifhR13Feed');if(!feed)return;
 if(!items.length){feed.innerHTML='<div class="ifhR13Empty">पछिल्लो २४ घण्टामा समाचार छैन।</div>';stopTimer();return}
 active=Math.min(active,items.length-1);
 feed.innerHTML=items.map(function(n,i){
  var im=n.image_local||n.image||'';
  return '<article class="ifhR13Card '+(i===active?'ifhR13Active':'')+'" data-index="'+i+'" data-id="'+esc(n.id)+'"><div class="ifhR13Media">'+(im?'<img src="'+esc(im)+'" loading="'+(i<2?'eager':'lazy')+'" alt="">':'<div class="ifhR13NoImg">📰</div>')+'</div><div class="ifhR13Shade"></div><div class="ifhR13Progress"><i></i></div><div class="ifhR13Text"><div class="ifhR13Meta"><b>'+(n.source||'समाचार')+'</b><span>'+(n.verified?'✓ VERIFIED • ':'')+ago(n)+'</span></div><h3>'+esc(n.title)+'</h3><p>'+esc(n.description||'')+'</p><div class="ifhR13Actions"><button data-open="'+esc(n.id)+'">पढ्नुहोस्</button><button data-save="'+esc(n.id)+'">'+(saved(n.id)?'♥ सेभ':'★ सेभ')+'</button><button data-share="'+esc(n.id)+'">↗ शेयर</button></div></div></article>'
 }).join('');
 bind(feed);observe(feed);setupSwipe(feed);syncActive(false);if(!paused)startTimer();
}
function bind(feed){
 feed.querySelectorAll('[data-open]').forEach(function(b){b.onclick=function(e){e.stopPropagation();stopTimer();if(window.openById)window.openById(b.dataset.open)}});
 feed.querySelectorAll('[data-save]').forEach(function(b){b.onclick=function(e){e.stopPropagation();var id=b.dataset.save,a=[];try{a=JSON.parse(localStorage.getItem('saved_news')||'[]')}catch(_){}var x=a.indexOf(id);if(x>=0)a.splice(x,1);else a.unshift(id);localStorage.setItem('saved_news',JSON.stringify(a.slice(0,300)));b.textContent=x>=0?'★ सेभ':'♥ सेभ'}});
 feed.querySelectorAll('[data-share]').forEach(function(b){b.onclick=function(e){e.stopPropagation();var id=b.dataset.share,u=location.origin+location.pathname+'?news='+encodeURIComponent(id);if(navigator.share)navigator.share({title:'I Am From Hetauda',url:u}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(u)}});
 feed.querySelectorAll('.ifhR13Card').forEach(function(card){card.onclick=function(){stopTimer();if(window.openById)window.openById(card.dataset.id)}});
}
function observe(feed){
 lastFeed=feed;
 if(observer)observer.disconnect();
 if(!('IntersectionObserver' in window)){return}
 observer=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>.65){var i=Number(e.target.dataset.index);if(!isNaN(i)){active=i;syncActive(false);if(!paused)startTimer()}}})},{root:feed,threshold:[.65]});
 feed.querySelectorAll('.ifhR13Card').forEach(function(c){observer.observe(c)});
}
function setupSwipe(feed){
 var sy=0,st=0;
 feed.ontouchstart=function(e){sy=e.touches[0].clientY;st=Date.now();stopTimer()};
 feed.ontouchend=function(e){var dy=e.changedTouches[0].clientY-sy;if(Math.abs(dy)>55&&Date.now()-st<700){go(dy<0?1:-1)}else if(!paused)startTimer()};
}
function go(delta){
 if(!items.length)return;
 active=active+delta;
 if(active>=items.length)active=0;
 if(active<0)active=items.length-1;
 var feed=$('#ifhR13Feed'),cards=feed&&feed.querySelectorAll('.ifhR13Card');
 if(cards&&cards[active])cards[active].scrollIntoView({behavior:'smooth',block:'nearest'});
 syncActive(true);if(!paused)startTimer();
}
function syncActive(reset){
 var feed=$('#ifhR13Feed');if(!feed)return;
 var cards=feed.querySelectorAll('.ifhR13Card');
 cards.forEach(function(c,i){c.classList.toggle('ifhR13Active',i===active);if(i<active)c.classList.add('ifhR13Seen');else c.classList.remove('ifhR13Seen');var p=c.querySelector('.ifhR13Progress i');if(p&&i!==active){p.style.transition='none';p.style.width=i<active?'100%':'0'}});
 var p=cards[active]&&cards[active].querySelector('.ifhR13Progress i');
 if(p){p.style.transition='none';p.style.width=reset?'0':'0';void p.offsetWidth;p.style.transition='width '+duration+'ms linear';if(!paused)p.style.width='100%'}
 updatePlay();
}
function startTimer(){
 stopTimer();
 if(paused||!items.length)return;
 var el=$('#ifhReels13');if(el&&el.classList.contains('collapsed'))return;
 var feed=$('#ifhR13Feed'),card=feed&&feed.querySelector('.ifhR13Card[data-index="'+active+'"]');
 if(!card)return;
 var p=card.querySelector('.ifhR13Progress i');
 if(p){p.style.transition='none';p.style.width='0';void p.offsetWidth;p.style.transition='width '+duration+'ms linear';p.style.width='100%'}
 timer=setTimeout(function(){go(1)},duration);
}
function stopTimer(){if(timer){clearTimeout(timer);timer=null}}
function updatePlay(){var b=$('#ifhR13Play');if(b){b.textContent=paused?'▶':'❚❚';b.setAttribute('aria-label',paused?'Auto play सुरु गर्नुहोस्':'Auto play रोक्नुहोस्')}}
function start(){
 if(!mount()){setTimeout(start,300);return}
 setupSwipe($('#ifhR13Feed'));
 document.addEventListener('ifh:smart-ranked',function(e){render(e.detail&&e.detail.items||[])});
 setTimeout(function(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)},800);
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopTimer();else if(!paused)startTimer()});
 window.addEventListener('keydown',function(e){if(e.key==='ArrowDown'&&document.activeElement===document.body)go(1);if(e.key==='ArrowUp'&&document.activeElement===document.body)go(-1);if(e.key===' '&&document.activeElement===document.body){e.preventDefault();paused=!paused;updatePlay();paused?stopTimer():startTimer()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHRenderVerticalReels=render;
})();
