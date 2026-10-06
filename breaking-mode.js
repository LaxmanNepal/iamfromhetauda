/* I Am From Hetauda — News Feed 7.0 Breaking News Mode */
(function(){
'use strict';
if(window.__IFH_BREAKING_MODE__)return;window.__IFH_BREAKING_MODE__=true;
var $=function(s){return document.querySelector(s)},timer=0,lastIds='';
function age(n){var d=new Date(n.published||'');return isNaN(d)?999:Math.max(0,(Date.now()-d.getTime())/60000)}
function level(n){
 var t=String(n.title||'').toLowerCase(),a=age(n),sources=Number(n.source_count||0);
 if(/भूकम्प|earthquake|बाढी|flood|पहिरो|landslide|आगलागी|fire|दुर्घटना|accident|मृत्यु|death|आपतकाल|emergency/.test(t))return 'ALERT';
 if(/breaking|ब्रेकिङ|तत्काल|अत्यावश्यक|निर्वाचन|सरकार|प्रधानमन्त्री|राष्ट्रपति/.test(t)||sources>=3)return 'BREAKING';
 if(a<=90||sources>=2)return 'UPDATE';
 return 'NEWS';
}
function mount(){
 if($('#ifhBreakingMode'))return true;
 var b=$('.breaking');if(!b)return false;
 var el=document.createElement('section');el.id='ifhBreakingMode';el.className='ifhBreakWrap';
 el.innerHTML='<div class="ifhBreakHead"><div><span class="ifhBreakKicker">LIVE NEWS PRIORITY</span><h2>अहिलेको महत्वपूर्ण अपडेट</h2><p id="ifhBreakSub">ताजा र महत्वपूर्ण समाचार स्वचालित रूपमा प्राथमिकतामा</p></div><button id="ifhBreakRefresh">↻ अपडेट</button></div><div id="ifhBreakList"></div>';
 b.parentNode.insertBefore(el,b.nextSibling);
 $('#ifhBreakRefresh').onclick=function(){if(window.IFHloadNews)window.IFHloadNews()};
 return true;
}
function render(items){
 if(!mount())return;
 var arr=(items||[]).filter(function(n){return level(n)!=='NEWS'}).slice(0,4);
 var list=$('#ifhBreakList');if(!list)return;
 if(!arr.length){$('#ifhBreakingMode').style.display='none';return}
 $('#ifhBreakingMode').style.display='block';
 var key=arr.map(function(n){return n.id}).join('|');if(key===lastIds)return;lastIds=key;
 list.innerHTML=arr.map(function(n){
   var lv=level(n),cls=lv.toLowerCase();
   return '<button class="ifhBreakItem '+cls+'" data-break-id="'+String(n.id||'').replace(/"/g,'&quot;')+'"><span class="ifhBreakLevel">'+lv+'</span><span class="ifhBreakTitle">'+String(n.title||'').replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c]})+'</span><span class="ifhBreakTime">'+(age(n)<1?'अहिले':Math.floor(age(n))+' मिनेट अघि')+'</span></button>'
 }).join('');
 Array.prototype.forEach.call(list.querySelectorAll('[data-break-id]'),function(x){x.onclick=function(){if(window.openById)window.openById(x.dataset.breakId)}});
}
function listen(){
 document.addEventListener('ifh:smart-ranked',function(e){render(e.detail&&e.detail.items||[])});
 document.addEventListener('ifh:new-stories',function(){if(window.IFHloadNews)window.IFHloadNews()});
}
function start(){if(!mount()){timer=setTimeout(start,400)}listen()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
window.IFHRenderBreakingMode=render;
})();