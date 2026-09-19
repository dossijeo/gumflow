function efChooseModule(){
 const dist=ef.nextX*EF_METRES+ef.offset*EF_METRES;
 const tier=Math.min(10,1+Math.floor(dist/800));
 if(ef.chunkId===0)return EF_MODULES.find(m=>m.id==='wave-0');if(ef.chunkId===1)return EF_MODULES.find(m=>m.id==='loop-0');
 if(ef.chunkId%7===6)return EF_MODULES.find(m=>m.id==='wave-'+((ef.chunkId>>3)%2));
 const prev=ef.lastExit||{height:560,type:'ground',minSpeed:0,maxSpeed:1550};
 let pool=EF_MODULES.filter(m=>m.min<=tier&&m.entry.type===prev.type&&m.entry.height===prev.height&&m.entry.maxSpeed>=prev.maxSpeed&&!ef.recent.slice(-7).includes(m.id)&&m.kind!==ef.lastKind);
 if(!pool.length)pool=EF_MODULES.filter(m=>m.min<=tier&&m.entry.type===prev.type);
 const theme=Math.floor(dist/EF_BIOME_METRES)%7,likes=[['loop','sling','roller','press'],['soda','bubble','tube','fan'],['tower','sticky','sling','loop'],['ice','hot','fan','springs'],['hot','heavy','acid','roller'],['wrap','vacuum','tube','press'],['tongue','bubble','springs','slalom']][theme];
 const weighted=pool.flatMap(m=>likes.includes(m.kind)?[m,m,m]:[m]);return weighted[Math.floor(efRandom()*weighted.length)];
}
function efGenerateAhead(){
 if(!ef)return;let guard=0;
 while(ef.nextX<player.x+15000&&guard++<9){
  const absolute=(ef.offset+ef.nextX)*EF_METRES;
  if(absolute>=ef.nextBoss){efAppendBoss();ef.nextBoss=absolute+2400+efRandom()*1100}
  else efAppendModule(efChooseModule());
 }
 level.length=ef.nextX;
}
function efNode(x,y){const a=level.nodes;if(a.at(-1)[0]===x)a.at(-1)[1]=y;else if(x>a.at(-1)[0])a.push([x,y]);else throw new Error('Chunk geometry must be increasing')}
