let chipBus=null,fxBus=null,audioMeter=null,chipNoise=null,chipTicker=null,chipNext=0,chipStep=0,chipSong=-1,chipBoss=false,chipMuted=true,chipPreview=null;
const midiHz=n=>440*Math.pow(2,(n-69)/12);
function createChipNoise(ac){const b=ac.createBuffer(1,Math.ceil(ac.sampleRate*.25),ac.sampleRate),d=b.getChannelData(0);let seed=12345;for(let i=0;i<d.length;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=seed/2147483648-1}return b}
function chipTone(ac,bus,midi,when,dur,vol,type='square',cut=3600,slide=0){
 const o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(midiHz(midi),when);if(slide)o.frequency.exponentialRampToValueAtTime(midiHz(midi+slide),when+dur);
 f.type='lowpass';f.frequency.setValueAtTime(cut,when);f.Q.value=.45;
 g.gain.setValueAtTime(.0001,when);g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),when+.003);g.gain.setValueAtTime(Math.max(.0002,vol*.65),when+Math.min(.045,dur*.4));g.gain.exponentialRampToValueAtTime(.0001,when+dur);
 o.connect(f);f.connect(g);g.connect(bus);o.start(when);o.stop(when+dur+.008);o.onended=()=>{o.disconnect();f.disconnect();g.disconnect()};
}
function chipNoiseHit(ac,bus,buffer,when,dur,vol,hp=2500){const s=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();s.buffer=buffer;f.type='highpass';f.frequency.value=hp;g.gain.setValueAtTime(vol,when);g.gain.exponentialRampToValueAtTime(.0001,when+dur);s.connect(f);f.connect(g);g.connect(bus);s.start(when);s.stop(when+dur+.005);s.onended=()=>{s.disconnect();f.disconnect();g.disconnect()}}
function chipKick(ac,bus,at,vol=.28){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(145,at);o.frequency.exponentialRampToValueAtTime(43,at+.095);g.gain.setValueAtTime(vol,at);g.gain.exponentialRampToValueAtTime(.0001,at+.19);o.connect(g);g.connect(bus);o.start(at);o.stop(at+.21);o.onended=()=>{o.disconnect();g.disconnect()}}
