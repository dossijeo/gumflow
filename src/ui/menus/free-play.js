 function uiFreePlay(){
   setWide(true);state='freeplay';
   showOverlay(`<div class="overline">FREE PLAY</div><h2>Escoge el <span>escenario.</span></h2><p class="intro">Capturas del escenario jugable, mejores tiempos y estrellas. Las partidas libres no sustituyen tu continuación de Historia.</p><div class="gf5-world-grid">${WORLDS.map((w,i)=>`<article class="gf5-world-card"><div class="gf5-thumb" style="${uiThumb(i)}"><div class="gf5-thumb-label"><div><span>0${i+1} / 07</span><b>${uiEsc(w.en)}</b><small>${uiEsc(w.name)}</small></div><small>${uiEsc(w.mechanic)}</small></div></div><h3>${uiEsc(w.name)}</h3><p>${uiEsc(w.subtitle)}</p><div class="gf5-record">${uiWorldRecord(i)}</div><div class="gf5-actions"><button class="primary" data-gf5-play="${i}">JUGAR</button><button class="secondary" data-gf5-boss="${i}">JEFE</button></div></article>`).join('')}</div><div class="gf5-backline"><button class="secondary" id="gf5FreeBack">← ATRÁS</button><button class="secondary" id="gf5AllBosses">LOS SIETE JEFES</button></div>`,false);
   document.querySelectorAll('[data-gf5-play]').forEach(el=>el.onclick=()=>{setWide(false);uiLaunchFree(Number(el.dataset.gf5Play))});
   document.querySelectorAll('[data-gf5-boss]').forEach(el=>el.onclick=()=>startBossTrial(Number(el.dataset.gf5Boss)));
   $('gf5AllBosses').onclick=bossSelect;
   $('gf5FreeBack').onclick=uiPlayHub;
 }
