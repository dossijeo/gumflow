// GUMFLOW 6.1 — event-driven soundtrack + beat-locked world ambience.
// User recordings remain unmodified. These are full mixes, NOT synchronized stems:
// crossfades are brief; we never run two complete arrangements indefinitely.
const HD = {
 style:profile.settings.musicStyle||'adaptive',preview:null,unlocked:false,error:null,
 cache:new Map(),loading:new Map(),voices:new Set(),current:null,pending:null,suspended:null,
 bus:null,filter:null,limiter:null,meter:null,desired:'menu',state:'everyday',reason:'normal',
 lastChange:-100,candidate:'everyday',candidateFor:0,stall:0,rush:0,recentDeaths:0,
 progress:0,world:null,decisionClock:0,tension:0,lastDeaths:0,testState:null,
 changes:[],statusNode:null,lastStatus:'',lastVolume:-1,voiceId:0,musicMemory:null
};
profile.settings.musicStyle=HD.style;
profile.settings.worldAmbience??=true;
profile.settings.ambienceVolume??=.45;
profile.settings.musicIndicator??=false;
