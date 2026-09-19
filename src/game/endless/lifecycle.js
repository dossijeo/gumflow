function efTrapPhase(t){return ((levelTime+t.phase)%t.period+t.period)%t.period}
function efTrapsStep(){if(player.mode!=='normal')return;for(const t of level.efTraps){const phase=efTrapPhase(t),live=phase>1.64&&phase<2.08;if(live&&Math.abs(player.x-t.x)<t.w/2+R*.5&&player.y>groundAt(level,t.x).y-189){loseLife('press');return}}}
function efGiveSugar(amount){run.sugar+=amount;run.totalSugar+=amount;levelCollected+=amount;while(run.sugar>=60){run.sugar-=60;if(run.lives<5){run.lives++;sound('life')}else run.score+=500}}
function efAfterBoss(){const b=level.boss;if(!b?.ef||!b.defeated||b.rewarded)return;b.rewarded=true;ef.bosses++;ef.stars++;run.stars=ef.stars;if(!ef.relax)run.lives=Math.min(5,run.lives+1);efGiveSugar(20);ef.safeX=b.end+200;toast('MINIJEFE VENCIDO · ★ + 20 DULCES'+(ef.relax?'':' + VIDA'));tip('Control de calidad superado. El infinito continúa por la derecha.',5);efStoreRun('En curso')}
function efTick(dt,override){
 if(!ef||!['playing','dying'].includes(state)){EF_ORIGINAL.update(dt,override);return}
 if(state==='playing'){
  efGenerateAhead();efSelectSection();
  if(player.x<ef.floor){player.x=ef.floor+10;player.vx=Math.max(0,player.vx);player.speed=Math.max(0,player.speed)}
 }
 const oldTime=levelTime;EF_ORIGINAL.update(dt,override);
 if(!ef||state!=='playing')return;
 const p=player,active=(Math.abs(p.vx)>70||Math.abs(p.vy)>70||Object.values(input).some(Boolean));
 if(active){ef.elapsed+=levelTime-oldTime;ef.idle=0}else ef.idle+=dt;
 ef.maxGlobal=Math.max(ef.maxGlobal,ef.offset+p.x);ef.peak=Math.max(ef.peak,Math.hypot(p.vx,p.vy*.45));ef.flowMax=Math.max(ef.flowMax,flow);
 if(flow>=78&&active){ef.combo+=dt;ef.bestCombo=Math.max(ef.bestCombo,ef.combo)}else if(flow<60)ef.combo=0;
 efPaletteStep(dt);efAfterBoss();efTrapsStep();
 ef.pruneTime+=dt;ef.saveTime+=dt;if(ef.pruneTime>1.2){ef.pruneTime=0;efPrune();efRebase()}
 if(ef.saveTime>60){ef.saveTime=0;efStoreRun('En curso')}
 if(ef.idle>35){pause();toast('PAUSA AUTOMÁTICA · El café te estaba esperando.')}
}
function efLoseLife(reason){
 if(state!=='playing'||player.inv>0)return;const sec=ef.currentSection;
 if(!ef.relax)run.lives--;run.totalDeaths++;levelDeaths++;ef.combo=0;flow=0;charge=0;
 ef.respawnX=level.boss?.active&&!level.boss.defeated?level.boss.entry:Math.max(ef.floor+80,sec?.safeX||ef.safeX);
 ef.deadSection=sec;deathQuote=DEATH_LINES[(run.totalDeaths*7+ef.chunkId)%DEATH_LINES.length];player.mode='dead';deathTimer=1.0;state='dying';shake=reduced?0:7;
 burst(player.x,player.y,26,'#ff83b8',370);sound('hurt');floatText(player.x,player.y-55,reason==='fall'?'NO ERA UN ATAJO':'¡PLOF!');tip(deathQuote,4.5);refreshHUD();
}
function efRespawn(){
 if(!ef)return;if(!ef.relax&&run.lives<=0){efEnd('Sin vidas');return}
 const x=ef.respawnX;resetPlayer(x,2.6);initPlayerExtras();clearInput();
 if(level.boss&&!level.boss.defeated){resetEncounter();ef.currentId=null}
 // Flavours may be retried, but no sweets or stars ever respawn.
 for(const f of ef.deadSection?.flavorItems||[])f.taken=false;
 camX=x-worldW*.32;camY=player.y-worldH*.65;state='playing';hideOverlay();toast(ef.relax?'RELAX · El infinito no lleva la cuenta de tus formas.':'QUEDAN '+run.lives+' VIDAS · Misma ruta, nuevo intento.');refreshHUD();
}
