function startBossTrial(index){
 clearInput();bossOnly=true;chipPreview=null;run={lives:3,sugar:0,score:0,totalSugar:0,totalDeaths:0,totalTime:0,results:[],practice:true,stars:0};
 loadLevel(index);checkpoint=level.checkpoints.length;level.checkpoints.forEach(c=>c.active=true);resetPlayer(level.boss.entry+50,2.5);initPlayerExtras();
 camX=player.x-worldW*.32;camY=player.y-worldH*.61;state='playing';setWide(false);hideOverlay();audioStart();bannerTime=0;
 tip('PRÁCTICA DE JEFE · No modifica tu campaña. El checkpoint está aquí mismo.',4.5);
}
function bossTrialResult(){
 state='bossclear';const b=level.boss;showOverlay(`<div class="overline">Práctica completada / campaña intacta</div><h2>Control de calidad:<br><span>superado.</span></h2><p class="intro">${b.def.outro}</p><div class="result-grid"><div class="result-card"><div class="value">${formatTime(levelTime)}</div><div class="label">Tiempo</div></div><div class="result-card"><div class="value">${levelDeaths}</div><div class="label">Vidas perdidas</div></div><div class="result-card"><div class="value">${run.score}</div><div class="label">Puntos</div></div></div><p class="intro">${b.def.lore}</p><div class="buttons"><button class="primary" id="trialNext">SIGUIENTE JEFE →</button><button class="secondary" id="trialRetry">REPETIR</button><button class="secondary" id="trialBack">LOS SIETE JEFES</button></div>`);
 $('trialNext').onclick=()=>startBossTrial((levelIndex+1)%7);$('trialRetry').onclick=()=>startBossTrial(levelIndex);$('trialBack').onclick=bossSelect;
}
function bossSelect(){
 if(!bossOnly&&state==='playing')saveSession();bossOnly=false;state='bossselect';chipPreview=null;$('hud').style.display='none';setWide(true);
 showOverlay(`<div class="overline">Prueba lo nuevo sin recorrer de nuevo cada fase</div><h2>El problema tiene <span>nombre.</span></h2><p class="intro">Siete jefes. Tres vidas. Checkpoint al entrar. Salta al núcleo cuando se ponga verde; las gelatinas laterales se activan con SALTO o CHICLE. Esta práctica no altera tu campaña.</p><div class="world-grid">${BOSS_BOOK.map((b,i)=>`<button class="world-card" data-boss="${i}" style="--wc:${b.color}"><span class="num">0${i+1} / ${i===6?'4':'3'} IMPACTOS</span><strong>${b.name}</strong><small>${WORLDS[i].name}</small><div class="record">${b.warning}</div></button>`).join('')}</div><div class="buttons"><button class="secondary" id="bossBack">VOLVER</button><button class="setting" id="bossRelax">VIDAS: ${profile.settings.assist?'RELAX · INFINITAS':'CLÁSICO · 3'}</button></div>`);
 document.querySelectorAll('[data-boss]').forEach(el=>el.onclick=()=>startBossTrial(Number(el.dataset.boss)));$('bossBack').onclick=menu;$('bossRelax').onclick=()=>{profile.settings.assist=!profile.settings.assist;persist();bossSelect()};
}

const coreRetryLevel=retryLevel;retryLevel=function(){if(bossOnly){startBossTrial(levelIndex);return}coreRetryLevel()};

