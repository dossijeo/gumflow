// A tiny deterministic test hook, also useful for iterating on this prototype.
window.__gumTest={
 start(index=0){autoTest=true;startRun(index,true);soundEnabled=false;return this.snapshot()},
 step(n=1,controls={right:true}){for(let i=0;i<n;i++){visualT+=1/120;update(1/120,{left:false,right:false,jump:false,elastic:false,...controls});updateCamera(1/120)}refreshHUD();render();return this.snapshot()},
 snapshot(){return{state,level:levelIndex,x:player.x,y:player.y,vx:player.vx,vy:player.vy,grounded:player.grounded,mode:player.mode,charge,flow,lives:run?.lives,sugar:run?.sugar,time:levelTime,checkpoint,score:run?.score,deaths:levelDeaths,finish:level.finish,flavor:player.flavor,flavorTime:player.flavorTime,wrapped:player.wrapped,stars:level.stars?.filter(s=>s.taken).length,cold:player.cold,warm:player.warm,flat:player.flat,strip:player.strip,cut:player.cut,coat:player.coat,results:run?.results}},
 world(){return {sections:level.sections,hazards:level.hazards,gaps:level.gaps,springs:level.springs,loops:level.loops,platforms:level.platforms,anchors:level.anchors,flavors:level.flavors,bubbles:level.bubbles,materials:level.materials,stars:level.stars,gates:level.gates,presses:level.presses,documents:level.documents,pools:level.pools,frozen:level.frozen.map(f=>({x:f.pool.x,time:f.time})),tubes:level.tubes.map(t=>({x:t.points[0].x,end:t.points.at(-1).x}))}},
 warp(x,y){resetPlayer(x,0);initPlayerExtras();if(y!==undefined){player.y=y;player.py=y;player.grounded=false}camX=x-worldW*.32;camY=player.y-worldH*.61;refreshHUD();render()},
 next(){if(state==='levelclear'){loadLevel(levelIndex+1);state='playing';hideOverlay();return this.snapshot()}},
 resumeLive(){autoTest=false;rafAccumulator=0;lastTime=0},pause,menu,render,ground(x){return groundAt(level,x)},set(p){Object.assign(player,p)},resize,
 assist(on=true){profile.settings.assist=on},profile(){return structuredClone(profile)},save:saveSession,restore:continueSession,flavor:applyFlavor,
 simulate(index=0,maxSeconds=180){if(index!==null)this.start(index);let lastMode='',modes=new Set(),peakX=0,resetCount=0;for(let frame=0;frame<maxSeconds*120;frame++){
   if(state==='levelclear'||state==='victory')break;if(state==='gameover')break;
   const p=player,look=Math.max(140,Math.abs(p.vx)*.23);let jumpNow=false;
   if(p.grounded){jumpNow=level.hazards.some(h=>h.x>p.x-5&&h.x-p.x<look)||level.gates.some(g=>!g.broken&&g.x>p.x&&g.x-p.x<look+50)||level.gaps.some(g=>g[0]>p.x&&g[0]-p.x<look)||!!(p.platform&&inGap(level,p.x)&&p.platform.x+p.platform.w-p.x<look);}
   // The player may hold the jump briefly, but releases in loops and tubes.
   const controls={right:true,left:false,jump:p.mode==='normal'&&(jumpNow||(input.jump&&!p.grounded&&p.manualJump&&p.vy<-150)),elastic:false};
   update(1/120,controls);visualT+=1/120;peakX=Math.max(peakX,p.x);modes.add(p.mode);
 }
 refreshHUD();updateCamera(1);render();return {...this.snapshot(),peakX,modes:[...modes]};
 }
};

