function drawNPCs(){
 for(const n of level.npcs){if(!visible(n.x,200))continue;const y=groundAt(level,n.x).y;ctx.save();ctx.translate(n.x,y);
  if(n.type==='chew'){
   ctx.fillStyle=level.palette.edge2;rr(-8,-110,16,115,6);ctx.fill();ctx.fillStyle='#24374a';ctx.strokeStyle=level.palette.accent;ctx.lineWidth=2;rr(-58,-194,116,84,12);ctx.fill();ctx.stroke();ctx.fillStyle='#d1eef0';rr(-24,-151,48,31,7);ctx.fill();ctx.fillStyle='#b3c4d4';ctx.beginPath();ctx.arc(0,-168,19,0,TAU);ctx.fill();ctx.fillStyle='#e5bda3';ctx.beginPath();ctx.arc(0,-160,16,0,TAU);ctx.fill();ctx.strokeStyle='#596584';ctx.lineWidth=2;ctx.strokeRect(-14,-166,12,9);ctx.strokeRect(2,-166,12,9);ctx.strokeStyle='#b36b74';ctx.beginPath();ctx.arc(0,-154,5,0,Math.PI);ctx.stroke();bgLabel(0,-204,'DR. CHEW · RADIO',level.palette.accent,8);
  }else if(n.type==='bubble'){
   const t=n.said?Math.min(2,levelTime-n.time):0,dx=t<.8?t*150:120;ctx.translate(dx,0);ctx.fillStyle='#4a3a60';rr(151,-100,10,110,4);ctx.fill();ctx.save();ctx.translate(t>.8?145:0,-27);if(t>.8)ctx.scale(.28,1.6);ctx.fillStyle='#99dce9';ctx.strokeStyle='#477684';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,0,24,25,0,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#fffde9';ctx.beginPath();ctx.ellipse(-5,-5,6,8,0,0,TAU);ctx.ellipse(9,-5,6,8,0,0,TAU);ctx.fill();ctx.fillStyle='#3e4665';ctx.beginPath();ctx.arc(-2,-3,2.7,0,TAU);ctx.arc(12,-3,2.7,0,TAU);ctx.fill();ctx.strokeStyle='#3e4665';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-13,-13);ctx.lineTo(2,-10);ctx.stroke();ctx.beginPath();ctx.arc(4,6,8,0,Math.PI*.8);ctx.stroke();ctx.restore();bgLabel(0,-65,'BUBBLE','#b4eff3',9);if(t>.8)bgLabel(139,-112,'SPLAT.','#dff3ff',9);
  }else{
   ctx.fillStyle=level.palette.mid;rr(-60,-5,140,17,7);ctx.fill();ctx.fillStyle='#384454';rr(-15,-47,32,46,8);ctx.fill();ctx.fillStyle='#d4d3b4';rr(-19,-78,40,18,6);ctx.fill();ctx.fillStyle='#d6ad93';ctx.beginPath();ctx.arc(1,-59,14,0,TAU);ctx.fill();ctx.fillStyle='#423644';ctx.fillRect(-7,-62,3,3);ctx.fillRect(5,-62,3,3);
   const t=n.said?Math.min(3,levelTime-n.time):0;ctx.strokeStyle='#d6ad93';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(15,-32);ctx.lineTo(29,-46);ctx.stroke();ctx.save();ctx.translate(t?35+t*33:33,t?-51-t*70+t*t*40:-47);ctx.rotate(t*4);ctx.fillStyle='#e9e6df';rr(-8,-10,17,21,4);ctx.fill();ctx.strokeStyle='#e9e6df';ctx.lineWidth=3;ctx.strokeRect(8,-6,6,9);if(t){ctx.fillStyle='#b57b56';for(let j=0;j<5;j++){ctx.beginPath();ctx.arc(j*8-12,-15+j*j*3,3,0,TAU);ctx.fill()}}ctx.restore();bgLabel(0,-100,'PAUSA CAFÉ','#d6c9bb',8);
  }
  ctx.restore();
 }
}
function drawProps(){
 for(const pr of level.props){if(!visible(pr.x,230))continue;ctx.save();ctx.translate(pr.x,pr.y);
  if(pr.type==='vending'){
   ctx.fillStyle='#252333';ctx.strokeStyle='#caadc9';ctx.lineWidth=3;rr(-42,-115,84,155,10);ctx.fill();ctx.stroke();ctx.fillStyle='#ab709d';rr(-35,-107,70,28,5);ctx.fill();bgLabel(0,-89,'SNACKS','#fff1db',11);ctx.fillStyle='#5e728275';rr(-32,-70,44,67,5);ctx.fill();for(let r=0;r<3;r++)for(let j=0;j<3;j++){ctx.fillStyle=['#dfc48c','#ec9fbd','#a5cdbd'][(r+j)%3];rr(-25+j*11,-62+r*20,7,12,3);ctx.fill()}ctx.fillStyle='#bbaac3';for(let j=0;j<4;j++)ctx.fillRect(20,-57+j*12,7,5);ctx.fillStyle='#0f1825';rr(-25,9,50,18,5);ctx.fill();bgLabel(0,60,levelIndex===6?'¿CÓMO HAS LLEGADO AQUÍ?':'ABIERTO. INEXPLICABLEMENTE.','#eacbe1',8);
  }else{
   ctx.strokeStyle=level.palette.edge2+'aa';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,175);ctx.stroke();ctx.fillStyle='#1e1e32e0';ctx.strokeStyle=level.palette.accent+'55';ctx.lineWidth=2;rr(-119,-39,238,60,9);ctx.fill();ctx.stroke();bgLabel(0,-13,pr.text,level.palette.accent,9);bgLabel(0,6,'GUMCORP · SU BIENESTAR ES OPCIONAL','#c4bacb',6.8);
  }
  ctx.restore();
 }
}

