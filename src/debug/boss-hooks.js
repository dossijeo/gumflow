// Testing/iteration hooks, not gameplay shortcuts. A natural-input solver is used outside the build.
const originalSnapshot=window.__gumTest.snapshot;
Object.assign(window.__gumTest,{
 snapshot(){return {...originalSnapshot.call(this),boss:level?.boss?{name:level.boss.def.name,phase:level.boss.phase,t:level.boss.t,hp:level.boss.hp,maxHp:level.boss.maxHp,active:level.boss.active,defeated:level.boss.defeated,x:level.boss.x,y:level.boss.y,start:level.boss.start,end:level.boss.end,entry:level.boss.entry,pads:level.boss.pads,hitCount:level.boss.hitCount}:null,bossOnly}},
 bossTrial(index=0){autoTest=true;startBossTrial(index);soundEnabled=false;return this.snapshot()},
 resetBoss:resetEncounter,attackState(){return level?.boss?.hazards},
 images(){return BG_IMAGES.map(img=>({ok:img.complete&&img.naturalWidth>0,width:img.naturalWidth,height:img.naturalHeight}))},
 audio(on=true){soundEnabled=on;profile.settings.sound=on;audioStart();return {on: soundEnabled,state:audioCtx?.state}},
 audioInfo(){const d=audioMeter?new Float32Array(audioMeter.fftSize):null;if(d)audioMeter.getFloatTimeDomainData(d);return {context:audioCtx?.state,step:chipStep,song:chipSong,boss:chipBoss,muted:chipMuted,peak:d?Math.max(...d.map(Math.abs)):0}},
 async audioRender(index=0,seconds=8,boss=false){const a=await renderChipPreview(index,seconds,boss);const d=a.getChannelData(0);let sum=0,peak=0;for(const x of d){peak=Math.max(peak,Math.abs(x));sum+=x*x}return {duration:a.duration,peak,rms:Math.sqrt(sum/d.length),samples:d.length}},
 previewTrack(index){chipPreview=index;soundEnabled=true;audioStart()},
 forcePhase(phase){setBossPhase(level.boss,phase)},
 testClock(n,controls={}){for(let i=0;i<n;i++){visualT+=1/120;update(1/120,{left:false,right:false,jump:false,elastic:false,...controls})}return this.snapshot()},
 leaveTrial(){bossOnly=false},
 credits(){return {music:'Original 32-bar synthesized arrangements, no third-party audio',art:7,protagonist:'Original V2 renderer preserved'}}
});
window.__gumTest.runToBoss=function(index=null,maxSeconds=200){
 if(index!==null)this.start(index);this.assist(true);let maxX=0;
 for(let f=0;f<maxSeconds*120;f++){
  if(level.boss.active||state==='gameover'||state==='levelclear'||state==='victory')break;
  const p=player,look=Math.max(140,Math.abs(p.vx)*.23);let j=false;
  if(p.grounded)j=level.hazards.some(h=>h.x>p.x-5&&h.x-p.x<look)||level.gates.some(g=>!g.broken&&g.x>p.x&&g.x-p.x<look+50)||level.gaps.some(g=>g[0]>p.x&&g[0]-p.x<look)||!!(p.platform&&inGap(level,p.x)&&p.platform.x+p.platform.w-p.x<look);
  const controls={right:true,left:false,jump:p.mode==='normal'&&(j||(input.jump&&!p.grounded&&p.manualJump&&p.vy<-150)),elastic:false};
  update(1/120,controls);visualT+=1/120;maxX=Math.max(maxX,p.x);
 }
 refreshHUD();updateCamera(1);render();return {...this.snapshot(),maxX};
};
// Keep test entry points bound to the expanded implementations, just like the UI.
Object.assign(window.__gumTest,{save:saveSession,restore:continueSession,menu,pause});


