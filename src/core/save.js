function persist(){try{localStorage.setItem('gumflow-v3',JSON.stringify(profile));storageOK=true}catch(_){storageOK=false}}
function initPlayerExtras(){Object.assign(player,{flavor:null,flavorTime:0,cold:0,warm:0,coat:0,flat:0,strip:0,cut:0,wrapped:0,wrapHits:0,wrapLock:0,anchor:null,anchorLock:0,bubble:null,bubbleLock:0,modeTime:0,aim:-.72,tension:0,stored:0,idle:0,floatFuel:2,shock:0,npcHit:0,material:null,stuck:0,lastX:player.x});}
function saveSession(){
 if(!run||!level||['victory','levelclear','finishing'].includes(state))return;
 profile.session={level:levelIndex,run:structuredClone(run),checkpoint,levelTime,levelCollected,levelDeaths,peakSpeed,stageBase:structuredClone(stageBase),taken:level.sweets.map((s,i)=>s.taken?i:-1).filter(i=>i>=0),stars:level.stars.map(s=>s.taken),flavors:level.flavors.map(f=>f.taken),documents:level.documents.map(d=>d.taken),events:[...level.events]};persist();
}
function continueSession(){
 const s=profile.session;if(!s){startRun(0);return}run=structuredClone(s.run);loadLevel(clamp(s.level,0,6));
 if(!s.fresh){checkpoint=clamp(s.checkpoint||0,0,level.checkpoints.length);levelTime=s.levelTime||0;levelCollected=s.levelCollected||0;levelDeaths=s.levelDeaths||0;peakSpeed=s.peakSpeed||0;stageBase=s.stageBase||stageBase;
  for(const i of s.taken||[])if(level.sweets[i])level.sweets[i].taken=true;
  level.stars.forEach((v,i)=>v.taken=!!s.stars?.[i]);level.flavors.forEach((v,i)=>v.taken=!!s.flavors?.[i]);level.documents.forEach((v,i)=>v.taken=!!s.documents?.[i]);level.events=new Set(s.events||[]);
  level.checkpoints.forEach((c,i)=>c.active=i<checkpoint);const x=checkpoint?level.checkpoints[checkpoint-1].x+35:level.spawn;resetPlayer(x,2.5);initPlayerExtras();camX=x-worldW*.32;camY=player.y-worldH*.65;for(const f of level.flavors)if(f.x>=x)f.taken=false;
 }
 setWide(false);state='playing';hideOverlay();audioStart();if(run.lives<=0&&!profile.settings.assist)respawn();else toast('PARTIDA RECUPERADA · '+(checkpoint?'CHECKPOINT '+checkpoint:'INICIO DE FASE'));
}
