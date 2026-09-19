Object.assign(window.__gumTest,{
 hdInfo(){return {style:HD.style,language:I18N.language,preference:I18N.preference,unlocked:HD.unlocked,error:HD.error,current:HD.current?{key:HD.current.key,offset:hdCursor(),end:HD.current.end}:null,pending:HD.pending?{key:HD.pending.voice.key,at:HD.pending.when}:null,state:HD.state,reason:HD.reason,tension:HD.tension,voices:HD.voices.size,cache:[...HD.cache.keys()],changes:HD.changes.slice(-8),muted:HD.bus?.gain.value===0,volume:HD.bus?.gain.value}},
 hdForce(key=null){HD.testState=key},
 hdStyle:hdSetStyle,
 hdPreview(key){HD.preview=key;chipPreview=null;AMBIENT61.previewWorld=null;hdHalt(false);HD.suspended=null;soundEnabled=true;profile.settings.musicOn=true;hdUnlock()},
 hdStopPreview(){HD.preview=null;chipPreview=null;AMBIENT61.previewWorld=null;hdHalt(false);HD.suspended=null},
 hdSeekNearEnd(){if(!HD.current)return;const key=HD.current.key;hdHalt(false);HD.suspended=null;HD.current=hdVoice(key,HD_META[key].duration-1,hdNow()+.03,.08)},
 hdAudioLevel(){if(!HD.meter)return null;const d=new Float32Array(HD.meter.fftSize);HD.meter.getFloatTimeDomainData(d);return {peak:Math.max(...d.map(Math.abs)),rms:Math.sqrt(d.reduce((a,x)=>a+x*x,0)/d.length)}},
 hdLoadAll:async()=>{hdUnlock();for(const k of Object.keys(HD_META))await hdLoad(k);return {error:HD.error,cache:[...HD.cache.keys()]}},
 hdManifest:()=>HD_META
});


