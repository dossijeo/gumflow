function efParallaxLayer(index,baseline,height,speed,opacity=1){
 const img=EF_LAYER_IMAGES[index];if(!img?.complete||!img.naturalWidth)return;
 const h=height,w=img.naturalWidth/img.naturalHeight*h,overlap=w*.105,step=w-overlap,off=(camX+ef.offset)*baseScale*speed,first=Math.floor(off/step)-1;
 ctx.save();ctx.globalAlpha=opacity;for(let tile=first;tile<first+Math.ceil(CW/step)+3;tile++){
  const x=tile*step-off;ctx.save();ctx.translate(x,baseline-h);if(((tile%2)+2)%2){ctx.translate(w,0);ctx.scale(-1,1)}ctx.drawImage(img,0,0,w,h);ctx.restore();
 }ctx.restore();
}
function efBackdropSilhouettes(p){
 const scale=CH/700,off=(camX+ef.offset)*baseScale*.17,cell=260*scale,first=Math.floor(off/cell)-1;
 ctx.save();ctx.fillStyle=p.mid;ctx.globalAlpha=.14;
 for(let j=first;j<=first+CW/cell+2;j++){const n=efNoise(j,efHash(ef.seed)),x=j*cell-off,y=CH*.59,h=(80+n*95)*scale,w=(65+n*100)*scale;
  if(ef.biome===2){rr(x,y-h,w,h,15*scale);ctx.fill();ctx.beginPath();ctx.arc(x+w*.5,y-h,w*.52,Math.PI,0);ctx.fill()}
  else if(ef.biome===6){ctx.beginPath();ctx.ellipse(x,y-h*.35,w*.7,h*.8,.2,0,TAU);ctx.fill()}
  else{rr(x,y-h,w,h,8);ctx.fill();ctx.fillRect(x+w*.2,y-h-35*scale,w*.25,40*scale);if(ef.biome===0||ef.biome===4)ctx.fillRect(x+w*.4,y-h-120*scale,w*.18,125*scale)}
 }ctx.restore();
}
function efAirship(x,y,s=1){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle='#c787c4';ctx.strokeStyle='#825893';ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,65,23,-.04,0,TAU);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(41,-14);ctx.lineTo(63,-36);ctx.lineTo(64,-8);ctx.fill();ctx.fillStyle='#835a9f';rr(-14,20,30,10,4);ctx.fill();bgLabel(0,5,'∞ FLOW','#ffe5f1',12);ctx.restore()}
function efMovingSprites(){
 const scale=CH/700,off=(camX+ef.offset)*baseScale*.28,span=2200*scale,first=Math.floor(off/span)-1;
 for(let id=first;id<first+CW/span+3;id++){
  const chance=efNoise(id,efHash(ef.seed)+71),x=id*span-off+350*scale,y=CH*(.18+chance*.16);
  if(chance<.64)efAirship(x+(reduced?0:Math.sin(visualT*.11+id)*140)*scale,y,scale*(.35+chance*.35));
  else if(chance>.91){ctx.save();ctx.translate(x,y);ctx.rotate(Math.sin(visualT*.8+id)*.13);bossBox(-17,-28,34,51,5,'#cc8398','#684869',2);bossBox(-13,-19,21,27,3,'#c5def0',null);bgLabel(0,41,'¿LOGÍSTICA?','#fff3da',7);ctx.restore()}
 }
 // Candy train travels independently of the terrain; purely decorative.
 const trainX=((visualT*45-(camX+ef.offset)*baseScale*.25)%(CW+850)+CW+850)%(CW+850)-500;
 if(ef.biome===2||ef.biome===5){ctx.save();ctx.globalAlpha=.53;ctx.translate(trainX,CH*.5);ctx.scale(scale,scale);ctx.strokeStyle='#ba86b2';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-CW/scale,27);ctx.lineTo(CW/scale+600,27);ctx.stroke();for(let i=0;i<4;i++){bossBox(i*69,0,62,24,9,['#eaa1c6','#eaca88','#b2dca2','#e8a4b4'][i],'#665077',1);bossBox(i*69+11,4,29,10,2,'#fff1c6',null);bossCircle(i*69+13,25,4,'#534764',null);bossCircle(i*69+49,25,4,'#534764',null)}ctx.restore()}
 // Exceptionally rare cameos do not grant rewards and never block the player.
 const block=Math.floor(efGetDistance()/550),roll=efNoise(block,efHash(ef.seed)+999);
 if(roll>.97){const xx=CW*.75+Math.sin(visualT*.6)*30;ctx.save();ctx.globalAlpha=.6;ctx.translate(xx,CH*.26);ctx.scale(.55,.55);robot(0,0);bgLabel(0,-65,'OTRO LOTE. MISMO PROBLEMA.','#fff4d6',9);ctx.restore()}
}
function efDrawAtmosphere(){
 if(reduced)return;ctx.save();
 for(let i=0;i<24;i++){const r=efNoise(i,efHash(ef.seed)),off=(camX+ef.offset)*baseScale*(.22+r*.2);const x=((i*177-off+visualT*(8+r*15))%(CW+90)+CW+90)%(CW+90)-45;
  const y=((i*83+visualT*(ef.biome===3?18:-13))%(CH+50)+CH+50)%(CH+50)-25;ctx.globalAlpha=.12+r*.19;
  if(ef.biome===1||ef.biome===6){ctx.strokeStyle='#dcfaff';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(x,y,2+r*7,0,TAU);ctx.stroke()}
  else if(ef.biome===5){ctx.fillStyle=['#ffd99b','#ffc7e5','#d2bcff'][i%3];ctx.save();ctx.translate(x,y);ctx.rotate(visualT*.8+i);ctx.fillRect(-3,-2,6,4);ctx.restore()}
  else{ctx.fillStyle=ef.biome===4?'#ffd095':'#ffffff';ctx.beginPath();ctx.arc(x,y,1+r*2,0,TAU);ctx.fill()}
 }ctx.restore();
}
function efBackground(){
 screenTransform();ctx.globalAlpha=1;const a=EF_BIOMES[ef.previousBiome],b=EF_BIOMES[ef.biome],t=ease(ef.blend),sky=efColour(a.sky,b.sky,t),bottom=efColour(a.bottom,b.bottom,t);
 let grad=ctx.createLinearGradient(0,0,0,CH);grad.addColorStop(0,sky);grad.addColorStop(1,bottom);ctx.fillStyle=grad;ctx.fillRect(0,0,CW,CH);
 const lift=clamp(camY*baseScale*.025,-CH*.04,CH*.03),s=CH/700;
 efParallaxLayer(0,CH*.37-lift,CH*.35,.022,ef.biome===0?.94:.34);
 efParallaxLayer(1,CH*.58-lift,CH*.27,.07,.67);
 efBackdropSilhouettes(level.palette);
 efParallaxLayer(2,CH*.80-lift,CH*.49,.16,.88);
 efMovingSprites();
 efParallaxLayer(3,CH*1.04-lift,CH*.40,.29,.43);
 // Retint by biome, without ever baking an opaque sky into the upper layers.
 ctx.fillStyle=level.palette.sky+(ef.biome===0?'16':'55');ctx.fillRect(0,0,CW,CH);
 const dark=ctx.createLinearGradient(0,0,0,CH);dark.addColorStop(0,'#17192b95');dark.addColorStop(.22,'#15162912');dark.addColorStop(.58,'#171b3415');dark.addColorStop(1,level.palette.ground+'cd');ctx.fillStyle=dark;ctx.fillRect(0,0,CW,CH);
 efDrawAtmosphere();
}
function efNearLayers(){
 screenTransform();ctx.save();
 // Foreground kit stays below the playable character, rather than masquerading
 // as collision geometry. It has its own scroll speed and an alpha feather.
 efParallaxLayer(4,CH*1.08,CH*.21,.53,.38);
 if(!reduced){const img=EF_LAYER_IMAGES[5];if(img.complete&&img.naturalWidth){const w=CW*.78,h=w*img.naturalHeight/img.naturalWidth;ctx.globalAlpha=.075;const x=(((visualT*10-(camX+ef.offset)*baseScale*.035)%(w*2))+w*2)%(w*2)-w;ctx.drawImage(img,x,CH*.025,w,h)}}
 ctx.restore();
}
