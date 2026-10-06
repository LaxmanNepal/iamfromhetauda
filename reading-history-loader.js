/* Loader for reading-history.js; kept separate so the main runtime stays stable. */
(function(){
'use strict';
if(window.__IFH_READING_LOADER__)return;window.__IFH_READING_LOADER__=true;
function load(){if(document.querySelector('script[data-ifh-reading]'))return;var s=document.createElement('script');s.src='./reading-history.js?v=1';s.defer=true;s.dataset.ifhReading='1';document.head.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
