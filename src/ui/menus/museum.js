 function uiArchiveBlock(){
   return `<article class="gf5-option-card"><b>LA MÁQUINA EXPENDEDORA</b><p>Sigue apareciendo en sitios imposibles. Su departamento de logística es más competente que el nuestro.</p></article><div class="gf5-gallery-grid">${WORLDS.map((w,i)=>`<article class="gf5-card ${profile.lore.includes(i)?'':'gf5-ach-card locked'}"><div class="gf5-mini">Informe ${String(i+1).padStart(2,'0')}</div><h3>${uiEsc(w.lore)}</h3><p>${profile.lore.includes(i)?uiEsc(w.text):`DOCUMENTO NO ENCONTRADO · ${uiEsc(w.name)}`}</p></article>`).join('')}${BOSS_BOOK.map((b,i)=>`<article class="gf5-card ${((profile.bosses||[]).includes(i))?'':'gf5-ach-card locked'}"><div class="gf5-mini">Jefe ${String(i+1).padStart(2,'0')}</div><h3>${uiEsc(b.name||b.short)}</h3><p>${(profile.bosses||[]).includes(i)?uiEsc(b.lore):'Derrota a este jefe para desbloquear su ficha.'}</p></article>`).join('')}</div>`;
 }
 function uiMusicBlock(){
   return `${hdMuseumHTML()}<div class="gf5-music-grid">${SCORE_TRACKS.map((t,i)=>`<article class="gf5-music-card ${chipPreview===i?'playing':''}"><div class="gf5-mini">♪ ${t.bpm} BPM</div><h3>${uiEsc(t.title)}</h3><p>${uiEsc(WORLDS[i].name)} · ${uiEsc(WORLDS[i].mechanic)}</p><div class="gf5-actions"><button class="primary" data-gf5-track="${i}">${chipPreview===i?'SONANDO ♪':'REPRODUCIR'}</button></div></article>`).join('')}</div><div class="gf5-mixer"><label>MÚSICA <input id="gf5MusicGain" type="range" min="0" max="100" value="${Math.round((profile.settings.musicVolume??.7)*100)}"></label><label>EFECTOS <input id="gf5FxGain" type="range" min="0" max="100" value="${Math.round((profile.settings.fxVolume??.72)*100)}"></label></div><div class="gf5-footer-row"><p class="save-note">Temas chiptune/MIDI sintetizados dentro del propio HTML. En partida se adaptan al FLOW y a los jefes.</p><button class="secondary" id="gf5MusicStop">PARAR ■</button></div>`;
 }
 function uiGalleryBlock(){
   return `<div class="gf5-gallery-grid">${WORLDS.map((w,i)=>`<article class="gf5-gallery-card"><div class="gf5-thumb" style="background-image:url('${BG_SOURCES[i]}')"><div class="gf5-thumb-label"><div><span>Galería</span><b>${uiEsc(w.en)}</b><small>${uiEsc(w.name)}</small></div></div></div><h3>${uiEsc(w.name)}</h3><p>${uiEsc(w.subtitle)}</p><div class="gf5-actions"><button class="primary" data-gf5-gallery-play="${i}">VER ILUSTRACIÓN</button></div></article>`).join('')}</div>`;
 }
 function uiMuseum(tab='archive'){
   if(tab!=='music'){HD.museumStopped=false;HD.preview=null;chipPreview=null;pumpChip()}
   setWide(true);state='museum';
   const archiveTab=tab==='archive', musicTab=tab==='music', galleryTab=tab==='gallery';
   showOverlay(`<div class="overline">MUSEO</div><h2>Archivo, música <span>y galería.</span></h2><p class="intro">Todo el material opcional reunido en un único lugar: documentos, banda sonora y vistas ilustradas de los mundos.</p><div class="gf5-tabbar"><button class="setting ${archiveTab?'active':'ghost'}" id="gf5MuseumArchive">ARCHIVO</button><button class="setting ${musicTab?'active':'ghost'}" id="gf5MuseumMusic">MÚSICA</button><button class="setting ${galleryTab?'active':'ghost'}" id="gf5MuseumGallery">GALERÍA</button></div>${archiveTab?uiArchiveBlock():musicTab?uiMusicBlock():uiGalleryBlock()}<div class="gf5-backline"><button class="secondary" id="gf5MuseumBack">← VOLVER</button></div>`,false);
   $('gf5MuseumArchive').onclick=()=>uiMuseum('archive');
   $('gf5MuseumMusic').onclick=()=>uiMuseum('music');
   $('gf5MuseumGallery').onclick=()=>uiMuseum('gallery');
   $('gf5MuseumBack').onclick=uiInfoBack;
   document.querySelectorAll('[data-gf5-gallery-play]').forEach(el=>el.onclick=()=>uiArtwork(Number(el.dataset.gf5GalleryPlay)));
   document.querySelectorAll('[data-gf5-track]').forEach(el=>el.onclick=()=>{soundEnabled=true;profile.settings.sound=true;HD.museumStopped=false;HD.preview=null;profile.settings.musicOn=true;chipPreview=Number(el.dataset.gf5Track);chipSong=-1;audioStart();persist();uiMuseum('music')});
   if($('gf5MusicStop')) $('gf5MusicStop').onclick=()=>{HD.museumStopped=true;HD.preview=null;chipPreview=null;hdHalt(false);pumpChip();uiMuseum('music')};
   if($('gf5MusicGain')) $('gf5MusicGain').oninput=e=>{profile.settings.musicVolume=Number(e.target.value)/100;persist()};
   if($('gf5FxGain')) $('gf5FxGain').oninput=e=>{profile.settings.fxVolume=Number(e.target.value)/100;persist()};
   hdBindMuseum(()=>uiMuseum('music'));
 }
