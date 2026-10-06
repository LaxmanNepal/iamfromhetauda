/* I Am From Hetauda — News Feed 11.0 Instant Search */
(function(){
'use strict';
if(window.__IFH_INSTANT_SEARCH__)return;window.__IFH_INSTANT_SEARCH__=true;
var $=function(s){return document.querySelector(s)},input,box,timer=0,items=[];
function esc(s){return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function age(n){var d=new Date(n.published||'');if(isNaN(d))return '';var m=Math.max(0,(Date.now()-d.getTime())/60000);return m<60?Math.floor(m)+' मिनेट अघि':Math.floor(m/60)+' घण्टा अघि'}
function recent(){try{return JSON.parse(localStorage.getItem('ifh_recent_searches')||'[]')}catch(e){return[]}}
function saveRecent(q){if(!q)return;var a=recent().filter(function(x){return x!==q});a.unshift(q);try{localStorage.setItem('ifh_recent_searches',JSON.stringify(a.slice(0,6)))}catch(e){}}
function highlight(s,q){var text=esc(s);q.trim().split(/\s+/).filter(Boolean).slice(0,4).forEach(function(w){var safe=w.replace(/[.*+?^()|[\]\\]/g,'\\$&');try{text=text.replace(new RegExp('('+safe+')','gi'),'<mark>$1</mark>')}catch(e){}});return text}
function open(id,q){saveRecent(q);box.classList.remove('open');var n=items.find(function(x){return String(x.id)===String(id)});if(n&&window.openById)window.openById(n.id)}
function render(q){
 q=q.trim().toLowerCase();
 if(!q){var r=recent();box.innerHTML=r.length?'<small>🕘 पछिल्लो खोज</small>'+r.map(function(x){return '<button class="ifhSearchRecent" data-q="'+esc(x)+'">⌕ '+esc(x)+'</button>'}).join(''):'<small>समाचारको शीर्षक, स्रोत वा विषय खोज्नुहोस्</small>';box.classList.add('open');bindRecent();return}
 var words=q.split(/\s+/).filter(Boolean);
 var result=items.map(function(n){var hay=((n.title||'')+' '+(n.description||'')+' '+(n.source||'')+' '+(n.category||'')).toLowerCase();var hits=words.reduce(function(s,w){return s+(hay.indexOf(w)>=0?1:0)},0);return {n:n,h:hits}}).filter(function(x){return x.h>0}).sort(function(a,b){return b.h-a.h||new Date(b.n.published||0)-new Date(a.n.published||0)}).slice(0,8);
 box.innerHTML='<small>'+result.length+' वटा मिल्दो समाचार</small>'+(result.length?result.map(function(x){var n=x.n;return '<button class="ifhSearchResult" data-id="'+esc(n.id)+'"><span>'+(n.image_local||n.image?'<img src="'+esc(n.image_local||n.image)+'" alt="">':'<i>📰</i>')+'</span><b>'+highlight(n.title,q)+'</b><small>'+(n.source||'')+' • '+age(n)+'</small></button>'}).join(''):'<div class="ifhSearchNone">कुनै मिल्दो समाचार भेटिएन। अर्को शब्द प्रयास गर्नुहोस्।</div>');
 box.classList.add('open');box.querySelectorAll('[data-id]').forEach(function(b){b.onclick=function(){open(b.dataset.id,q)}});
}
function bindRecent(){box.querySelectorAll('[data-q]').forEach(function(b){b.onclick=function(){input.value=b.dataset.q;render(b.dataset.q)}})}
function mount(){
 input=$('#newsSearch');if(!input)return false;
 if($('#ifhInstantSearch'))return true;
 box=document.createElement('div');box.id='ifhInstantSearch';box.className='ifhInstantSearch';input.parentNode.appendChild(box);
 input.addEventListener('focus',function(){render(input.value)});
 input.addEventListener('input',function(){clearTimeout(timer);var q=input.value;timer=setTimeout(function(){render(q)},80)});
 document.addEventListener('click',function(e){if(!input.contains(e.target)&&!box.contains(e.target))box.classList.remove('open')});
 fetch('./data/news.json?search='+Date.now(),{cache:'no-store'}).then(function(r){return r.json()}).then(function(d){items=Array.isArray(d.items)?d.items:[]}).catch(function(){});
 return true;
}
function css(){if($('#ifh-search11-style'))return;var s=document.createElement('style');s.id='ifh-search11-style';s.textContent='.ifhInstantSearch{position:absolute;left:0;right:0;top:48px;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:0 20px 50px rgba(16,24,40,.16);display:none;overflow:hidden;z-index:200;max-height:min(70vh,520px);overflow-y:auto}.ifhInstantSearch.open{display:block}.ifhInstantSearch>small{display:block;padding:10px 13px 6px;color:var(--muted);font-size:9px;font-weight:800}.ifhSearchResult,.ifhSearchRecent{width:100%;border:0;border-bottom:1px solid var(--line);background:var(--card);color:var(--ink);display:grid;text-align:left;cursor:pointer}.ifhSearchResult{grid-template-columns:52px 1fr;gap:9px;padding:9px 11px}.ifhSearchResult>span{grid-row:span 2}.ifhSearchResult img,.ifhSearchResult i{width:52px;height:42px;object-fit:cover;border-radius:7px;background:var(--soft);display:flex;align-items:center;justify-content:center;font-style:normal}.ifhSearchResult b{font-size:11px;line-height:1.45}.ifhSearchResult small{font-size:8px;color:var(--muted)}.ifhSearchRecent{padding:11px 13px;font-size:11px}.ifhSearchResult:hover,.ifhSearchRecent:hover{background:var(--soft)}.ifhSearchNone{padding:25px 15px;text-align:center;color:var(--muted);font-size:11px}.ifhInstantSearch mark{background:#fef08a;color:#111827;border-radius:2px;padding:0 1px}@media(max-width:600px){.ifhInstantSearch{position:fixed;left:12px;right:12px;top:105px;max-height:65vh}.ifhSearchResult{padding:10px}.ifhSearchResult b{font-size:11px}}.uxDark .ifhInstantSearch,.uxDark .ifhSearchResult,.uxDark .ifhSearchRecent{background:#111827;color:#f8fafc}.uxDark .ifhInstantSearch mark{background:#854d0e;color:#fff}</style>';document.head.appendChild(s)}
function start(){if(!mount()){setTimeout(start,300);return}css()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();