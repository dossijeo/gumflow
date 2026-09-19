const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d',{alpha:false});
const TAU=Math.PI*2, clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), lerp=(a,b,t)=>a+(b-a)*t, ease=t=>t*t*(3-2*t), rnd=(a,b)=>a+Math.random()*(b-a);
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let CW=innerWidth,CH=innerHeight,DPR=1,baseScale=1,worldW=1200,worldH=700,visualT=0,camX=-80,camY=0,zoom=1,shake=0;
let state='menu',levelIndex=0,level=null,player=null,run=null,particles=[],trails=[],floaters=[],levelTime=0,flow=0,peakSpeed=0,checkpoint=0;
let levelCollected=0,levelDeaths=0,toastTime=0,tipTime=0,tipText='',bannerTime=0,deathTimer=0,transitionTimer=0,charge=0,cooldown=0,prevElastic=false;
let jumpBuffer=0,coyote=0,jumpHeld=false,autoTest=false,rafAccumulator=0,lastTime=0,hudTimer=0,soundEnabled=false,audioCtx=null,musicTick=0,musicTime=0;
let best={};try{best=JSON.parse(localStorage.getItem('gumflow-best-v1')||'{}')}catch(_){}
const keys=new Set(),touchState={left:false,right:false,jump:false,elastic:false},pointers=new Map();
let input={left:false,right:false,jump:false,elastic:false},lastJumpInput=false;
// Original game concept and hand-authored campaign data. Everything stays offline.
let profile={version:3,records:{},lore:[],achievements:[],session:null,settings:{assist:false,sound:true,painted:true,musicVolume:.7,fxVolume:.72}};
let storageOK=true;
try{const raw=JSON.parse(localStorage.getItem('gumflow-v3')||localStorage.getItem('gumflow-v2')||'null');if(raw&&(raw.version===2||raw.version===3))profile={...profile,...raw,version:3,settings:{...profile.settings,...raw.settings}}}catch(_){storageOK=false}
let dialogueTime=0,deathQuote='',stageBase=null,chapter=-1,flavorSeen=new Set(),pendingArchiveReturn='menu';
