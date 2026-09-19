function efEnd(reason='Carrera terminada'){
 if(!ef)return;ef.finished=true;ef.reason=reason;const fresh=efStoreRun(reason),s=efSnapshot();state='efresults';setWide(true);document.body.classList.remove('boss-active');$('hud').style.display='none';
 showOverlay(`<div class="overline">${s.relax?'RELAX / HAS LLEGADO HASTA AQUÍ':'SUPERVIVENCIA / '+reason.toUpperCase()}</div><h2>${s.relax?'FLOW <span>FOREVER.</span>':'FLOW <span>TERMINATED.</span>'}</h2><p class="intro">${reason==='Sin vidas'?efEsc(deathQuote):'La meta era decidir cuándo parar. Bastante filosófico para un chicle.'}</p><div class="ef-result-distance">${efDistance(s.distance)}<small>EL PUNTO MÁS LEJANO DE ESTA CARRERA</small></div><div class="ef-stats">${efStatCards(s)}</div>
 ${fresh.length?'<div class="ef-new-record">NUEVO RÉCORD · '+fresh.join(' · ')+'</div>':''}<p class="save-note">${s.deaths} vidas perdidas · ${s.modules} módulos recorridos · FLOW máximo ${Math.round(s.flow)}% · semilla <code>${efEsc(s.seed)}</code>${efStorageOK?' · Guardado local.':' · Guardado bloqueado por el visor.'}</p>
 <div class="buttons"><button class="primary" id="efAgain">NUEVA CARRERA ↗</button><button class="secondary" id="efSameSeed">REPETIR SEMILLA</button>${!s.relax&&reason==='Sin vidas'?'<button class="secondary" id="efContinueRelax">CONTINUAR EN RELAX ∞</button>':''}<button class="secondary" id="efResultRecords">RÉCORDS</button><button class="secondary" id="efResultMenu">MENÚ</button></div>`);
 $('efAgain').onclick=()=>startEndless(s.relax);$('efSameSeed').onclick=()=>startEndless(s.relax,s.seed);$('efResultRecords').onclick=()=>{efLeave();efRecords(s.relax?'relax':'normal')};$('efResultMenu').onclick=()=>efLobby(s.relax?'relax':'normal');
 if($('efContinueRelax'))$('efContinueRelax').onclick=()=>{ef.relax=true;ef.finished=false;ef.registered=false;ef.id+='-relax';ef.continued=true;run.lives=3;setWide(false);efRespawn();tip('La carrera de Supervivencia ya está guardada. A partir de aquí, estadísticas de Relax.',5)};
}
function efPause(){
 ef.idle=0;
 if(state==='paused'){state='playing';hideOverlay();audioStart();return}
 if(state!=='playing')return;state='paused';clearInput();setWide(true);
 showOverlay(`<div class="overline">ENDLESS FLOW / ${ef.relax?'RELAX ∞':'SUPERVIVENCIA · '+run.lives+' VIDAS'}</div><h2>El infinito<br><span>puede esperar.</span></h2><div class="ef-stats">${efStatCards(efSnapshot())}</div><p class="intro">${EF_BIOMES[ef.biome].name} · dificultad ${ef.difficulty}/10 · semilla <code>${efEsc(ef.seed)}</code>. El tiempo está detenido.</p><div class="buttons"><button class="primary" id="efResume">SEGUIR FLUYENDO →</button><button class="secondary" id="efPauseGuide">CONTROLES Y REGLAS</button><button class="secondary" id="efStop">TERMINAR Y GUARDAR ESTADÍSTICAS</button></div><p class="save-note">R durante la carrera vuelve al tramo seguro y consume una vida en Supervivencia. No existe una meta ni se reinicia el recorrido al morir. La campaña no se modifica.</p>`);
 $('efResume').onclick=pause;$('efPauseGuide').onclick=()=>efHelp(true);$('efStop').onclick=()=>efEnd('Retirada');
}

