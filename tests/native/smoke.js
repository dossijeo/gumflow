(async()=>{
 const r=window.__gfNativeReport={done:false,errors:[],tracks:[],worlds:[],bosses:[],endless:[]};
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const wait=async(fn,name,seconds=15)=>{const start=performance.now();while(!fn()){if(performance.now()-start>seconds*1000)throw new Error('Timed out: '+name);await sleep(100);}};
 const check=(v,message)=>{if(!v)throw new Error(message)};
 addEventListener('error',e=>r.errors.push(e.message));
 addEventListener('unhandledrejection',e=>r.errors.push(String(e.reason)));
 try {
  const t=window.__gumTest;check(t,'GUMFLOW did not initialize');
  r.initial=t.hdInfo();r.savedSettings=t.profile().settings;
  check(r.savedSettings.sound!==false&&r.savedSettings.musicOn!==false,'Fresh profile is muted');
  // No click, synthetic key, preview call or audio(true) before this assertion.
  await wait(()=>t.hdInfo().current?.key==='menu'&&t.hdAudioLevel()?.rms>0.0001,'default title audio');
  r.startup={info:t.hdInfo(),pcm:t.hdAudioLevel()};
  const decoded=await t.hdLoadAll();check(!decoded.error,'MP3 decode failed: '+decoded.error);
  for(const key of ['menu','everyday','tension','epic']) {
   t.hdPreview(key);
   await wait(()=>t.hdInfo().current?.key===key && t.hdAudioLevel()?.rms>0.0001,'HD track '+key);
   await sleep(250);r.tracks.push({key,pcm:t.hdAudioLevel(),info:t.hdInfo()});
  }
  t.hdStopPreview();
  for(let i=0;i<7;i++) {
   t.start(i);const a=t.snapshot();const b=t.step(150,{right:true});
   check(Number.isFinite(b.x)&&b.x>a.x+10,'No movement in world '+i);r.worlds.push({i,x:b.x});
   t.bossTrial(i);const c=t.step(140,{right:true});check(c.boss?.active,'Boss not active '+i);
   r.bosses.push({i,hp:c.boss.hp,phase:c.boss.phase});
  }
  for(const relax of [false,true]) {
   t.endless(relax,'LINUX-SMOKE');const a=t.endlessSnapshot();t.step(150,{right:true});const b=t.endlessSnapshot();
   check(b.x>a.x && b.endless.relax===relax,'Endless failed');r.endless.push({relax,x:b.x});
   t.endlessFinish('Linux smoke test');t.menu();
  }
  t.start(0);t.audio(true);t.hdStyle('classic');
  await wait(()=>t.audioInfo().peak>0.00001,'classic synthesized audio');r.classic=t.audioInfo();
  t.hdStyle('adaptive');t.audio(true);await wait(()=>t.hdAudioLevel()?.rms>0.0001,'adaptive resumed');
  t.pause();await sleep(350);check(t.snapshot().state==='paused','Pause failed');
  t.pause();await sleep(350);check(t.snapshot().state==='playing','Resume failed');
  r.final=t.snapshot();
 }catch(e){r.errors.push(String(e));}
 r.done=true;
})();
JSON.stringify(window.__gfNativeReport)
