Object.assign(window.__gumTest,{
 musicDirectorInfo(){const m=MUSIC61,a=AMBIENT61;return {version:'6.1',state:HD.state,reason:HD.reason,raw:m.raw,risk:m.risk,threat:m.threat,ttc:Number.isFinite(m.ttc)?m.ttc:null,stall:m.stall,grace:Math.max(0,m.graceUntil-m.clock),time:m.clock,stateAge:m.stateAge,burstRemaining:Math.max(0,m.burstUntil-m.clock),cooldownRemaining:Math.max(0,m.cooldownUntil-m.clock),events:m.events.map(e=>({...e})),timeByState:{...m.timeByState},history:m.history.slice(-25),environment:{active:a.active,world:a.targetWorld,name:a.names[a.targetWorld],weights:[...a.weights],counts:[...a.counts],enabled:profile.settings.worldAmbience!==false,volume:profile.settings.ambienceVolume},averageScanMs:m.scans?m.detectionMs/m.scans:0}},
 musicWorldPreview(i){AMBIENT61.previewWorld=clamp(i,0,6);HD.museumStopped=false;HD.preview='everyday';chipPreview=null;profile.settings.worldAmbience=true;soundEnabled=true;profile.settings.musicOn=true;hdUnlock()},
 async musicWorldRender(i=0,seconds=8,key='everyday'){
  const ac=new OfflineAudioContext(2,Math.ceil(seconds*44100),44100),bus=ac.createGain();bus.gain.value=.45;bus.connect(ac.destination);const noise=createChipNoise(ac),meta=HD_META[key];
  for(let b=0;b<meta.beats.length-1&&meta.beats[b]<seconds-1;b++)ambient61Pattern(ac,bus,noise,clamp(i,0,6),b,meta.beats[b]+.02,meta.beats[b+1]-meta.beats[b],65,ambient61Pitch(meta,b),key==='epic'?'epic':key==='tension'?'tension':'everyday');
  const buffer=await ac.startRendering();const data=buffer.getChannelData(0);let peak=0,sum=0;for(const x of data){peak=Math.max(peak,Math.abs(x));sum+=x*x}return {world:i,duration:seconds,peak,rms:Math.sqrt(sum/data.length)}
 }
});

