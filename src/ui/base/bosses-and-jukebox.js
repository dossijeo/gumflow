// V3 front door: direct boss practice and an offline sound booth; original game controls are unchanged.
const coreMenu=menu;
menu=function(){
 chipPreview=null;document.body.classList.remove('boss-active');coreMenu();
 const btns=document.createElement('div');btns.className='buttons v3-buttons';btns.innerHTML='<button class="secondary" id="tryBosses">LOS SIETE JEFES</button><button class="secondary" id="soundBooth">ESCUCHAR LA MÚSICA ♪</button>';
 const settings=$('panel').querySelector('.settings');settings.before(btns);
 $('tryBosses').onclick=bossSelect;$('soundBooth').onclick=soundBooth;
 const art=document.createElement('button');art.className='setting';art.textContent='FONDOS: '+(profile.settings.painted===false?'CLÁSICOS':'ILUSTRADOS');art.onclick=()=>{profile.settings.painted=profile.settings.painted===false;persist();menu()};settings.appendChild(art);
};
function soundBooth(){
 chipPreview=null;state='jukebox';document.body.classList.remove('boss-active');$('hud').style.display='none';setWide(true);
 showOverlay(`<div class="overline">Banda sonora sintetizada / sin conexión</div><h2>Ahora sí: <span>dale caña.</span></h2><p class="intro">Siete temas originales de 32 compases, con bajo, batería, acordes, melodía y arpegios. En partida añaden capas con el FLOW y aceleran en los jefes. Aquí puedes escucharlos completos.</p><div class="world-grid">${SCORE_TRACKS.map((t,i)=>`<button class="world-card" data-track="${i}" style="--wc:${WORLDS[i].color}"><span class="num">♪ ${t.bpm} BPM</span><strong>${t.title}</strong><small>${WORLDS[i].name}</small><div class="record">REPRODUCIR →</div></button>`).join('')}</div><div class="mixer"><label>MÚSICA <input id="musicGain" aria-label="Volumen de música" type="range" min="0" max="100" value="${Math.round((profile.settings.musicVolume??.7)*100)}"></label><label>EFECTOS <input id="fxGain" aria-label="Volumen de efectos" type="range" min="0" max="100" value="${Math.round((profile.settings.fxVolume??.72)*100)}"></label></div><div class="buttons"><button class="primary" id="boothBack">VOLVER AL JUEGO →</button><button class="secondary" id="boothStop">PARAR ■</button></div><p class="save-note">Síntesis Web Audio de estilo chiptune/MIDI. No contiene grabaciones ni melodías descargadas de terceros.</p>`);
 document.querySelectorAll('[data-track]').forEach(el=>el.onclick=()=>{
  soundEnabled=true;profile.settings.sound=true;chipPreview=Number(el.dataset.track);chipSong=-1;audioStart();persist();
  document.querySelectorAll('[data-track] .record').forEach(e=>e.textContent='REPRODUCIR →');el.querySelector('.record').textContent='SONANDO ♪';
 });
 $('musicGain').oninput=e=>{profile.settings.musicVolume=Number(e.target.value)/100;persist()};$('fxGain').oninput=e=>{profile.settings.fxVolume=Number(e.target.value)/100;persist()};
 $('boothBack').onclick=menu;$('boothStop').onclick=()=>{chipPreview=null;document.querySelectorAll('[data-track] .record').forEach(e=>e.textContent='REPRODUCIR →');pumpChip()};
}
const coreArchive=archive;
archive=function(from='menu'){
 coreArchive(from);
 const grid=document.createElement('div');grid.className='archive-grid';grid.innerHTML=BOSS_BOOK.map((b,i)=>`<article class="archive-card ${(profile.bosses||[]).includes(i)?'':'locked'}"><h3>JEFE 0${i+1} · ${b.def?.name||b.short}</h3><p>${(profile.bosses||[]).includes(i)?b.lore:'Derrota a este jefe para desbloquear su informe.'}</p></article>`).join('');
 $('panel').querySelector('.medals').after(grid);
};
