/* I Am From Hetauda — duplicate story intelligence + source comparison */
(function(){
'use strict';
if(window.__IFH_STORY_INTEL__)return;window.__IFH_STORY_INTEL__=true;
function norm(s){return String(s||'').toLowerCase().replace(/[\u0964\u0965.,!?;:'"“”‘’()\[\]{}|/\\_-]+/g,' ').replace(/\b(का|को|की|ले|मा|बाट|लाई|गरेको|गरे|भयो|भएका|भएको|the|a|an|of|to|in|on|for|and|is|was)\b/g,' ').replace(/\s+/g,' ').trim()}
function tokens(s){return norm(s).split(' ').filter(function(x){return x.length>1}).slice(0,14)}
function similarity(a,b){var A=tokens(a),B=tokens(b);if(!A.length||!B.length)return 0;var m=0;A.forEach(function(x){if(B.indexOf(x)>=0)m++});return m/Math.max(1,Math.min(A.length,B.length))}
function key(n){return tokens(n.title).slice(0,5).join(' ')}
function group(items){var groups=[];items.forEach(function(n){var g=null;for(var i=0;i<groups.length;i++){if(similarity(n.title,groups[i][0].title)>=.72){g=groups[i];break}}if(g)g.push(n);else groups.push([n])});return groups}
function strongest(g){return g.slice().sort(function(a,b){return (Number(b.score||0)+Number(b.source_count||0)*8+(b.image_local||b.image?3:0))-(Number(a.score||0)+Number(a.source_count||0)*8+(a.image_local||a.image?3:0))})[0]}
window.IFHStoryGroups=function(items){return group(items).map(function(g){var n=strongest(g),sources=[];g.forEach(function(x){(x.related_sources||[x.source]).forEach(function(s){if(s&&sources.indexOf(s)<0)sources.push(s)})});n.__story_group=g;n.__story_sources=sources;n.__story_count=g.length;return n})}
window.IFHStoryInfo=function(n){var g=n&&n.__story_group||[n],sources=[];(g||[]).forEach(function(x){(x.related_sources||[x.source]).forEach(function(s){if(s&&sources.indexOf(s)<0)sources.push(s)})});return {count:g.length,sources:sources,verified:!!(n&&n.verified)||sources.length>1}}
})();
