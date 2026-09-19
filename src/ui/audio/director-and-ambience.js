const MUSIC61_REASONS={normal:'Avance normal',respawn:'Vuelta al juego',death:'Impacto · pausa musical',boss:'Jefe', 'boss-cleared':'Jefe superado',sequence:'Encadenamiento excepcional',recovery:'Gran recuperación',relief:'Peligro superado',spikes:'Pinchos por delante',gap:'Precipicio por delante',press:'Prensa activa',gate:'Obstáculo en la ruta',wrapper:'Empaquetadora próxima',wrapped:'Atrapado en envoltorio',fall:'Caída peligrosa',stalled:'Sin avance ante un obstáculo',danger:'Peligro próximo',none:'Sin peligro'};
function music61Indicator(){
 let badge=$('gf61MusicIndicator');
 if(!profile.settings.musicIndicator||!['playing','dying'].includes(state)||HD.style==='classic'||HD.preview){if(badge)badge.style.display='none';return}
 if(!badge){badge=document.createElement('div');badge.id='gf61MusicIndicator';badge.setAttribute('aria-live','off');badge.style.cssText='position:fixed;right:18px;top:98px;max-width:225px;padding:8px 11px;border-radius:12px;background:#14132cdd;border:1px solid #ffffff22;color:#f4eee8;font:11px/1.5 system-ui;pointer-events:none;z-index:12';document.body.appendChild(badge)}
 badge.style.display='block';
 const flowRect=$('flowBox')?.getBoundingClientRect();badge.style.top=(Math.max(72,flowRect?.bottom||140)+8)+'px';
 const current=HD.current?.key,track=current==='tension'?'Claustrophobic':current==='epic'?'Epic':current==='menu'?'Menu interlude':'Everyday';
 badge.innerHTML='<strong>♫ '+track+'</strong> · '+I18N.text(MUSIC61_REASONS[HD.reason]||'Avance normal')+'<br>'+AMBIENT61.names[ef?.biome??levelIndex]+' · '+I18N.text('Riesgo')+' '+Math.round(HD.tension*100)+'%';
}
function music61Options(tab,redraw){
 if(tab!=='audio')return;const container=$('panel').querySelector('.gf5-option-card');if(!container)return;
 const block=document.createElement('div');block.className='gf61-audio-settings';
 block.innerHTML=`<div class="gf5-option-row"><div><b>Ambientes por mundo</b><small>Siete capas sutiles sobre la música HD. No cambian la melodía.</small></div><button class="setting" id="gf61WorldToggle" aria-pressed="${profile.settings.worldAmbience!==false}">${profile.settings.worldAmbience===false?'NO':'SÍ'}</button></div>
 <div class="gf5-option-row"><div><b>Volumen de ambiente</b><small>Independiente de música y efectos.</small></div><label><input type="range" id="gf61WorldVolume" aria-label="Volumen de ambiente" min="0" max="100" value="${Math.round((profile.settings.ambienceVolume??.45)*100)}"><output id="gf61WorldValue">${Math.round((profile.settings.ambienceVolume??.45)*100)}%</output></label></div>
 <div class="gf5-option-row"><div><b>Indicador musical</b><small>Muestra qué pista suena y qué la ha activado. Solo informativo.</small></div><button class="setting" id="gf61DirectorToggle" aria-pressed="${!!profile.settings.musicIndicator}">${profile.settings.musicIndicator?'SÍ':'NO'}</button></div>
 <p class="save-note">Everyday es la base. Claustrophobic anticipa peligros reales. Epic se reserva para jefes y ráfagas breves de encadenamientos.</p>`;
 container.appendChild(block);
 $('gf61WorldToggle').onclick=()=>{profile.settings.worldAmbience=profile.settings.worldAmbience===false;persist();redraw()};
 $('gf61WorldVolume').oninput=e=>{profile.settings.ambienceVolume=Number(e.target.value)/100;$('gf61WorldValue').textContent=e.target.value+'%';persist()};
 $('gf61DirectorToggle').onclick=()=>{profile.settings.musicIndicator=!profile.settings.musicIndicator;persist();redraw()};I18N.localize(block);
}
function music61MuseumHTML(){
 return `<section class="gf61-environments"><h3>AMBIENTES DE LOS SIETE MUNDOS</h3><p>Escucha el mismo fragmento de Everyday con distintos ambientes. Las capas siguen los pulsos y la armonía local del MP3.</p><div class="gf6-hd-grid">${AMBIENT61.names.map((name,i)=>`<article class="gf5-music-card ${HD.preview==='everyday'&&AMBIENT61.previewWorld===i?'playing':''}"><div class="gf5-mini">${String(i+1).padStart(2,'0')} · AMBIENTE</div><h3>${name}</h3><p>${AMBIENT61.descriptions[i]}</p><button class="secondary" data-hd-world="${i}">${HD.preview==='everyday'&&AMBIENT61.previewWorld===i?'SONANDO ♪':'ESCUCHAR'}</button></article>`).join('')}</div></section>`;
}
function music61BindMuseum(redraw){
 document.querySelectorAll('[data-hd-world]').forEach(el=>el.onclick=()=>{
  const was=HD.preview==='everyday';HD.museumStopped=false;HD.preview='everyday';chipPreview=null;AMBIENT61.previewWorld=Number(el.dataset.hdWorld);
  profile.settings.worldAmbience=true;soundEnabled=true;profile.settings.sound=true;profile.settings.musicOn=true;
  if(!was){hdHalt(false);HD.suspended=null}hdUnlock();persist();redraw();
 });
}

