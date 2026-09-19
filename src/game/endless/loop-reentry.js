// The old 1.5 s anti-reentry lock protects the loop just exited. In an arcade
// double-loop it must not suppress a different loop a short distance ahead.
const efBeforeSpecials=beforeSpecials;
beforeSpecials=function(dt){
 if(ef&&player.mode==='normal'&&player.grounded&&player.loopLock>0&&level.loops.some(o=>o!==player.loop&&o.x>=player.x&&o.x-player.x<200))player.loopLock=0;
 efBeforeSpecials(dt);
};


