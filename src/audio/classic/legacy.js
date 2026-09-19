function sound(type){if(!soundEnabled||!audioCtx)return;try{const at=audioCtx.currentTime;const seq={sugar:[880,1175],jump:[280,540],boost:[180,700],bounce:[180,480],spring:[300,1000],check:[523,659,784],hurt:[170,70],win:[523,659,784,1047],start:[330,440,660],life:[659,784,1047,1320],loop:[440,660]}[type]||[500];seq.forEach((freq,i)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type==='hurt'?'sawtooth':'sine';o.frequency.setValueAtTime(freq,at+i*.055);if(type==='jump'||type==='spring'||type==='boost')o.frequency.exponentialRampToValueAtTime(freq*1.35,at+i*.055+.1);g.gain.setValueAtTime(0,at+i*.055);g.gain.linearRampToValueAtTime(type==='sugar'?.032:.07,at+i*.055+.009);g.gain.exponentialRampToValueAtTime(.001,at+i*.055+.15);o.connect(g);g.connect(audioCtx.destination);o.start(at+i*.055);o.stop(at+i*.055+.17)})}catch(_){}}
function audioStart(){if(!soundEnabled)return;try{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{})}catch(_){soundEnabled=false}}
function music(dt){
 if(!soundEnabled||!audioCtx||state!=='playing')return;musicTime-=dt;if(musicTime>0)return;
 const roots=[130.81,146.83,164.81,123.47,110,138.59,130.81],patterns=[[0,7,12,7,3,10,14,10],[0,12,7,15,3,7,10,5],[0,4,7,12,9,7,4,2],[0,7,10,14,3,7,12,10],[0,3,7,10,0,7,12,15],[0,7,12,14,3,10,12,7],[0,4,7,12,2,7,9,16]],base=roots[levelIndex],step=musicTick++;
 musicTime=[.19,.205,.17,.24,.205,.185,.18][levelIndex];
 try{const at=audioCtx.currentTime;const note=(freq,type,vol,dur,delay=0)=>{const o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,at+delay);g.gain.linearRampToValueAtTime(vol,at+delay+.008);g.gain.exponentialRampToValueAtTime(.0001,at+delay+dur);o.connect(g);g.connect(audioCtx.destination);o.start(at+delay);o.stop(at+delay+dur+.01)};
  note(base*Math.pow(2,patterns[levelIndex][step%8]/12),'triangle',.018,.18);
  if(step%4===0)note(base*.5,'sine',.035,.23);
  if(flow>35&&step%2===0)note(50,'sine',.025,.08);
  if(flow>65)note(base*4*Math.pow(2,patterns[levelIndex][(step+2)%8]/12),'sine',.009,.11,.035);
 }catch(_){}
}

