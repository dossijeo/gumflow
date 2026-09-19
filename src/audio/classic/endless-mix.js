arrangeChipStep=function(ac,bus,noise,index,step,at,energy,boss){
 if(!ef||boss||chipPreview!==null||ef.previousBiome===ef.biome||ef.blend>=.5||ac!==audioCtx){EF_ORIGINAL.arrangeChipStep(ac,bus,noise,index,step,at,energy,boss);return}
 const t=ease(clamp(ef.blend*2,0,1));
 for(const [idx,gain] of [[ef.previousBiome,1-t],[index,t]]){if(gain<.015)continue;const mix=ac.createGain();mix.gain.value=gain;mix.connect(bus);EF_ORIGINAL.arrangeChipStep(ac,mix,noise,idx,step,at,energy,false);setTimeout(()=>mix.disconnect(),Math.max(0,(at-ac.currentTime+1.2)*1000))}
};

