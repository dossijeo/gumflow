 function uiOptions(tab='game'){
   setWide(true);state='options';
   const gameTab=tab==='game', gfxTab=tab==='graphics', audTab=tab==='audio', ctlTab=tab==='controls';
   const content = gameTab ? `
     <div class="gf5-option-card">
       <div class="gf5-option-row"><div><b>Vidas infinitas</b><small>Activa el modo relax por defecto en campaña y práctica. Endless Relax sigue eligiéndose por separado.</small></div><button class="setting" id="gf5ToggleLives">${profile.settings.assist?'SÍ · RELAX':'NO · CLÁSICO'}</button></div>
       <div class="gf5-option-row"><div><b>Consejos durante el nivel</b><small>El globo de ayuda permanece abajo, junto a los controles.</small></div><button class="setting" id="gf5ToggleTips">${profile.settings.tips===false?'NO':'SÍ'}</button></div><div class="gf5-option-row"><div><b>Sonido global</b><small>Activa o silencia música y efectos para toda la sesión actual.</small></div><button class="setting" id="gf5ToggleSound">${soundEnabled?'SÍ':'NO'}</button></div>
       <div class="gf5-option-row"><div><b>Guardar progreso</b><small>${storageOK?'Disponible en este navegador.':'Bloqueado por este visor; no se conservarán partidas ni récords.'}</small></div><button class="setting" disabled>${storageOK?'ACTIVO':'BLOQUEADO'}</button></div>
     </div>` : gfxTab ? `
     <div class="gf5-option-card">
       <div class="gf5-option-row"><div><b>Fondos de escenario</b><small>Ilustrados por defecto, o clásicos si prefieres algo más limpio y ligero.</small></div><button class="setting" id="gf5TogglePainted">${profile.settings.painted===false?'CLÁSICOS':'ILUSTRADOS'}</button></div>
       <p>Las miniaturas de Free Play son capturas reales del escenario montado. Esta opción cambia el fondo durante las partidas.</p>
     </div>` : audTab ? `
     <div class="gf5-option-card">
       <div class="gf5-option-row"><div><b>Música</b><small>Volumen de la banda sonora seleccionada.</small></div><button class="setting" id="gf5MusicEnabled">${profile.settings.musicOn===false?'NO':'SÍ'}</button><input id="gf5OptMusic" type="range" min="0" max="100" value="${Math.round((profile.settings.musicVolume??.7)*100)}"></div>
       <div class="gf5-option-row"><div><b>Efectos</b><small>Saltos, rebotes, impactos y avisos del juego.</small></div><button class="setting" id="gf5FxEnabled">${profile.settings.fxOn===false?'NO':'SÍ'}</button><input id="gf5OptFx" type="range" min="0" max="100" value="${Math.round((profile.settings.fxVolume??.72)*100)}"></div>
       <div class="gf5-option-row"><div><b>Audio global</b><small>Atajo rápido para activar o silenciar todo.</small></div><button class="setting" id="gf5ToggleSoundAudio">${soundEnabled?'SÍ':'NO'}</button></div>
     </div>` : `
     <div class="gf5-legend">
       <div class="gf5-control-line"><b>Moverse</b> · ← → o A / D</div>
       <div class="gf5-control-line"><b>Saltar</b> · ESPACIO / W / ↑</div>
       <div class="gf5-control-line"><b>Chicle</b> · X / SHIFT · cargar, rebotar, pegarse y catapultarse</div>
       <div class="gf5-control-line"><b>Pausa</b> · P / ESC</div>
       <div class="gf5-control-line"><b>Táctil</b> · botones en pantalla, mejor en horizontal</div>
     </div>`;
   showOverlay(`<div class="overline">OPCIONES</div><h2>Ajusta el <span>sabor.</span></h2><p class="intro">Elige cómo ver, escuchar y jugar tu próxima fuga.</p><div class="gf5-tabbar"><button class="setting ${gameTab?'active':'ghost'}" id="gf5OptGame">JUEGO</button><button class="setting ${gfxTab?'active':'ghost'}" id="gf5OptGraphics">GRÁFICOS</button><button class="setting ${audTab?'active':'ghost'}" id="gf5OptAudio">AUDIO</button><button class="setting ${ctlTab?'active':'ghost'}" id="gf5OptControls">CONTROLES</button></div>${content}<div class="gf5-backline"><button class="secondary" id="gf5OptionsBack">← VOLVER</button></div>`,false);
   $('gf5OptGame').onclick=()=>uiOptions('game');
   $('gf5OptGraphics').onclick=()=>uiOptions('graphics');
   $('gf5OptAudio').onclick=()=>uiOptions('audio');
   $('gf5OptControls').onclick=()=>uiOptions('controls');
   $('gf5OptionsBack').onclick=uiInfoBack;
   if($('gf5ToggleTips'))$('gf5ToggleTips').onclick=()=>{profile.settings.tips=profile.settings.tips===false;persist();uiOptions('game')};
   if($('gf5ToggleLives')) $('gf5ToggleLives').onclick=()=>{uiToggleAssist();uiOptions('game')};
   if($('gf5ToggleSound')) $('gf5ToggleSound').onclick=()=>{uiSetSound(!soundEnabled);uiOptions('game')};
   if($('gf5TogglePainted')) $('gf5TogglePainted').onclick=()=>{uiTogglePainted();uiOptions('graphics')};
   if($('gf5MusicEnabled'))$('gf5MusicEnabled').onclick=()=>{profile.settings.musicOn=profile.settings.musicOn===false;persist();uiOptions('audio')};
   if($('gf5FxEnabled'))$('gf5FxEnabled').onclick=()=>{profile.settings.fxOn=profile.settings.fxOn===false;persist();uiOptions('audio')};
   if($('gf5OptMusic')) $('gf5OptMusic').oninput=e=>{profile.settings.musicVolume=Number(e.target.value)/100;persist()};
   if($('gf5OptFx')) $('gf5OptFx').oninput=e=>{profile.settings.fxVolume=Number(e.target.value)/100;persist()};
   if($('gf5ToggleSoundAudio')) $('gf5ToggleSoundAudio').onclick=()=>{uiSetSound(!soundEnabled);uiOptions('audio')};
   hdOptionsUI(tab,()=>uiOptions(tab));
 }


