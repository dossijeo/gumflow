// Original API wrapping, with all non-Endless paths forwarded unchanged.
menu=function(){if(ef){if(!ef.finished)efStoreRun('Salida al menú');state='efmenu';run=null;efLeave()}EF_ORIGINAL.menu();
 const card=document.createElement('button');card.id='endlessFlow';card.className='ef-menu-button';card.innerHTML='<span class="ef-menu-sign">∞</span><span><b>ENDLESS FLOW</b><small>48 variantes · biomas continuos · récords locales</small></span><strong>ARCADE →</strong>';
 $('panel').querySelector('.control-grid').before(card);card.onclick=()=>efLobby();const badge=$('panel').querySelector('.v2');if(badge)badge.textContent='4';const foot=$('panel').querySelector('.menu-footer');if(foot)foot.textContent='GUMFLOW / 4 · CAMPAÑA + ENDLESS FLOW · SIN CONEXIÓN';
};
startRun=function(...a){if(ef){if(!ef.finished)efStoreRun('Salida a campaña');efLeave()}EF_ORIGINAL.startRun(...a)};
startBossTrial=function(...a){if(ef){if(!ef.finished)efStoreRun('Salida a jefes');efLeave()}EF_ORIGINAL.startBossTrial(...a)};
continueSession=function(...a){if(ef){if(!ef.finished)efStoreRun('Salida a campaña');efLeave()}EF_ORIGINAL.continueSession(...a)};
saveSession=function(){if(ef)return;EF_ORIGINAL.saveSession()};
pause=function(){if(ef){efPause();return}EF_ORIGINAL.pause()};
loseLife=function(reason){if(ef){efLoseLife(reason);return}EF_ORIGINAL.loseLife(reason)};
respawn=function(){if(ef){efRespawn();return}EF_ORIGINAL.respawn()};
retryLevel=function(){if(ef){startEndless(ef.relax,ef.seed);return}EF_ORIGINAL.retryLevel()};
completeLevel=function(){if(ef)return;EF_ORIGINAL.completeLevel()};
update=function(dt,override){if(ef)efTick(dt,override);else EF_ORIGINAL.update(dt,override)};
award=function(id){if(ef)return;EF_ORIGINAL.award(id)};
applyFlavor=function(type){if(!ef){EF_ORIGINAL.applyFlavor(type);return}player.flavor=type;player.flavorTime=14;toast('SABOR '+FLAVORS[type].name+' · '+FLAVORS[type].desc);burst(player.x,player.y,20,FLAVORS[type].color,200);sound('life')};
afterSpecials=function(dt){EF_ORIGINAL.afterSpecials(dt);if(!ef)return;for(const s of level.stars)if(s.taken&&!s._efCounted){s._efCounted=true;ef.stars++;run.stars=ef.stars;toast('★ '+ef.stars+' ESTRELLAS · '+s.label)}};
wakeBoss=function(b){if(!ef){EF_ORIGINAL.wakeBoss(b);return}if(b.active||b.defeated)return;b.active=true;b.phase='intro';b.t=0;b.hazards=[];b.x=b.start+b.w*.54;b.y=290;ef.safeX=b.entry;ef.respawnX=b.entry;bannerTime=0;tip(b.def.intro,4.5);toast('MINIJEFE · '+b.def.name)};
damageBoss=function(b){
 if(!ef){EF_ORIGINAL.damageBoss(b);return}if(b.phase!=='open'||b.hurt>0||b.defeated)return;
 b.hp--;b.hitCount++;b.round++;b.hurt=.75;b.hazards=[];run.score+=750;flow=clamp(flow+23,0,100);burst(b.x,b.y+24,38,b.def.color,420);floatText(b.x,b.y-110,'¡CRACK! · '+b.hp,b.def.color);sound('bossHit');shake=reduced?0:6;
 player.vy=-510;player.grounded=false;player.platform=null;player.drop=false;player.inv=Math.max(player.inv,.9);player.squash=-.6;
 if(b.hp<=0){b.defeated=true;b.opening=false;b.phase='defeated';b.t=0;b.wonTime=levelTime;run.score+=2000;tip(b.def.outro,5);sound('win');efAfterBoss()}else {setBossPhase(b,'recover');tip('Control de calidad: '+b.hp+' impactos pendientes.',2)}
};
bossStep=function(dt){const b=level?.boss;if(ef&&b?.ef)EF_ORIGINAL.bossStep(dt*(1+Math.min(.18,(b.rank-1)*.025)));else EF_ORIGINAL.bossStep(dt)};
refreshHUD=function(){
 if(!ef){EF_ORIGINAL.refreshHUD();return}const a=profile.settings.assist;profile.settings.assist=ef.relax;EF_ORIGINAL.refreshHUD();profile.settings.assist=a;
 $('levelCounter').textContent=ef.relax?'∞ / RELAX':'∞ / SUPERVIVENCIA';$('levelName').textContent='ENDLESS FLOW · '+EF_BIOMES[ef.biome].name;$('clock').textContent=efDuration(ef.elapsed);
 $('score').parentElement.querySelector('.stat-label').textContent='distancia';$('score').textContent=efDistance(efGetDistance());$('starsHUD').innerHTML='★ '+ef.stars+'<small>'+ef.bosses+' MINIJEFES · NIVEL '+ef.difficulty+'/10</small>';
 $('chapterHUD').textContent='TRAMO '+String((ef.currentSection?.id||0)+1).padStart(3,'0')+' · '+(ef.currentSection?.name||'PREPARANDO LA FUGA').toUpperCase();
 $('progressFill').style.width=(efGetDistance()%EF_BIOME_METRES/EF_BIOME_METRES*100)+'%';
 $('progressFill').parentElement.title='Próximo bioma en '+efDistance(EF_BIOME_METRES-efGetDistance()%EF_BIOME_METRES);
};
drawFinish=function(){if(!ef)EF_ORIGINAL.drawFinish()};drawCheckpoints=function(){if(!ef)EF_ORIGINAL.drawCheckpoints()};
$('pause').onclick=()=>pause();
// Text entry must not be intercepted by the game's A/D/W/X shortcuts.
addEventListener('keydown',e=>{if(e.target instanceof HTMLInputElement&&e.target.type!=='range')e.stopPropagation()},true);
addEventListener('pagehide',()=>{if(ef)efStoreRun(ef.finished?ef.reason:'Archivo cerrado')});

// Continuously tiled layers with genuine alpha, plus seeded independent props.
// The six generated drawings are a kit, not a single background with an end.
