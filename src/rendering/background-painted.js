const BG_SOURCES=[__GUM_DATA_URI__("assets/images/campaign/01-gum-works.webp"), __GUM_DATA_URI__("assets/images/campaign/02-soda-sewers.webp"), __GUM_DATA_URI__("assets/images/campaign/03-candy-city.webp"), __GUM_DATA_URI__("assets/images/campaign/04-freezer-district.webp"), __GUM_DATA_URI__("assets/images/campaign/05-chocolate-foundry.webp"), __GUM_DATA_URI__("assets/images/campaign/06-the-wrapper.webp"), __GUM_DATA_URI__("assets/images/campaign/07-the-mouth.webp")];
// Backgrounds are embedded below as original generated WebP artwork, never fetched from a server.
const BG_IMAGES=BG_SOURCES.map(src=>{const image=new Image();image.src=src;return image});
const originalBackground=background;
function drawIllustration(){
 const image=BG_IMAGES[levelIndex];if(profile.settings.painted===false||!image?.complete||!image.naturalWidth)return false;
 screenTransform();const p=level.palette;ctx.fillStyle=p.sky;ctx.fillRect(0,0,CW,CH);
 // Crop decorative "ground" out of the artwork: only outlined geometry in front is collidable.
 const sourceH=Math.floor(image.naturalHeight*.74),h=CH*1.15,w=image.naturalWidth*h/sourceH;
 const offset=camX*baseScale*.15,y=-CH*.07-clamp(camY*baseScale*.035,-CH*.04,CH*.05);
 const tile=Math.floor(offset/w);
 for(let i=tile-1;i<=tile+2;i++){
  const x=i*w-offset;ctx.save();ctx.translate(x,y);
  if(Math.abs(i)%2){ctx.translate(w,0);ctx.scale(-1,1)}
  ctx.drawImage(image,0,0,image.naturalWidth,sourceH,0,0,w+1,h);ctx.restore();
 }
 ctx.fillStyle=p.sky+'32';ctx.fillRect(0,0,CW,CH);
 const depth=ctx.createLinearGradient(0,CH*.28,0,CH);depth.addColorStop(0,p.sky+'00');depth.addColorStop(.65,p.sky+'55');depth.addColorStop(1,p.sky+'a0');ctx.fillStyle=depth;ctx.fillRect(0,0,CW,CH);
 // Light atmosphere is animated separately from the image for genuine parallax and motion.
 if(!reduced){for(let i=0;i<16;i++){
  const x=((i*173.2+Math.sin(i*17)*59-camX*baseScale*.28+visualT*(levelIndex===3?14:5))% (CW+80)+CW+80)%(CW+80)-40;
  const y=((i*79.1-visualT*(levelIndex===4?30:13))%(CH*.84)+CH*.84)%(CH*.84);
  ctx.globalAlpha=.14+.10*Math.sin(i+visualT);ctx.fillStyle=levelIndex===4?'#ffd391':levelIndex===3?'#edffff':'#fff5e9';
  if(levelIndex===1||levelIndex===6){ctx.lineWidth=1.1;ctx.strokeStyle=ctx.fillStyle;ctx.beginPath();ctx.arc(x,y,4+i%5*2,0,TAU);ctx.stroke()}
  else if(levelIndex===5){ctx.save();ctx.translate(x,y);ctx.rotate(visualT+i);ctx.fillStyle=['#ff9ccf','#ffeea1','#bba8ff'][i%3];ctx.fillRect(-4,-2,8,4);ctx.restore()}
  else{ctx.beginPath();ctx.arc(x,y,1+i%3*.55,0,TAU);ctx.fill()}
 }ctx.globalAlpha=1}
 // A subtle top scrim keeps the unchanged HUD readable over light painted scenery.
 const top=ctx.createLinearGradient(0,0,0,CH*.23);top.addColorStop(0,'#1410209a');top.addColorStop(1,'#14102000');ctx.fillStyle=top;ctx.fillRect(0,0,CW,CH*.23);
 return true;
}
background=function(){if(!drawIllustration())originalBackground()};
