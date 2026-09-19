const coreBeforeSpecials=beforeSpecials;
beforeSpecials=function(dt){
 coreBeforeSpecials(dt);
 const b=level?.boss,p=player;if(!b||!b.active||b.defeated||b.padLock>0||p.mode!=='normal')return;
 for(const pad of b.pads){if(Math.abs(p.x-pad.x)<83&&p.y>490&&(p.jumpEdge||p.elasticEdge)){
  p.vx=pad.dir*690;p.vy=-890;p.grounded=false;p.platform=null;p.manualJump=false;p.drop=false;p.squash=-.7;p.springLock=.8;b.padLock=.8;jumpBuffer=0;coyote=0;charge=0;cooldown=.2;
  sound('spring');burst(p.x,550,18,'#a1f3d0',270);break;
 }}
};
const coreUpdate=update;
update=function(dt,override){coreUpdate(dt,override);bossStep(dt)};
const coreRespawn=respawn;
respawn=function(){coreRespawn();if(state==='playing')resetEncounter()};
const coreCompleteLevel=completeLevel;
completeLevel=function(){if(level?.boss&&!level.boss.defeated)return;if(bossOnly){bossTrialResult();return}coreCompleteLevel()};
const coreUpdateCamera=updateCamera;
updateCamera=function(dt){
 const b=level?.boss;if(!b?.active||b.defeated||state==='menu'||state==='select'){coreUpdateCamera(dt);return}
 const target=Math.min(.98,CW/(baseScale*(b.w+160)));
 zoom=lerp(zoom,target,1-Math.exp(-dt*3.5));worldW=CW/(baseScale*zoom);worldH=CH/(baseScale*zoom);
 camX=lerp(camX,b.start-(worldW-b.w)*.5,1-Math.exp(-dt*3.6));camY=lerp(camY,560-worldH*.71,1-Math.exp(-dt*3.6));
};
const coreRefreshHUD=refreshHUD;
refreshHUD=function(){coreRefreshHUD();document.body.classList.toggle('boss-active',!!(level?.boss?.active&&!level.boss.defeated&&state==='playing'))};
const coreSaveSession=saveSession;
saveSession=function(){if(bossOnly)return;coreSaveSession();if(profile.session&&level?.boss&&!['finishing','victory','levelclear'].includes(state)){profile.session.bossDefeated=level.boss.defeated;persist()}};
const coreContinueSession=continueSession;
continueSession=function(){bossOnly=false;const won=profile.session?.bossDefeated;coreContinueSession();if(won&&level?.boss){level.boss.defeated=true;level.boss.hp=0;level.boss.phase='defeated'}};
const coreStartRun=startRun;
startRun=function(index=0,immediate=false){bossOnly=false;chipPreview=null;coreStartRun(index,immediate)};
