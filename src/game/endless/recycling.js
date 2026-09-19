function efSelectSection(){
 const sec=level.sections.find(s=>player.x>=s.x&&player.x<s.end);if(!sec)return;
 ef.difficulty=sec.tier;ef.completed=Math.max(ef.completed,sec.id);
 if(ef.currentId!==sec.id){
  ef.currentId=sec.id;ef.currentSection=sec;
  if(!sec.seen){sec.seen=true;if(sec.hint)tip(sec.hint,5.5)}
  if(sec.boss){level.boss=sec.boss;ef.safeX=sec.safeX}
  else if(!level.boss||level.boss.defeated||!level.boss.active){level.boss=null;ef.safeX=sec.safeX}
 }
 if(sec.boss&&!sec.boss.defeated)level.boss=sec.boss;
}
function efPrune(){
 // Retain three full modules behind and at least four in front. Do not recycle
 // under the player, an active boss, an attached anchor or the respawn position.
 const current=level.sections.findIndex(s=>player.x>=s.x&&player.x<s.end);
 if(current<4)return;const keepFrom=level.sections[current-3].x;
 if(keepFrom<=ef.floor+100)return;
 ef.floor=keepFrom+25;level.sections=level.sections.filter(s=>s.end>keepFrom);
 let i=0;while(i<level.nodes.length-2&&level.nodes[i+1][0]<=keepFrom)i++;level.nodes=level.nodes.slice(i);
 for(const key of ['loops','springs','hazards','signs','materials','anchors','bubbles','winds','flavors','gates','presses','enemies','stars','npcs','props','pools','efTraps'])level[key]=level[key].filter(o=>(o.x+(o.w||o.r||0))>=keepFrom-300);
 level.platforms=level.platforms.filter(o=>o.x+o.w>=keepFrom-300);level.sweets=level.sweets.filter(o=>o.x>=keepFrom-150);level.boosts=level.boosts.filter(x=>x>=keepFrom-150);level.gaps=level.gaps.filter(g=>g[1]>=keepFrom);level.tubes=level.tubes.filter(t=>t.points.at(-1).x>=keepFrom-500);
 level.frozen=level.frozen.filter(f=>level.pools.includes(f.pool));level.events.clear();level.seenTips.clear();
 if(level.boss?.defeated&&level.boss.end<keepFrom)level.boss=null;
 ef.pruned=(ef.pruned||0)+1;
}
function efRebase(){
 if(player.x<120000)return;const shift=80000,visited=new Set();
 const obj=o=>{if(!o||typeof o!=='object'||visited.has(o))return;visited.add(o);
  for(const k of ['x','px','lastX','start','end','entry','targetX','safeX'])if(typeof o[k]==='number')o[k]-=shift;
  for(const k of ['pads','hazards','points','samples','stars','flavorItems'])if(Array.isArray(o[k]))o[k].forEach(obj);
  if(o.boss)obj(o.boss);if(o.pool)obj(o.pool);
 };
 level.nodes.forEach(n=>n[0]-=shift);level.gaps.forEach(g=>{g[0]-=shift;g[1]-=shift});level.boosts=level.boosts.map(x=>x-shift);
 for(const k of ['sections','loops','springs','hazards','platforms','tubes','sweets','signs','materials','anchors','bubbles','winds','flavors','gates','presses','enemies','stars','npcs','props','pools','frozen','efTraps'])level[k].forEach(obj);
 obj(level.boss);obj(player);obj(player.platform);obj(player.anchor);obj(player.bubble);obj(player.loop);obj(player.tube);particles.forEach(obj);trails.forEach(obj);floaters.forEach(obj);
 level.length-=shift;level.spawn-=shift;ef.nextX-=shift;ef.safeX-=shift;ef.respawnX-=shift;ef.floor-=shift;camX-=shift;ef.offset+=shift;ef.rebases=(ef.rebases||0)+1;
}
