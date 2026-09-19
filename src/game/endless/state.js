// ============================================================================
// ENDLESS FLOW / additive V4 extension. Campaign code and original Gum renderer
// above are retained. Infinite geometry uses compatible, authored chunks,
// a deterministic PRNG, a bounded live window and coordinate rebasing.
// ============================================================================
const EF_ORIGINAL={menu,startRun,startBossTrial,continueSession,saveSession,pause,
 loseLife,respawn,completeLevel,update,refreshHUD,background,drawGround,drawHazards,
 drawPlayer,drawFinish,drawCheckpoints,afterSpecials,applyFlavor,award,wakeBoss,
 damageBoss,bossStep,updateCamera,pumpChip,arrangeChipStep,render,retryLevel};
let ef=null,efStorageOK=true,efStore={version:1,normal:{best:{},top:[],runs:0},relax:{best:{},top:[],runs:0}};
try{const raw=JSON.parse(localStorage.getItem('gumflow-endless-v1')||'null');if(raw?.version===1){for(const k of ['normal','relax'])if(raw[k])efStore[k]={best:raw[k].best||{},top:(raw[k].top||[]).slice(0,5),runs:raw[k].runs||0}}}catch(_){efStorageOK=false}
