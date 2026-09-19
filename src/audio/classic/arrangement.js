function arrangeChipStep(ac,bus,noise,index,step,at,energy=30,boss=false){
 const t=SCORE_TRACKS[index],d=60/(t.bpm+(boss?12:0))/4,bar=Math.floor(step/16)%32,k=step%16;
 const scale=t.mode==='major'?[0,2,4,5,7,9,11]:t.mode==='dorian'?[0,2,3,5,7,9,10]:[0,2,3,5,7,8,10];
 const degree=n=>scale[((n%7)+7)%7]+Math.floor(n/7)*12;
 const progression=t.mode==='major'?[0,5,3,4]:[0,5,2,6];const chord=progression[Math.floor(bar/2)%4],root=t.key+degree(chord);
 const bridge=bar>=20&&bar<24&&!boss,chorus=(bar>=12&&bar<20)||bar>=24||boss;
 // Kick + snare/backbeat. The breakbeat retains a complete rhythm at FLOW zero.
 const kicks=t.drum==='four'?[0,4,8,12]:[0,6,8,10];
 if((!bridge&&kicks.includes(k))||(bridge&&k===0))chipKick(ac,bus,at,boss?.32:.25);
 if(k===4||k===12||((bar%4===3)&&k>=14)){
  chipNoiseHit(ac,bus,noise,at,.12,.105,1150);chipTone(ac,bus,43,at,.10,.11,'triangle',1400,-3);
 }
 if(k%2===0||((energy>62||boss)&&k%4===3))chipNoiseHit(ac,bus,noise,at,k===14?.105:.026,k%4===0?.04:.026,6500);
 if(bar%8===0&&k===0)chipNoiseHit(ac,bus,noise,at,.23,.044,5000);
 // Syncopated bass with octave answers and short fills at the end of phrases.
 if([0,3,6,8,10,14].includes(k)&&(!bridge||k%8===0)){
  const n=root-12+(k===6||k===14?12:0)+(k===14&&bar%4===3?degree(6)-degree(chord):0);
  chipTone(ac,bus,n,at,d*(k===0?2.6:1.3),.13,t.bass,900,boss&&k===14?-2:0);
 }
 // Soft chord stabs, always harmonically within the current scale.
 if([0,7,10].includes(k)&&!bridge){for(const a of [0,2,4])chipTone(ac,bus,t.key+degree(chord+a),at,d*1.55,.023,'triangle',2100)}
 const riff=CHIP_RIFFS[t.pattern],r=riff[(k+(bar%4===2?4:0))%16];
 if(r>=0&&(!bridge||k%4===0)){
  const variation=bar%8>=4?1:0,n=t.key+12+degree(r+variation)+(chorus&&bar%4>=2?12:0);
  chipTone(ac,bus,n,at,d*(k%2===0?1.7:1.05),.066,t.lead,chorus?4100:3100);
  if(energy>42||chorus)chipTone(ac,bus,n,at+d*2.9,d*1.3,.016,'triangle',2800);
  if(boss&&k%4===0)chipTone(ac,bus,n-12,at,d*1.5,.024,'sawtooth',1600);
 }
 if(energy>64||boss||bridge){const a=[0,2,4,6][k%4];chipTone(ac,bus,t.key+24+degree(chord+a),at,d*.65,bridge?.025:.014,'triangle',5000)}
}
