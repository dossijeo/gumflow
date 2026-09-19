function ambient61Create(){
 if(AMBIENT61.master||!audioCtx)return;
 const a=AMBIENT61;a.master=audioCtx.createGain();a.master.gain.value=0;
 a.filter=audioCtx.createBiquadFilter();a.filter.type='lowpass';a.filter.frequency.value=15000;a.filter.Q.value=.45;
 a.master.connect(a.filter);a.filter.connect(HD.bus);a.noise=createChipNoise(audioCtx);
 a.buses=a.names.map(()=>{const g=audioCtx.createGain();g.gain.value=0;g.connect(a.master);return g});
}
function ambient61Pitch(meta,beat){
 const t=meta.beats[beat]??0;let i=0;while(i<meta.bars.length-2&&meta.bars[i+1]<=t)i++;
 const chroma=meta.barChroma[i];if(!chroma)return 0;
 // One stable, strongest pitch class of the local phrase: no independent melody.
 let pc=0;for(let j=1;j<12;j++)if(chroma[j]>chroma[pc])pc=j;return pc;
}
function ambient61Tone(ac,bus,midi,at,dur,vol,type='sine',cut=3800,slide=0,pan=0){
 const send=ac.createStereoPanner?ac.createStereoPanner():ac.createGain();if(send.pan)send.pan.value=pan;send.connect(bus);
 chipTone(ac,send,midi,at,dur,vol,type,cut,slide);
 // Disconnect the panning send when the short sound has finished. In offline rendering,
 // defer cleanup until rendering completion so timers can't remove it prematurely.
 if(!(typeof OfflineAudioContext!=='undefined'&&ac instanceof OfflineAudioContext))setTimeout(()=>send.disconnect(),Math.max(30,(at-ac.currentTime+dur+.3)*1000));
}
function ambient61Noise(ac,bus,noise,at,dur,vol,frequency=1800,q=.8,pan=0){
 const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain(),p=ac.createStereoPanner?ac.createStereoPanner():ac.createGain();
 s.buffer=noise;s.loop=true;f.type='bandpass';f.frequency.value=frequency;f.Q.value=q;if(p.pan)p.pan.value=pan;
 g.gain.setValueAtTime(.00001,at);g.gain.exponentialRampToValueAtTime(Math.max(.00002,vol),at+.009);g.gain.exponentialRampToValueAtTime(.00001,at+dur);
 s.connect(f);f.connect(g);g.connect(p);p.connect(bus);s.start(at);s.stop(at+dur+.01);
 s.onended=()=>{s.disconnect();f.disconnect();g.disconnect();p.disconnect()};
}
