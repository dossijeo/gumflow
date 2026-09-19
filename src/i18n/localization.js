// A display-only localization layer: gameplay identifiers and saved progress remain unchanged.
const I18N=(()=>{
 const dict=I18N_EN, cache=new Map(), originals=new WeakMap(), attributes=new WeakMap();
 let preference='auto';try{preference=localStorage.getItem('gumflow-language')||'auto'}catch(_){}
 if(!['auto','es','en'].includes(preference))preference='auto';
 const browser=(navigator.languages?.[0]||navigator.language||'en').toLowerCase().startsWith('es')?'es':'en';
 let language=preference==='auto'?browser:preference;
 const pairs=new Map();for(const [k,v] of Object.entries(dict)){
  pairs.set(k,v);
  if(/[a-záéíóúñ]/i.test(k)){if(!pairs.has(k.toUpperCase()))pairs.set(k.toUpperCase(),v.toUpperCase());if(k.length<110&&!pairs.has(k.toLowerCase()))pairs.set(k.toLowerCase(),v.toLowerCase())}
 }
 const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const keys=[...pairs.keys()].filter(k=>k.length>1&&k.length<700&&k.trim()).sort((a,b)=>b.length-a.length);
 const re=new RegExp('(?<![A-Za-zÀ-ÿ])(?:'+keys.map(escape).join('|')+')(?![A-Za-zÀ-ÿ])','gu');
 function text(s){
  if(typeof s!=='string'||language==='es'||!s.trim())return s;
  if(cache.has(s))return cache.get(s);
  const raw=s.replace(/\s+/g,' ').trim();let result;
  if(pairs.has(raw)){result=s.replace(raw,pairs.get(raw));if(result===s&&raw!==s.trim())result=pairs.get(raw)}
  else result=s.replace(re,m=>pairs.get(m));
  if(cache.size>2400)cache.delete(cache.keys().next().value);cache.set(s,result);return result;
 }
 const skip=el=>!el||['SCRIPT','STYLE','CODE','NOSCRIPT','TEXTAREA'].includes(el.tagName)||el.closest?.('[data-no-translate]');
 function node(n){
  if(n.nodeType!==3||skip(n.parentElement))return;
  const value=n.nodeValue,prev=originals.get(n);const source=prev&&value===prev.out?prev.source:value;
  const out=text(source);originals.set(n,{source,out});if(value!==out)n.nodeValue=out;
 }
 function attrs(el){
  if(skip(el))return;
  const saved=attributes.get(el)||{};
  for(const key of ['title','aria-label','placeholder','alt'])if(el.hasAttribute(key)){
   const value=el.getAttribute(key),old=saved[key],source=old&&value===old.out?old.source:value,out=text(source);
   saved[key]={source,out};if(value!==out)el.setAttribute(key,out);
  }
  attributes.set(el,saved);
 }
 function localize(root=document.body){
  if(!root)return;if(root.nodeType===3){node(root);return}if(skip(root))return;
  if(root.nodeType===1)attrs(root);
  const walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n;
  while(n=walk.nextNode()){if(n.nodeType===3)node(n);else attrs(n)}
 }
 const observer=new MutationObserver(mutations=>{
  for(const m of mutations){if(m.type==='characterData')node(m.target);else if(m.type==='attributes')attrs(m.target);else for(const child of m.addedNodes)localize(child)}
 });
 observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','placeholder','alt']});
 function setLanguage(lang){
  preference=['auto','es','en'].includes(lang)?lang:'auto';language=preference==='auto'?browser:preference;cache.clear();
  try{localStorage.setItem('gumflow-language',preference)}catch(_){}
  document.documentElement.lang=language;document.title=text('GUMFLOW 6.1 — Historia · Free Play · Endless Flow');
  localize(document.body);if(level)render();
 }
 document.documentElement.lang=language;document.title=text('GUMFLOW 6.1 — Historia · Free Play · Endless Flow');
 const fill=ctx.fillText.bind(ctx),stroke=ctx.strokeText.bind(ctx),measure=ctx.measureText.bind(ctx);
 ctx.fillText=function(s,x,y,w){const v=text(String(s));if(w===undefined)fill(v,x,y);else fill(v,x,y,w)};
 ctx.strokeText=function(s,x,y,w){const v=text(String(s));if(w===undefined)stroke(v,x,y);else stroke(v,x,y,w)};
 ctx.measureText=s=>measure(text(String(s)));
 return {text,localize,setLanguage,get language(){return language},get preference(){return preference},get size(){return pairs.size}};
})();
window.__gumTest.language=lang=>{I18N.setLanguage(lang);return {language:I18N.language,preference:I18N.preference}};

window.__gumTest.translate=s=>I18N.text(s);

