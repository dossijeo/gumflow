const hdNow=()=>audioCtx?.currentTime||0;
function hdIsPause(){return state==='paused'||!!window.__gumTest.uiPaused?.()}
function hdIsGame(){return ['playing','dying','finishing','story','levelclear','victory','bossclear','efresults','gameover'].includes(state)}
function hdSetStyle(style){
 HD.museumStopped=false;HD.style=style==='classic'?'classic':'adaptive';profile.settings.musicStyle=HD.style;
 HD.preview=null;chipPreview=null;AMBIENT61.previewWorld=null;hdHalt(false);HD.suspended=null;persist();if(soundEnabled)hdUnlock();
}
function hdCreateBus(){
 if(HD.bus||!audioCtx)return;
 HD.bus=audioCtx.createGain();HD.bus.gain.value=0;
 HD.filter=audioCtx.createBiquadFilter();HD.filter.type='lowpass';HD.filter.frequency.value=19500;HD.filter.Q.value=.45;HD.filter.connect(HD.bus);
 HD.limiter=audioCtx.createDynamicsCompressor();HD.limiter.threshold.value=-5;HD.limiter.knee.value=5;HD.limiter.ratio.value=4;HD.limiter.attack.value=.005;HD.limiter.release.value=.14;
 HD.meter=audioCtx.createAnalyser();HD.meter.fftSize=1024;
 HD.bus.connect(HD.limiter);HD.limiter.connect(HD.meter);HD.meter.connect(audioCtx.destination);
 ambient61Create();
}
function hdStatus(){
 const disabled=!soundEnabled||profile.settings.musicOn===false;
 const text=disabled?'♪ AUDIO DESACTIVADO':!HD.unlocked?'♪ ACTIVAR AUDIO':HD.loading.size?'♪ PREPARANDO MÚSICA…':HD.error?'♪ CHIPTUNE · AUDIO HD NO DISPONIBLE':'♫ AUDIO ACTIVADO';
 const el=$('gf6AudioUnlock');if(el&&el.dataset.raw!==text){el.dataset.raw=text;el.textContent=text;el.setAttribute('aria-pressed',String(!disabled&&HD.unlocked));I18N.localize(el)}
}
async function hdLoad(key){
 if(HD.cache.has(key)){const c=HD.cache.get(key);c.used=performance.now();return c.buffer}
 if(HD.loading.has(key))return HD.loading.get(key);
 const promise=(async()=>{
  const bin=atob(HD_ASSETS[key]),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  const buffer=await audioCtx.decodeAudioData(bytes.buffer);
  if(buffer.duration<HD_META[key].duration-.08)throw new Error('Truncated music buffer: '+key);
  HD.cache.set(key,{buffer,used:performance.now()});return buffer;
 })().catch(err=>{HD.error=String(err);console.warn('GUMFLOW adaptive audio:',err);return null}).finally(()=>{HD.loading.delete(key);hdStatus()});
 HD.loading.set(key,promise);hdStatus();return promise;
}
function hdEvict(){/* Three gameplay arrangements are intentionally kept decoded for immediate danger cues. */}
async function hdWarmGameplay(){
 // Serial decoding avoids a CPU spike and makes the danger arrangement ready before Epic.
 if(!audioCtx||HD.error||HD.style!=='adaptive')return;
 for(const key of ['everyday','tension','epic']){if(HD.error||HD.style!=='adaptive')break;await hdLoad(key)}
}
function hdUnlock(){
 if(!soundEnabled)return;
 try{ensureChipAudio();hdCreateBus();const resume=audioCtx.state==='suspended'?audioCtx.resume():Promise.resolve();
  Promise.resolve(resume).then(()=>{HD.unlocked=audioCtx.state==='running';hdStatus();if(HD.style==='adaptive'&&!HD.error){const key=HD.preview||(hdIsGame()?HD.state:'menu');hdLoad(key).then(()=>hdWarmGameplay())}}).catch(()=>{});
 }catch(err){HD.error=String(err);hdStatus()}
}
function hdHold(param,at){
 // cancelAndHoldAtTime isn't universal: retain a value-based fallback.
 const value=param.value;try{if(param.cancelAndHoldAtTime){param.cancelAndHoldAtTime(at);return}}catch(_){}
 param.cancelScheduledValues(at);param.setValueAtTime(value,at);
}
function hdFade(param,at,seconds,incoming){
 const curve=new Float32Array(64);for(let i=0;i<curve.length;i++){const a=i/(curve.length-1)*Math.PI/2;curve[i]=incoming?Math.sin(a):Math.cos(a)}
 param.cancelScheduledValues(at);param.setValueCurveAtTime(curve,at,Math.max(.02,seconds));
}
function hdVoice(key,offset,at,fade=.28){
 const cached=HD.cache.get(key);if(!cached||!HD.bus)return null;cached.used=performance.now();
 const meta=HD_META[key];offset=clamp(offset,0,meta.duration-.1);
 const node=audioCtx.createBufferSource(),gain=audioCtx.createGain();node.buffer=cached.buffer;node.connect(gain);gain.connect(HD.filter||HD.bus);
 gain.gain.value=0;const v={key,offset,at,end:at+meta.duration-offset,node,gain,fade,stopped:false,isPreview:!!HD.preview,id:++HD.voiceId};
 hdFade(gain.gain,at,fade,true);node.start(at,offset);HD.voices.add(v);
 node.onended=()=>{node.disconnect();gain.disconnect();HD.voices.delete(v);try{node.buffer=null}catch(_){}};
 return v;
}
function hdCursor(v=HD.current,now=hdNow()){if(!v)return 0;return clamp(v.offset+Math.max(0,now-v.at),0,HD_META[v.key].duration)}
function hdStop(v,at,fade){if(!v||v.stopped)return;v.stopped=true;
 try{if(at<v.at+v.fade+.01){hdHold(v.gain.gain,at);v.gain.gain.linearRampToValueAtTime(0,at+fade)}else hdFade(v.gain.gain,at,fade,false);v.node.stop(at+fade+.025)}catch(_){try{v.node.stop()}catch(_){}}
}
function hdHalt(remember=true){
 const now=hdNow();if(HD.pending&&now>=HD.pending.when){HD.current=HD.pending.voice;HD.pending=null}
 if(remember&&HD.current&&!HD.current.isPreview)HD.suspended={key:HD.current.key,offset:hdCursor(),time:now};
 for(const v of HD.voices){try{hdHold(v.gain.gain,now);v.gain.gain.setTargetAtTime(0,now,.022);v.node.stop(now+.13)}catch(_){}}
 HD.current=null;HD.pending=null;HD.lastVolume=-1;AMBIENT61.voice=null;
 if(AMBIENT61.master)AMBIENT61.master.gain.setTargetAtTime(0,now,.025);
}
function hdNextBoundary(v,urgent=false){
 const now=hdNow(),pos=hdCursor(v,now+.045),meta=HD_META[v.key];
 const marker=(urgent?meta.beats:meta.bars).find(p=>p>pos);
 const when=marker===undefined?Math.max(now+.045,v.end):v.at+marker-v.offset;
 // A warning cannot wait a full bar while Gum travels past the obstacle.
 const maxWait=urgent?(MUSIC61.raw>.83?.12:.36):.75;
 return Math.max(now+.035,Math.min(when,now+maxWait));
}
function hdEntry(key,old,when){
 if(!old||key==='menu'||old.key==='menu')return 0;
 const a=HD_META[old.key],b=HD_META[key],cursor=hdCursor(old,when);
 let n=0;while(n<a.bars.length-2&&a.bars[n+1]<cursor)n++;
 const chord=a.barChroma[n];if(!chord||!b.entries.length)return 0;
 const norm=v=>Math.sqrt(v.reduce((s,x)=>s+x*x,0));let best=-10,selected=0;
 for(let i=0;i<b.entries.length;i++){const e=b.entries[i];const similarity=chord.reduce((s,x,j)=>s+x*e.chroma[j],0)/(norm(chord)*norm(e.chroma)+1e-8);const phasePenalty=.018*Math.abs((n/4)%b.entries.length-i);
  const score=similarity-phasePenalty;if(score>best){best=score;selected=e.offset}}
 return selected;
}
function hdTransition(key,urgent=false){
 if(HD.pending||!HD.cache.has(key))return;
 const old=HD.current,now=hdNow();let when=old?hdNextBoundary(old,urgent):now+.035;
 if(key==='menu'||old?.key==='menu')when=now+.08;
 // Returning to Everyday resumes its own musical thread instead of its first bar.
 if(old?.key==='everyday'&&key!=='menu')HD.musicMemory={key:'everyday',offset:hdCursor(old,when),time:when};
 let offset=hdEntry(key,old,when);
 if(key==='everyday'&&old?.key!=='menu'&&HD.musicMemory){
  const m=HD_META.everyday,pos=(HD.musicMemory.offset+Math.max(0,when-HD.musicMemory.time))%m.duration;
  offset=m.beats.find(t=>t>=pos&&t<m.duration-.8)??0;
 }
 const fade=(key==='menu'||old?.key==='menu')?.65:key==='tension'?.26:key==='everyday'?.36:.3;
 const voice=hdVoice(key,offset,when,fade);if(!voice)return;
 // Do not stop the old source until the cue is committed; stale warnings can be cancelled safely.
 HD.pending={voice,when,loop:false,old,fade};HD.lastChange=when;
}
function hdCommitPending(now){
 if(!HD.pending||now<HD.pending.when)return;
 const p=HD.pending;if(p.old)hdStop(p.old,now,p.fade);
 HD.current=p.voice;HD.pending=null;
 if(!p.loop){HD.changes.push({from:p.old?.key||null,to:p.voice.key,at:now,offset:p.voice.offset,reason:HD.reason});if(HD.changes.length>80)HD.changes.shift()}
}
function hdCancelPending(){
 const p=HD.pending;if(!p)return;
 try{p.voice.node.stop()}catch(_){}HD.pending=null;
}
function hdLoop(){
 const v=HD.current;if(!v||HD.pending||v.end-hdNow()>.16)return;
 const at=Math.max(hdNow()+.025,v.end),newVoice=hdVoice(v.key,0,at,.36);if(!newVoice)return;
 HD.pending={voice:newVoice,when:at,loop:true,old:v,fade:.36};
}
