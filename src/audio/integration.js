// One clock for all music. The classic score keeps its own implementation and FX bus.
const hdClassicPump=pumpChip;
pumpChip=function(){
 if(!audioCtx)return;
 const useClassic=!HD.preview&&(chipPreview!==null||HD.style==='classic'||!!HD.error);
 if(useClassic)hdClassicPump();else if(chipBus){const now=audioCtx.currentTime;if(!chipMuted||chipBus._hdActive!==true){chipBus.gain.cancelScheduledValues(now);chipBus.gain.setTargetAtTime(0,now,.05);chipMuted=true;chipBus._hdActive=true}chipNext=now+.04;}
 if(useClassic&&chipBus)chipBus._hdActive=false;
 if(fxBus)fxBus.gain.value=profile.settings.fxOn===false?0:(profile.settings.fxVolume??.72);
 hdPump();
};
audioStart=function(){if(soundEnabled)hdUnlock()};
const hdOriginalUpdate=update;
update=function(dt,override){hdOriginalUpdate(dt,override);hdGameState(dt)};
addEventListener('pointerdown',e=>{if(e.target.closest?.('#gf6AudioUnlock'))return;if(soundEnabled&&!HD.unlocked)hdUnlock()},{passive:true});
addEventListener('keydown',()=>{if(soundEnabled&&!HD.unlocked)hdUnlock()});
addEventListener('visibilitychange',()=>{if(document.hidden)hdHalt(true);else if(soundEnabled&&HD.unlocked)hdUnlock()});
