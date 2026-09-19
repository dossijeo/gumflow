// Explicit test hooks. Production controls never call these shortcuts.
Object.assign(window.__gumTest,{
 endless(relax=false,seed='GUM-TEST'){autoTest=true;startEndless(relax,seed);soundEnabled=false;return this.endlessSnapshot()},
 endlessSnapshot(){return ef?{...this.snapshot(),endless:efSnapshot(),seed:ef.seed,offset:ef.offset,generated:ef.chunkId,retained:level.sections.length,nodes:level.nodes.length,liveItems:Object.entries(level).filter(([k,v])=>Array.isArray(v)).reduce((n,[k,v])=>n+v.length,0),nextBoss:ef.nextBoss,current:ef.currentSection?.moduleId,currentId:ef.currentSection?.id,difficulty:ef.difficulty,biome:ef.biome,pruned:ef.pruned||0,rebases:ef.rebases||0,history:ef.history,efTraps:level.efTraps}:null},
 endlessCatalog(){return EF_MODULES.map(m=>({...m}))},endlessStore(){return structuredClone(efStore)},
 endlessImages(){return EF_LAYER_IMAGES.map(i=>({loaded:i.complete&&i.naturalWidth>0,w:i.naturalWidth,h:i.naturalHeight}))},
 endlessFinish(reason='Prueba completada'){efEnd(reason);return efSnapshot()},endlessHit(){player.inv=0;loseLife('test')},
 endlessGenerate(){efGenerateAhead();return this.endlessSnapshot()},endlessSection(){return ef.currentSection},
 endlessPreviewModule(id){autoTest=true;startEndless(true,'PREVIEW');level=efBlankLevel();ef.nextX=0;ef.chunkId=0;ef.history=[];ef.recent=[];ef.currentId=null;const m=EF_MODULES.find(m=>m.id===id);efAppendModule(m);efGenerateAhead();resetPlayer(600,3);initPlayerExtras();efSelectSection();updateCamera(1);render();return this.endlessSnapshot()},
 endlessBoss(index=0,rank=1){autoTest=true;startEndless(true,'BOSS');level=efBlankLevel();ef.nextX=0;ef.nextBossIndex=rank-1;efAppendBoss();const b=level.sections[0].boss;b.index=index;b.def={...BOSS_BOOK[index],name:BOSS_BOOK[index].short+' · Mk.'+rank};level.boss=b;resetPlayer(b.entry,3);initPlayerExtras();ef.currentId=null;efSelectSection();efGenerateAhead();return this.endlessSnapshot()},
 endlessSeek(distance){if(!ef)return null;const desired=distance/EF_METRES+150;while(ef.offset+player.x<desired){player.x=Math.min(desired-ef.offset,ef.nextX-100);player.y=groundAt(level,player.x).y-20;player.px=player.x;ef.maxGlobal=Math.max(ef.maxGlobal,ef.offset+player.x);efGenerateAhead();efSelectSection();if(level.boss){level.boss.defeated=true;level.boss.rewarded=true}efPrune();efRebase()}efPaletteStep(6);refreshHUD();updateCamera(1);render();return this.endlessSnapshot()},
 save:saveSession,restore:continueSession,menu,pause,render
});

