function hdMuseumHTML(){
 return `<div class="gf6-hd-heading"><h3>HD ADAPTATIVA</h3><p>Tres arreglos, un mismo universo musical. Audio de dossijeo_music. La portada usa un fragmento independiente.</p></div><div class="gf6-hd-grid">${[['everyday','Everyday','Avance normal'],['epic','Epic','Jefes y momentos excepcionales'],['tension','Claustrophobic','Peligro y atasco'],['menu','Menu interlude','Interludio de portada']].map(([k,name,desc])=>`<article class="gf5-music-card ${HD.preview===k?'playing':''}"><div class="gf5-mini">HD · ${HD_META[k].duration.toFixed(1)} s</div><h3>${name}</h3><p>${desc}</p><button class="primary" data-hd-preview="${k}">${HD.preview===k?'SONANDO ♪':'REPRODUCIR'}</button></article>`).join('')}</div>${music61MuseumHTML()}<h3 class="gf6-classic-heading">CHIPTUNE CLÁSICA</h3>`;
}
function hdBindMuseum(redraw){
 document.querySelectorAll('[data-hd-preview]').forEach(el=>el.onclick=()=>{HD.museumStopped=false;HD.preview=el.dataset.hdPreview;chipPreview=null;AMBIENT61.previewWorld=null;soundEnabled=true;profile.settings.sound=true;profile.settings.musicOn=true;hdHalt(false);hdUnlock();persist();redraw()});
 music61BindMuseum(redraw);
}
function hdOptionsUI(tab,redraw){
 music61Options(tab,redraw);
 if(tab==='game'){
  const container=$('panel').querySelector('.gf5-option-card');if(!container)return;
  const row=document.createElement('div');row.className='gf5-option-row';
  row.innerHTML=`<div><b>Idioma</b><small>Automático según el navegador. Cambia sin reiniciar la partida.</small></div><select id="gf6Language" aria-label="Idioma"><option value="auto">Automático</option><option value="es">Español</option><option value="en">English</option></select>`;
  container.prepend(row);$('gf6Language').value=I18N.preference;$('gf6Language').onchange=e=>{I18N.setLanguage(e.target.value);redraw()};
 }
 if(tab==='audio'){
  const container=$('panel').querySelector('.gf5-option-card');if(!container)return;
  const row=document.createElement('div');row.className='gf5-option-row';
  row.innerHTML=`<div><b>Estilo musical</b><small>HD: música continua según el estado del juego. Clásica: chiptune por mundo.</small></div><select id="gf6MusicStyle" aria-label="Estilo musical"><option value="adaptive">HD ADAPTATIVA</option><option value="classic">CHIPTUNE CLÁSICA</option></select>`;
  container.prepend(row);$('gf6MusicStyle').value=HD.style;$('gf6MusicStyle').onchange=e=>{hdSetStyle(e.target.value);redraw()};
  const note=document.createElement('p');note.className='save-note';note.textContent='La música HD usa frases editadas de Everyday, Epic y Claustrophobic. Los fundidos respetan sus tempos originales.';container.appendChild(note);
 }
}
