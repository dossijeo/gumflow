/* GUMFLOW 5.1 — menu layer installed in the game scope BEFORE bootstrap. */
;(function(){
 if(document.getElementById('gumflow-ui-v5')) return;
 const style=document.createElement('style');
 style.id='gumflow-ui-v5';
 style.textContent=`/* @include "src/styles/menu-base.css" */`;
 document.head.appendChild(style);

