function efBlankLevel(){return {name:'Endless Flow',subtitle:'El infinito también puede contener trazas de azúcar.',palette:{...WORLD_PALETTES[0]},length:5000,finish:1e12,spawn:150,nodes:[[0,560]],gaps:[],loops:[],springs:[],boosts:[],hazards:[],checkpoints:[],platforms:[],tubes:[],sweets:[],signs:[],tips:[],seenTips:new Set(),sections:[],materials:[],anchors:[],bubbles:[],winds:[],flavors:[],gates:[],presses:[],enemies:[],stars:[],documents:[],npcs:[],props:[],events:new Set(),pools:[],frozen:[],chases:[],endPulse:0,boss:null,efTraps:[]}}
function startEndless(relax=false,seed=efNewSeed()){
 if(ef&&!ef.finished)efStoreRun('Nueva carrera');if(!ef&&['playing','paused','story'].includes(state)&&!bossOnly)EF_ORIGINAL.saveSession();
 ef={seed:String(seed).slice(0,36),rng:efHash(seed),id:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),date:Date.now(),relax:!!relax,offset:0,maxGlobal:150,nextX:0,nextBoss:2500,nextBossIndex:0,chunkId:0,completed:0,recent:[],history:[],difficulty:1,floor:30,safeX:150,respawnX:150,elapsed:0,stars:0,bosses:0,peak:0,flowMax:0,combo:0,bestCombo:0,biome:0,previousBiome:0,blend:1,blendFrom:{...WORLD_PALETTES[0]},pruneTime:0,saveTime:0,idle:0,finish:false,finished:false,registered:false,deadSection:null};
 ef.nextBoss=2400+efRandom()*950;bossOnly=false;chipPreview=null;levelIndex=0;level=efBlankLevel();
 run={lives:3,sugar:0,score:0,totalSugar:0,totalDeaths:0,totalTime:0,results:[],practice:true,stars:0};stageBase={score:0,sugar:0,totalSugar:0,totalDeaths:0,stars:0};
 levelTime=0;levelCollected=0;levelDeaths=0;peakSpeed=0;checkpoint=0;particles=[];trails=[];floaters=[];chapter=-1;dialogueTime=0;toastTime=0;tipTime=0;bannerTime=0;
 player={x:150};efGenerateAhead();resetPlayer(150,2.4);initPlayerExtras();camX=-80;camY=player.y-worldH*.65;zoom=1;clearInput();setWide(false);state='playing';document.body.classList.add('endless-mode');hideOverlay();$('dialogue').classList.remove('show');$('tip').classList.remove('show');$('toast').classList.remove('show');
 $('levelName').textContent='ENDLESS FLOW';$('levelCounter').textContent=relax?'∞ / RELAX':'∞ / SUPERVIVENCIA';refreshHUD();audioStart();sound('start');tip('ENDLESS FLOW · '+(relax?'Vidas infinitas.':'Tres vidas. 60 dulces = +1 vida.')+' Tú controlas el movimiento. Busca las rutas altas.',7);
}
function efLeave(){
 ef=null;document.body.classList.remove('endless-mode','boss-active');const lab=$('score')?.parentElement?.querySelector('.stat-label');if(lab)lab.textContent='puntos';
 const speedUnit=$('speed')?.querySelector('small');if(speedUnit)speedUnit.textContent='km/h*';
}
