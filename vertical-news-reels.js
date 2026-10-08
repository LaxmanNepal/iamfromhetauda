/* I Am From Hetauda — News Feed 16.0 vertical 24H News Reels */
(function(){
'use strict';
if(window.__IFH_VERTICAL_REELS__)return;window.__IFH_VERTICAL_REELS__=true;
var $=function(s){return document.querySelector(s)},items=[],active=0,timer=null,paused=false,duration=6500,observer=null,lastFeed=null,refreshTimer=null,mode='for-you',touchStartY=0,touchStartX=0,touchMoved=false,lastTap=0,holdPaused=false,speakingId='',autoNarrate=false;

function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function age(n){var d=new Date(n.published||'');if(isNaN(d))return 999999;return Math.max(0,(Date.now()-d.getTime())/60000)}
function ago(n){var m=age(n);return m<60?Math.floor(m)+' मिनेट अघि':Math.floor(m/60)+' घण्टा अघि'}
function saved(id){try{return JSON.parse(localStorage.getItem('saved_news')||'[]').indexOf(id)>=0}catch(e){return false}}\nfunction seen(id){try{return JSON.parse(localStorage.getItem('ifh_reel_seen')||'[]').indexOf(id)>=0}catch(e){return false}}\nfunction markSeen(id){if(!id)return;try{var a=JSON.parse(localStorage.getItem('ifh_reel_seen')||'[]').filter(function(x){return x!==id});a.unshift(id);localStorage.setItem('ifh_reel_seen',JSON.stringify(a.slice(0,100)))}catch(e){}}\nfunction local(n){return !!(n&&((n.local===true)||/हेटौंडा|मकवानपुर|बागमती/.test(String(n.title||'')+' '+String(n.description||'')+' '+String(n.source||''))))}\nfunction getMode(){try{var m=localStorage.getItem('ifh_reels_mode');if(m==='latest'||m==='hetauda')return m}catch(e){}return 'for-you'}\nfunction setMode(m){mode=m;try{localStorage.setItem('ifh_reels_mode',m)}catch(e){}active=0;render(items);}\nfunction like(id){if(!id)return;try{var a=JSON.parse(localStorage.getItem('ifh_reel_likes')||'[]'),i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.unshift(id);localStorage.setItem('ifh_reel_likes',JSON.stringify(a.slice(0,300)))}catch(e){}}\nfunction toggleNarrate(){autoNarrate=!autoNarrate;try{localStorage.setItem('ifh_reels_narrate',autoNarrate?'1':'0')}catch(e){} if(!autoNarrate&&speechSupported())window.speechSynthesis.cancel(); updateNarrateButton(); if(autoNarrate&&items[active])speak(items[active])}\nfunction updateNarrateButton(){var b=$('#ifhR13Narrate');if(b){b.textContent=autoNarrate?'🔊 Auto':'🔇 Auto';b.setAttribute('aria-label',autoNarrate?'Auto narration बन्द गर्नुहोस्':'Auto narration चालु गर्नुहोस्')}}\nfunction liked(id){try{return JSON.parse(localStorage.getItem('ifh_reel_likes')||'[]').indexOf(id)>=0}catch(e){return false}}\nfunction speechSupported(){return 'speechSynthesis' in window&&'SpeechSynthesisUtterance' in window}\nfunction speak(n){if(!speechSupported()||!n)return;var s=window.speechSynthesis;if(speakingId===String(n.id)){s.cancel();speakingId='';updateListenButtons();return}s.cancel();var text=String(n.title||'')+'. '+String(n.description||'');var u=new SpeechSynthesisUtterance(text);u.lang='ne-NP';u.rate=.92;u.pitch=1;u.onend=u.onerror=function(){speakingId='';updateListenButtons()};speakingId=String(n.id);updateListenButtons();s.speak(u)}\nfunction updateListenButtons(){var feed=$('#ifhR13Feed');if(!feed)return;feed.querySelectorAll('[data-listen]').forEach(function(b){b.textContent=String(b.dataset.listen)===speakingId?'⏹ रोक्नुहोस्':'🔊 सुन्नुहोस्'})}
function toggleFullscreen(){var el=$('#ifhReels13');if(!el)return;if(document.fullscreenElement){document.exitFullscreen&&document.exitFullscreen();return}if(el.requestFullscreen)el.requestFullscreen().catch(function(){});else el.classList.toggle('ifhR13Immersive')}\nfunction mount(){
 if($('#ifhReels13'))return true;
 var host=$('#ifhReels')||$('#ifhDashboard')||$('.status');if(!host)return false;
 var el=document.createElement('section');el.id='ifhReels13';el.className='ifhReels13';
 mode=getMode(); el.innerHTML='<div class="ifhR13Head"><div><b>NEWS REELS • 24H</b><h2>🎬 समाचार Reels</h2><div class="ifhR13Modes"><button data-mode="for-you">तपाईंका लागि</button><button data-mode="latest">ताजा</button><button data-mode="hetauda">📍 हेटौंडा</button></div></div><div class="ifhR13Tools"><button id="ifhR13Full" aria-label="Full screen">⛶</button><button id="ifhR13Narrate" aria-label="Auto narration चालु गर्नुहोस्">🔇 Auto</button><button id="ifhR13Play" aria-label="Auto play रोक्नुहोस्">❚❚</button><button id="ifhR13Close" aria-label="Reels बन्द">×</button></div></div><div class="ifhR13Feed" id="ifhR13Feed"></div>';
 host.parentNode.insertBefore(el,host.nextSibling);
 $('#ifhR13Close').onclick=function(){el.classList.toggle('collapsed');localStorage.setItem('ifh_reels_collapsed',el.classList.contains('collapsed')?'1':'0');stopTimer()};
 try{autoNarrate=localStorage.getItem('ifh_reels_narrate')==='1'}catch(e){}\n $('#ifhR13Full').onclick=function(e){e.stopPropagation();toggleFullscreen()};\n $('#ifhR13Narrate').onclick=function(e){e.stopPropagation();toggleNarrate()};\n $('#ifhR13Play').onclick=function(){paused=!paused;updatePlay();if(paused)stopTimer();else startTimer()};\n el.querySelectorAll('[data-mode]').forEach(function(b){b.onclick=function(e){e.stopPropagation();setMode(b.dataset.mode)}});
 if(localStorage.getItem('ifh_reels_collapsed')==='1')el.classList.add('collapsed');
 injectCss();
 return true;
}
function injectCss(){
 if($('#ifh-r16-style'))return;
 var s=document.createElement('style');s.id='ifh-r16-style';s.textContent='.ifhR13Immersive{position:fixed!important;inset:0!important;z-index:99999!important;max-width:none!important}.ifhR13Immersive .ifhR13Feed{height:100vh!important}.ifhR13Heart{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.4);font-size:90px;color:#fff;opacity:0;z-index:8;pointer-events:none;text-shadow:0 4px 24px rgba(0,0,0,.35);transition:transform .35s ease,opacity .35s ease}.ifhR13Heart.show{transform:translate(-50%,-50%) scale(1.15);opacity:1}.ifhR13Modes{display:flex;gap:5px;margin-top:7px;overflow:auto;scrollbar-width:none}.ifhR13Modes button{border:1px solid rgba(255,255,255,.35);background:rgba(0,0,0,.3);color:#fff;border-radius:999px;padding:6px 10px;font-size:12px;white-space:nowrap;cursor:pointer}.ifhR13Modes button.active{background:#fff;color:#111}.ifhR13Tools{display:flex;gap:6px}.ifhR13Tools button{border:0;border-radius:999px;width:38px;height:38px;background:rgba(0,0,0,.42);color:#fff;font-size:15px;cursor:pointer}.ifhR13Card{position:relative;overflow:hidden}.ifhR13Progress i{display:block;width:0;height:100%;transition:none}.ifhR13Card.ifhR13Active .ifhR13Progress i{width:0}.ifhR13Card.ifhR13Seen .ifhR13Progress i{width:100%}.ifhR13Text{z-index:3}.ifhR13StoryBadges{display:flex;gap:6px;flex-wrap:wrap;margin:7px 0}.ifhR13StoryBadges i{font-style:normal;font-size:11px;font-weight:800;padding:4px 8px;border-radius:999px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.28);backdrop-filter:blur(8px)}.ifhR13Head{position:relative;z-index:5}';
 document.head.appendChild(s);
}
function ranked(a){\n var fresh=(Array.isArray(a)?a:[]).filter(function(n){var m=age(n);return m<=1440&&m>=-10});\n fresh.sort(function(a,b){var ra=Math.max(0,1440-age(a))/1440,rb=Math.max(0,1440-age(b))/1440;var sa=ra*20+Number(a.source_count||0)*9+Number(a.verified||0)*15+(seen(a.id)?-10:10);var sb=rb*20+Number(b.source_count||0)*9+Number(b.verified||0)*15+(seen(b.id)?-10:10);return sb-sa;});\n if(mode==='latest')fresh.sort(function(a,b){return age(a)-age(b)});\n if(mode==='hetauda')fresh.sort(function(a,b){return (local(b)?30:0)+(seen(b.id)?-10:0)-(local(a)?30:0)-(seen(a.id)?-10:0)||age(a)-age(b)});\n return fresh.slice(0,40);\n}
function render(a){
 items=ranked(a&&a.length?a:items);if(!mount())return;
 var feed=$('#ifhR13Feed');if(!feed)return;
 if(!items.length){feed.innerHTML='<div class="ifhR13Empty">पछिल्लो २४ घण्टामा समाचार छैन।</div>';stopTimer();return}
 active=Math.min(active,items.length-1);
 feed.innerHTML=items.map(function(n,i){
  var im=n.image_local||n.image||'';
  return '<article class="ifhR13Card '+(i===active?'ifhR13Active':'')+'" data-index="'+i+'" data-id="'+esc(n.id)+'"><div class="ifhR13Media">'+(im?'<img src="'+esc(im)+'" loading="'+(i<2?'eager':'lazy')+'" alt="">':'<div class="ifhR13NoImg">📰</div>')+'</div><div class="ifhR13Shade"></div><div class="ifhR13Progress"><i></i></div><div class="ifhR13Text"><div class="ifhR13Meta"><b>'+(n.source||'समाचार')+'</b><span>'+(n.verified?'✓ VERIFIED • ':'')+ago(n)+'</span></div><h3>'+esc(n.title)+'</h3><p>'+esc(n.description||'')+'</p><div class="ifhR13Actions"><button data-listen="'+esc(n.id)+'">🔊 सुन्नुहोस्</button><button data-open="'+esc(n.id)+'">पढ्नुहोस्</button><button data-save="'+esc(n.id)+'">'+(saved(n.id)?'♥ सेभ':'★ सेभ')+'</button><button data-share="'+esc(n.id)+'">↗ शेयर</button></div></div></article>'
 }).join('');
 bind(feed);observe(feed);setupSwipe(feed);syncActive(false);updateModes();updateNarrateButton();if(!paused)startTimer();
}
function updateModes(){var el=$('#ifhReels13');if(!el)return;el.querySelectorAll('[data-mode]').forEach(function(b){b.classList.toggle('active',b.dataset.mode===mode)})}\nfunction heart(card){var h=document.createElement('div');h.className='ifhR13Heart';h.textContent='♥';card.appendChild(h);setTimeout(function(){h.classList.add('show')},10);setTimeout(function(){h.remove()},700)}\nfunction bind(feed){\n feed.querySelectorAll('[data-listen]').forEach(function(b){b.onclick=function(e){e.stopPropagation();var n=items.find(function(x){return String(x.id)===String(b.dataset.listen)});speak(n)}});
 feed.querySelectorAll('[data-open]').forEach(function(b){b.onclick=function(e){e.stopPropagation();stopTimer();if(window.openById)window.openById(b.dataset.open)}});
 feed.querySelectorAll('[data-save]').forEach(function(b){b.onclick=function(e){e.stopPropagation();var id=b.dataset.save,a=[];try{a=JSON.parse(localStorage.getItem('saved_news')||'[]')}catch(_){}var x=a.indexOf(id);if(x>=0)a.splice(x,1);else a.unshift(id);localStorage.setItem('saved_news',JSON.stringify(a.slice(0,300)));b.textContent=x>=0?'★ सेभ':'♥ सेभ'}});
 feed.querySelectorAll('[data-share]').forEach(function(b){b.onclick=function(e){e.stopPropagation();var id=b.dataset.share,u=location.origin+location.pathname+'?news='+encodeURIComponent(id);if(navigator.share)navigator.share({title:'I Am From Hetauda',url:u}).catch(function(){});else if(navigator.clipboard)navigator.clipboard.writeText(u)}});
 feed.querySelectorAll('.ifhR13Card').forEach(function(card){card.onclick=function(){if(touchMoved){touchMoved=false;return}var now=Date.now();if(now-lastTap<320){like(card.dataset.id);heart(card);var b=card.querySelector('[data-save]');if(b)b.textContent=liked(card.dataset.id)?'♥ सेभ':'★ सेभ';lastTap=0;return}lastTap=now;stopTimer();if(window.openById)window.openById(card.dataset.id)}});
}
function observe(feed){
 lastFeed=feed;
 if(observer)observer.disconnect();
 if(!('IntersectionObserver' in window)){return}
 observer=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>.65){var i=Number(e.target.dataset.index);if(!isNaN(i)){if(active!==i){active=i;markSeen(items[i]&&items[i].id);if(autoNarrate&&items[i])speak(items[i])}syncActive(false);if(!paused)startTimer()}}})},{root:feed,threshold:[.65]});
 feed.querySelectorAll('.ifhR13Card').forEach(function(c){observer.observe(c)});
}
function setupSwipe(feed){
 var sy=0,st=0,holdTimer=0;
 feed.ontouchstart=function(e){touchStartY=e.touches[0].clientY;touchStartX=e.touches[0].clientX;touchMoved=false;st=Date.now();stopTimer();clearTimeout(holdTimer);holdTimer=setTimeout(function(){if(!touchMoved){holdPaused=true;paused=true;updatePlay()}},450)};\n feed.ontouchmove=function(e){var dy=e.touches[0].clientY-touchStartY,dx=e.touches[0].clientX-touchStartX;if(Math.abs(dy)>18||Math.abs(dx)>18){touchMoved=true;clearTimeout(holdTimer)}};\n feed.ontouchend=function(e){clearTimeout(holdTimer);var dy=e.changedTouches[0].clientY-touchStartY;if(Math.abs(dy)>55&&Date.now()-st<700){holdPaused=false;go(dy<0?1:-1)}else if(holdPaused){holdPaused=false;paused=false;updatePlay();startTimer()}else if(!paused)startTimer()};
}
function smartNext(delta){if(delta<0)return -1;if(!items.length)return 0;var cur=items[active],best=active+1,bs=-1;for(var i=1;i<items.length;i++){var idx=(active+i)%items.length,n=items[idx],s=0;if(!seen(n.id))s+=35;if(n.verified)s+=18;s+=Math.min(30,Number(n.source_count||0)*8);if(local(n)===local(cur))s+=5;s+=Math.max(0,18-age(n)/80);if(s>bs){bs=s;best=idx}}return best-active}\nfunction go(delta){
 if(!items.length)return;
 if(speakingId&&speechSupported()){window.speechSynthesis.cancel();speakingId='';}
 active=active+(delta>0?smartNext(delta):delta);
 if(active>=items.length)active=0;
 if(active<0)active=items.length-1;
 var feed=$('#ifhR13Feed'),cards=feed&&feed.querySelectorAll('.ifhR13Card');
 if(cards&&cards[active])cards[active].scrollIntoView({behavior:'smooth',block:'nearest'});markSeen(items[active]&&items[active].id);
 syncActive(true);if(autoNarrate&&items[active])speak(items[active]);if(!paused)startTimer();
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
function refreshPreserving(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)}\nfunction start(){
 if(!mount()){setTimeout(start,300);return}
 setupSwipe($('#ifhR13Feed'));
 document.addEventListener('ifh:smart-ranked',function(e){render(e.detail&&e.detail.items||[])});
 setTimeout(function(){if(window.IFHSmartRanked)render(window.IFHSmartRanked)},800);\n refreshTimer=setInterval(refreshPreserving,300000);
 document.addEventListener('visibilitychange',function(){if(document.hidden)stopTimer();else if(!paused)startTimer()});
 document.addEventListener('fullscreenchange',function(){var b=$('#ifhR13Full');if(b)b.textContent=document.fullscreenElement?'✕':'⛶'});\n window.addEventListener('keydown',function(e){if(e.key==='ArrowDown'&&document.activeElement===document.body)go(1);if(e.key==='ArrowUp'&&document.activeElement===document.body)go(-1);if(e.key===' '&&document.activeElement===document.body){e.preventDefault();paused=!paused;updatePlay();paused?stopTimer():startTimer()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHRenderVerticalReels=render;
})();
