function ensureChipAudio(){
 if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();
 if(!chipBus){chipBus=audioCtx.createGain();fxBus=audioCtx.createGain();const master=audioCtx.createGain(),limiter=audioCtx.createDynamicsCompressor();audioMeter=audioCtx.createAnalyser();audioMeter.fftSize=1024;
  chipBus.gain.value=0;fxBus.gain.value=.7;master.gain.value=.83;limiter.threshold.value=-12;limiter.knee.value=12;limiter.ratio.value=5;limiter.attack.value=.004;limiter.release.value=.12;
  chipBus.connect(master);fxBus.connect(master);master.connect(limiter);limiter.connect(audioMeter);audioMeter.connect(audioCtx.destination);chipNoise=createChipNoise(audioCtx);
  chipTicker=setInterval(pumpChip,25);
 }
 if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
}
function pumpChip(){
 if(!audioCtx||!chipBus)return;
 const running=soundEnabled&&audioCtx.state==='running'&&!document.hidden&&(state==='playing'||chipPreview!==null);
 const now=audioCtx.currentTime;
 if(!running){if(!chipMuted){chipBus.gain.setTargetAtTime(0,now,.03);chipMuted=true}chipNext=now+.035;return}
 const idx=chipPreview!==null?chipPreview:levelIndex,boss=chipPreview===null&&!!(level?.boss?.active&&!level.boss.defeated);
 if(chipSong!==idx){chipSong=idx;chipStep=0;chipNext=now+.035}
 if(chipBoss!==boss){chipBoss=boss;chipStep=Math.ceil(chipStep/16)*16}
 const vol=profile.settings.musicOn===false?0:(profile.settings.musicVolume??.7);
 if(chipMuted||chipBus._lastVol!==vol){chipBus.gain.setTargetAtTime(vol,now,.08);chipBus._lastVol=vol;chipMuted=false}
 if(chipNext<now-.1)chipNext=now+.025;
 let count=0;while(chipNext<now+.12&&count++<8){arrangeChipStep(audioCtx,chipBus,chipNoise,idx,chipStep++,chipNext,chipPreview!==null?85:flow,boss);chipNext+=60/(SCORE_TRACKS[idx].bpm+(boss?12:0))/4}
 fxBus.gain.value=profile.settings.fxOn===false?0:(profile.settings.fxVolume??.72);
}
audioStart=function(){if(!soundEnabled)return;try{ensureChipAudio();pumpChip()}catch(_){soundEnabled=false}};
music=function(){/* Audio-clock scheduling, independent from the physics frame rate. */};
sound=function(type){if(profile.settings.fxOn===false||!soundEnabled||!audioCtx||audioCtx.state!=='running')return;try{const at=audioCtx.currentTime+.001,seq={sugar:[83,88],jump:[55,64],boost:[43,67],bounce:[48,67],spring:[60,79],check:[72,76,79],hurt:[43,31],win:[72,76,79,84],start:[64,67,72],life:[76,79,84,88],loop:[69,76],bossHit:[48,60,72,84]}[type]||[72];for(let i=0;i<seq.length;i++)chipTone(audioCtx,fxBus||audioCtx.destination,seq[i],at+i*.045,.12,type==='sugar'?.028:.065,type==='hurt'?'sawtooth':'triangle',3400,(type==='spring'||type==='jump')?3:0)}catch(_){}};
async function renderChipPreview(index=0,seconds=8,boss=false){const ac=new OfflineAudioContext(2,Math.ceil(seconds*44100),44100),bus=ac.createGain();bus.gain.value=.65;bus.connect(ac.destination);const noise=createChipNoise(ac),stepTime=60/(SCORE_TRACKS[index].bpm+(boss?12:0))/4;for(let s=0;s*stepTime<seconds-.3;s++)arrangeChipStep(ac,bus,noise,index,s,s*stepTime+.02,85,boss);return ac.startRendering()}

