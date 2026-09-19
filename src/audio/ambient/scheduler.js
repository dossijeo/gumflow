function ambient61Pump(allowed){
 const a=AMBIENT61;if(!a.master||!audioCtx)return;
 const now=audioCtx.currentTime,dt=clamp(now-(a.lastTime||now),0,.12);a.lastTime=now;
 const audition=HD.preview!==null&&a.previewWorld!==null;
 const active=allowed&&profile.settings.worldAmbience!==false&&!document.hidden&&soundEnabled&&profile.settings.musicOn!==false&&((state==='playing'&&!HD.preview)||audition)&&HD.current&&HD.current.key!=='menu';
 a.active=!!active;
 if(!active){a.master.gain.setTargetAtTime(0,now,.07);a.voice=null;return}
 const target=audition?a.previewWorld:(ef?.biome??levelIndex);a.targetWorld=clamp(target,0,6);
 const gain=clamp(profile.settings.ambienceVolume??.45,0,1);
 a.master.gain.setTargetAtTime(gain,now,.12);
 const danger=audition?0:HD.tension;a.filter.frequency.setTargetAtTime(15000-danger*10900,now,.24);
 // Stage/biome changes crossfade only these colors; the full recording keeps playing.
 for(let i=0;i<7;i++){
  a.weights[i]=lerp(a.weights[i],i===a.targetWorld?1:0,1-Math.exp(-dt/(ef?1.65:1.1)));
  a.buses[i].gain.setTargetAtTime(a.weights[i],now,.18);
 }
 const v=HD.current,meta=HD_META[v.key];
 if(a.voice!==v){a.voice=v;a.nextBeat=0;const cursor=hdCursor(v,now+.035);while(a.nextBeat<meta.beats.length&&meta.beats[a.nextBeat]<cursor)a.nextBeat++}
 let limit=0;
 while(a.nextBeat<meta.beats.length-1&&limit++<4){
  const b=a.nextBeat,at=v.at+meta.beats[b]-v.offset;if(at>now+.11)break;a.nextBeat++;
  if(at<now+.005||HD.pending&&at>=HD.pending.when)continue;
  const duration=meta.beats[b+1]-meta.beats[b],pc=ambient61Pitch(meta,b);
  for(let i=0;i<7;i++)if(a.weights[i]>.015||i===a.targetWorld){
   ambient61Pattern(audioCtx,a.buses[i],a.noise,i,b,at,duration,audition?65:flow,pc,v.key==='epic'?'epic':v.key==='tension'?'tension':'everyday');a.counts[i]++;
  }
 }
}
