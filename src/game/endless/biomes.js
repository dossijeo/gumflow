function efColour(a,b,t){const h=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];const aa=h(a),bb=h(b);return '#'+aa.map((v,i)=>Math.round(lerp(v,bb[i],t)).toString(16).padStart(2,'0')).join('')}
function efPaletteStep(dt){
 const d=efGetDistance(),index=Math.floor(d/EF_BIOME_METRES)%7;
 if(index!==ef.biome){ef.previousBiome=ef.biome;ef.biome=index;ef.blend=0;ef.blendFrom={...level.palette};levelIndex=index;toast('NUEVO BIOMA · '+EF_BIOMES[index].name);tip(EF_GAGS[Math.floor(d/EF_BIOME_METRES)%EF_GAGS.length],3)}
 ef.blend=Math.min(1,ef.blend+dt/6);const t=ease(ef.blend),to=WORLD_PALETTES[ef.biome];
 for(const key in to)level.palette[key]=efColour(ef.blendFrom[key]||to[key],to[key],t);
}
