function lBoss(){return level?.boss?.active&&!level.boss.defeated?level.boss:null}
function hdPump(){
 if(!audioCtx||!HD.bus)return;
 const now=audioCtx.currentTime,blocked=document.hidden||audioCtx.state!=='running'||!soundEnabled||profile.settings.musicOn===false;
 const paused=(hdIsPause()||(state==='museum'&&HD.museumStopped))&&!HD.preview&&chipPreview===null;
 const modeHD=!HD.error&&(!!HD.preview||HD.style==='adaptive')&&chipPreview===null;
 if(blocked||paused||!modeHD){if(HD.current||HD.pending)hdHalt(true);ambient61Pump(false);hdStatus();music61Indicator();return}
 hdCommitPending(now);
 let key=HD.preview||(hdIsGame()?HD.state:'menu');if(HD.testState&&hdIsGame()&&!HD.preview)key=HD.testState;
 // Death resolves the warning: attenuate first, restore Everyday on the safe respawn.
 if(state==='dying'&&!HD.preview)key=HD.current?.key||'everyday';
 HD.desired=key;
 const death=state==='dying'&&!HD.preview,duck=death?(now<MUSIC61.deathAudioUntil?.04:.18):1;
 const vol=(profile.settings.musicVolume??.7)*.78*duck;
 if(Math.abs(vol-HD.lastVolume)>.0001){HD.bus.gain.setTargetAtTime(vol,now,death?.025:.14);HD.lastVolume=vol}
 const danger=state==='playing'&&!HD.preview?HD.tension:0;
 HD.filter.frequency.setTargetAtTime(death?900:19500-danger*(HD.current?.key==='everyday'?13200:4400),now,death?.035:.17);
 if(HD.pending&&!HD.pending.loop&&HD.pending.voice.key!==key&&HD.pending.when>now+.005)hdCancelPending();
 if(!HD.cache.has(key)){hdLoad(key);hdLoop();ambient61Pump(true);music61Indicator();return}
 if(!HD.current&&!HD.pending){
  const resume=!HD.preview&&HD.suspended?.key===key?HD.suspended.offset:0;if(!HD.preview)HD.suspended=null;
  HD.current=hdVoice(key,resume,now+.025,.13);HD.lastChange=now;
 }else if(HD.current?.key!==key&&!HD.pending){hdTransition(key,HD.reason==='boss'||key==='tension'||HD.current?.key==='epic')}
 else hdLoop();
 ambient61Pump(true);hdStatus();music61Indicator();
}


// Seven lightweight timbral palettes, using the same synthesis primitives as the
// original score. No second tune, no fixed-BPM arpeggio over a different-tempo MP3.
