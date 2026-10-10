/* I Am From Hetauda — Article Reader 4.0 */
(function(){
'use strict';
if(window.__IFH_READER4__)return;window.__IFH_READER4__=true;
var current='',items=[],font=Number(localStorage.getItem('ifh_reader_font')||100);
var $=function(s){return document.querySelector(s)};
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]})}
function saved(id){try{return JSON.parse(localStorage.getItem('saved_news')||'[]').indexOf(id)>=0}catch(e){return false}}
function later(id){try{return JSON.parse(localStorage.getItem('ifh_read_later')||'[]').indexOf(id)>=0}catch(e){return false}}
function load(){return fetch('./data/news.json?reader4='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){items=d.items||[];return items})}
function info(n){return window.IFHStoryInfo?window.IFHStoryInfo(n):{count:Number(n.source_count||1),sources:n.related_sources||[n.source],verified:!!n.verified}}
function ensureUI(){
 var body=$('.modalbox.reader .modalbody');if(!body||$('#reader4Tools'))return;
 var tools=document.createElement('div');tools.id='reader4Tools';tools.innerHTML='<div class="reader4bar"><div class="reader4Actions"><button data-r4="save">♡ <span>सेभ</span></button><button data-r4="later">🔖 <span>पछि</span></button><button data-r4="share">↗ <span>शेयर</span></button><button data-r4="original">↗ <span>मूल</span></button></div><div class="reader4font"><button data-font="-1" aria-label="अक्षर सानो">A−</button><button data-font="0" aria-label="अक्षर सामान्य">A</button><button data-font="1" aria-label="अक्षर ठूलो">A+</button></div></div><div class="reader4sources" id="reader4Sources"></div>';
 body.insertBefore(tools,body.firstChild);
 var rel=document.createElement('section');rel.id='reader4Related';rel.innerHTML='<div class="reader4RelHead"><strong>सम्बन्धित समाचार</strong><span>अर्को पढ्नुहोस्</span></div><div class="reader4RelGrid"></div>';body.appendChild(rel);
 tools.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.r4==='later'){if(window.IFHToggleReadLater)window.IFHToggleReadLater(current);updateLater()}else if(b.dataset.r4==='save'){var sb=$('#saveBtn');if(sb)sb.click();updateSave()}else if(b.dataset.r4==='share'){var sh=$('[onclick="shareById(\\''+current+'\\')"]');if(window.shareById)window.shareById(current);else if(window.navigator.share){navigator.share({title:($('#mt')||{}).textContent,url:location.href}).catch(function(){})}}else if(b.dataset.r4==='original'){var ml=$('#ml');if(ml&&ml.dataset.link)window.open(ml.dataset.link,'_blank','noopener')}else if(b.dataset.font){changeFont(Number(b.dataset.font))}});
}
function updateSave(){var b=$('[data-r4="save"]'),s=saved(current);if(b)b.innerHTML=(s?'♥':'♡')+' <span>सेभ</span>'}
function updateLater(){var b=$('[data-r4="later"]');if(b)b.innerHTML=(later(current)?'✓':'🔖')+' <span>'+(later(current)?'पढ्न बाँकीमा छ':'पछि पढ्नुहोस्')+'</span>'}
function changeFont(delta){if(delta===0)font=100;else font=Math.max(85,Math.min(125,font+delta*10));localStorage.setItem('ifh_reader_font',font);applyFont()}
function applyFont(){var d=$('.modalbox.reader .description');if(d)d.style.fontSize=(15*font/100)+'px'}
function related(n){
 var cat=n.category||'',id=n.id,group=n.__story_group;
 return items.filter(function(x){if(x.id===id)return false;var same=cat&&x.category===cat;var sameGroup=group&&x.__story_group===group;return same&&!sameGroup}).sort(function(a,b){return Number(b.score||0)-Number(a.score||0)}).slice(0,3)
}
function renderRelated(n){
 var box=$('#reader4Related .reader4RelGrid');if(!box)return;
 box.innerHTML=related(n).map(function(x){return '<button class="reader4RelCard" data-r4-id="'+esc(x.id)+'">'+(x.image_local||x.image?'<img loading="lazy" src="'+esc(x.image_local||x.image)+'" alt="">':'<div class="reader4NoImg">📰</div>')+'<div><strong>'+esc(x.title)+'</strong><small>'+esc(x.source||'')+' • '+(x.source_count>1?'✓ '+x.source_count+' स्रोत':'ताजा')+'</small></div></button>'}).join('');
 box.querySelectorAll('[data-r4-id]').forEach(function(b){b.onclick=function(){open(b.dataset.r4Id)}});
}
function renderSources(n){
 var box=$('#reader4Sources'),i=info(n);if(!box)return;
 var sources=(i.sources||[]).filter(Boolean);box.innerHTML='<div><b>'+(i.verified?'✓ बहु-स्रोत verified':'स्रोत')+'</b>'+(sources.length?' <span>'+sources.map(function(s){return '<em>'+esc(s)+'</em>'}).join('')+'</span>':'')+'</div>';
}
function open(id){
 var n=items.find(function(x){return String(x.id)===String(id)});if(!n)return;
 current=n.id;ensureUI();renderSources(n);renderRelated(n);updateLater();updateSave();
 if(window.openById)window.openById(n.id);
 setTimeout(function(){var r=$('.modalbox.reader');if(r){r.scrollTop=0;updateProgress();applyFont()}},40);
}
function updateProgress(){
 var r=$('.modalbox.reader'),bar=$('#readerProgressBar');if(!r||!bar)return;
 var max=r.scrollHeight-r.clientHeight;bar.style.width=(max>0?Math.min(100,Math.max(0,r.scrollTop/max*100)):100)+'%';
 if(current&&window.IFHSetReadProgress)window.IFHSetReadProgress(current,max>0?(r.scrollTop/max*100):100);
}
function bind(){
 ensureUI();
 var m=$('#modal'),r=$('.modalbox.reader');if(!m||!r)return;
 if(!m.dataset.r4bound){m.dataset.r4bound='1';m.addEventListener('click',function(e){var b=e.target.closest('[data-r4-id]');if(b){e.preventDefault();open(b.dataset.r4Id)}});r.addEventListener('scroll',updateProgress,{passive:true})}
}
function observe(){
 bind();
 var m=$('#modal');if(!m)return;
 new MutationObserver(function(){if(m.classList.contains('open')){bind();var title=$('#mt');var n=items.find(function(x){return x.title===title.textContent});if(n){current=n.id;renderSources(n);renderRelated(n);updateLater();updateSave();applyFont();setTimeout(updateProgress,30)}}}).observe(m,{attributes:true,attributeFilter:['class']});
}
function css(){if($('#reader4css'))return;var s=document.createElement('style');s.id='reader4css';s.textContent='.reader4bar{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:0 0 14px;border-bottom:1px solid var(--line);margin-bottom:14px}.reader4Actions{min-width:0;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;-webkit-overflow-scrolling:touch}.reader4Actions::-webkit-scrollbar{display:none}.reader4bar button{min-height:42px;touch-action:manipulation}.reader4RelCard{touch-action:manipulation;-webkit-tap-highlight-color:transparent}.reader4RelGrid{overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}.reader4bar button{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:10px;padding:8px 11px;font-size:11px;font-weight:850;cursor:pointer}.reader4Actions{display:flex;gap:5px}.reader4Actions button{white-space:nowrap}.reader4font{display:flex;gap:5px}.reader4sources{margin-bottom:15px;padding:11px 12px;border-radius:12px;background:var(--soft);font-size:11px;line-height:1.7}.reader4sources b{margin-right:7px}.reader4sources em{font-style:normal;display:inline-block;margin:2px 4px 2px 0;padding:2px 7px;border:1px solid var(--line);border-radius:99px;background:var(--card);font-size:9px}.reader4RelHead{display:flex;justify-content:space-between;align-items:center;margin-top:28px;padding-top:17px;border-top:1px solid var(--line)}.reader4RelHead span{font-size:9px;color:var(--muted)}.reader4RelGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:10px}.reader4RelCard{padding:0;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card);color:var(--ink);text-align:left;cursor:pointer}.reader4RelCard img,.reader4NoImg{display:block;width:100%;height:90px;object-fit:cover;background:var(--soft)}.reader4NoImg{display:flex;align-items:center;justify-content:center;font-size:26px}.reader4RelCard div:last-child{padding:8px}.reader4RelCard strong{display:block;font-size:11px;line-height:1.45}.reader4RelCard small{display:block;font-size:8px;color:var(--muted);margin-top:5px}@media(max-width:600px){.modal.open{padding:0;align-items:stretch}.modalbox.reader{width:100%;height:100dvh;height:100vh;max-height:none;border-radius:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding-bottom:env(safe-area-inset-bottom)}.readerTop{position:sticky;top:0;padding-top:max(8px,env(safe-area-inset-top));min-height:58px}.readerProgress{position:sticky;top:58px;z-index:4}.modalimg{max-height:34vh;min-height:120px;object-fit:cover}.modalbody{padding:16px 15px calc(24px + env(safe-area-inset-bottom))}.reader4bar{position:sticky;bottom:0;z-index:5;margin:0 -15px;padding:9px 12px calc(9px + env(safe-area-inset-bottom));border-top:1px solid var(--line);border-bottom:0;background:rgba(255,255,255,.97);backdrop-filter:blur(15px);gap:8px;flex-wrap:wrap}.reader4Actions{flex:1 1 100%;order:1;display:flex;gap:6px}.reader4Actions button{flex:0 0 auto;padding:9px 11px}.reader4font{order:2;width:100%;justify-content:flex-end}.reader4RelGrid{.uxDark .reader4bar{background:rgba(17,24,39,.96)}.reader4RelGrid{display:flex;overflow:auto;gap:9px;scrollbar-width:none}.reader4RelCard{min-width:225px}.reader4RelCard img,.reader4NoImg{height:105px}}.uxDark .reader4sources{background:#182235}.uxDark .reader4sources em{background:#111827}';document.head.appendChild(s)}
function start(){css();load().then(function(){observe()}).catch(function(){observe()});window.addEventListener('keydown',function(e){if(!$('#modal')||!$('#modal').classList.contains('open'))return;if(e.key==='ArrowLeft'&&window.prevNews)window.prevNews();if(e.key==='ArrowRight'&&window.nextNews)window.nextNews()});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHReader4Open=open;window.IFHReader4Refresh=function(){load().then(function(){var n=items.find(function(x){return x.id===current});if(n){renderRelated(n);renderSources(n)}})};
})();