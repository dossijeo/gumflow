// A tiny hand-drawn vector art kit: no spritesheets or external assets.
function bgLabel(x,y,text,color='#fff4db',size=10){ctx.save();ctx.fillStyle=color;ctx.font=`850 ${size}px system-ui`;ctx.textAlign='center';ctx.fillText(text,x,y);ctx.restore()}
function starPath(x,y,r){ctx.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rrr=i%2?r*.46:r;const xx=x+Math.cos(a)*rrr,yy=y+Math.sin(a)*rrr;if(i===0)ctx.moveTo(xx,yy);else ctx.lineTo(xx,yy)}ctx.closePath()}
function drawAim(x,y,a,len){ctx.save();ctx.strokeStyle='#fff5c9c9';ctx.fillStyle='#fff5c9';ctx.lineWidth=3;ctx.setLineDash([6,7]);ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.stroke();ctx.setLineDash([]);ctx.translate(x+Math.cos(a)*len,y+Math.sin(a)*len);ctx.rotate(a);ctx.beginPath();ctx.moveTo(9,0);ctx.lineTo(-6,-7);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();ctx.restore()}
function drawMaterials(){
 for(const m of level.materials){if(!visible(m.x,m.w+40))continue;const info=MATERIALS[m.type];ctx.save();ctx.strokeStyle=info.color;ctx.lineWidth=m.type==='tongue'?22:13;ctx.lineCap='round';ctx.beginPath();for(let x=m.x;x<=m.x+m.w;x+=12){const y=groundAt(level,x).y-3;if(x===m.x)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.stroke();
  ctx.strokeStyle='#ffffff88';ctx.lineWidth=2;ctx.stroke();
  for(let x=m.x+20;x<m.x+m.w;x+=40){const y=groundAt(level,x).y;ctx.save();ctx.translate(x,y);ctx.rotate(Math.atan(groundAt(level,x).slope));
   if(m.type==='sugar'||m.type==='flour'){ctx.fillStyle=info.color;for(let j=0;j<3;j++){rr(j*7-8,-13-j%2*3,4,4,1);ctx.fill()}}
   else if(m.type==='ice'){ctx.strokeStyle='#e0faffcc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,8);ctx.lineTo(6,2);ctx.stroke()}
   else if(m.type==='gel'||m.type==='tongue'){ctx.fillStyle=info.color+'85';ctx.beginPath();ctx.ellipse(0,-5,13,8+Math.sin(visualT*4+x)*2,0,Math.PI,0);ctx.fill()}
   else if(m.type==='chocolate'||m.type==='caramel'){ctx.fillStyle=info.color;rr(-3,2,8,20+(x%17),5);ctx.fill()}
   else if(m.type==='chile'){ctx.fillStyle='#ffb587';ctx.beginPath();ctx.moveTo(-6,-8);ctx.lineTo(0,-20);ctx.lineTo(6,-8);ctx.fill()}
   ctx.restore();
  }
  bgLabel(m.x+Math.min(m.w/2,160),groundAt(level,m.x+Math.min(m.w/2,160)).y+42,info.name,info.color,8);ctx.restore();
 }
 // The terrain retains the readable edges of V1, with world-specific decorative details.
 const left=Math.max(0,camX-50),right=Math.min(level.length,camX+worldW+60);
 if(levelIndex===2){for(let x=Math.floor(left/73)*73;x<right;x+=73){if(inGap(level,x))continue;const y=groundAt(level,x).y;ctx.save();ctx.translate(x,y+39+(x%37));ctx.rotate(x%5);ctx.fillStyle=['#ed96b344','#94ecda44','#ffd78744'][Math.abs(Math.floor(x/73))%3];rr(-3,-8,6,16,3);ctx.fill();ctx.restore()}}
 if(levelIndex===4){for(let x=Math.floor(left/90)*90;x<right;x+=90){if(inGap(level,x))continue;ctx.fillStyle='#b5755350';rr(x,groundAt(level,x).y+11,14,30+x%47,8);ctx.fill()}}
 if(levelIndex===6){for(let x=Math.floor(left/65)*65;x<right;x+=65){if(inGap(level,x))continue;ctx.fillStyle='#f19db344';ctx.beginPath();ctx.ellipse(x,groundAt(level,x).y+29,12,6,0,0,TAU);ctx.fill()}}
}
function drawPools(){
 for(const po of level.pools){if(!visible(po.x,po.w+40))continue;const y=groundAt(level,po.x+po.w*.5).y;
  const color=po.type==='chocolate'?'#b1745099':po.type==='freeze'?'#91d6e27a':'#bda0ff5e';ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(po.x,y+14);for(let x=po.x;x<=po.x+po.w;x+=12)ctx.lineTo(x,y-38+Math.sin(x*.025+visualT*2)*5);ctx.lineTo(po.x+po.w,y+14);ctx.closePath();ctx.fill();ctx.strokeStyle='#eaffff55';ctx.lineWidth=2;ctx.stroke();
  for(let i=0;i<6;i++){const xx=po.x+30+i*(po.w-60)/6;ctx.strokeStyle='#ffffff55';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(xx,y-12-((visualT*13+i*9)%35),4+i%3,0,TAU);ctx.stroke()}
  const fr=level.frozen.find(f=>f.pool===po&&f.time>0);if(fr){ctx.fillStyle='#c6f8ffd9';rr(po.x,y-76,po.w,13,5);ctx.fill();ctx.strokeStyle='#f1ffff';ctx.lineWidth=2;ctx.stroke();bgLabel(po.x+po.w*.5,y-90,'PASARELA MENTA · '+Math.ceil(fr.time)+'s','#d8fcff',9)}
 }
}
function drawGadgets(){
 for(const a of level.anchors){if(!visible(a.x))continue;ctx.save();ctx.translate(a.x,a.y);
  const col=a.type==='sling'?level.palette.accent:'#ffc48a';ctx.strokeStyle=col+'66';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,70);ctx.lineTo(0,groundAt(level,a.x).y-a.y+35);ctx.stroke();
  if(a.type==='sling'){
   ctx.strokeStyle='#152638';ctx.lineWidth=20;ctx.beginPath();ctx.moveTo(0,-72);ctx.lineTo(0,72);ctx.stroke();ctx.strokeStyle=col;ctx.lineWidth=12;ctx.stroke();
   if(player.mode!=='anchor'||player.anchor!==a){ctx.strokeStyle='#ff99c2';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,-62);ctx.quadraticCurveTo(-35,0,0,62);ctx.stroke()}
   for(const y of [-62,62]){ctx.fillStyle='#213a48';ctx.beginPath();ctx.arc(0,y,15,0,TAU);ctx.fill();ctx.strokeStyle=col;ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#fff5d4';ctx.beginPath();ctx.arc(0,y,4,0,TAU);ctx.fill()}
  }else{
   ctx.fillStyle='#825342';rr(-12,-75,24,151,12);ctx.fill();ctx.fillStyle='#f2b17a';rr(-19,-70,25,140,11);ctx.fill();ctx.fillStyle='#ffe1a866';for(let yy=-55;yy<60;yy+=27){ctx.beginPath();ctx.arc(-9,yy,5,0,TAU);ctx.fill()}
  }
  ctx.strokeStyle=col+'55';ctx.lineWidth=1.5;ctx.setLineDash([4,8]);ctx.beginPath();ctx.arc(0,0,a.type==='sling'?100:76,0,TAU);ctx.stroke();ctx.setLineDash([]);
  bgLabel(0,-103,a.type==='sling'?'TIRACHINAS':'ADHESIÓN',col,10);bgLabel(0,-88,'MANTÉN CHICLE',col,8);ctx.restore();
 }
 for(const b of level.bubbles){if(!visible(b.x)||b.lock>0)continue;ctx.save();ctx.translate(b.x,b.y);const grd=ctx.createRadialGradient(-15,-17,2,0,0,b.r);grd.addColorStop(0,'#f3e0ff30');grd.addColorStop(.72,'#c3c5ff08');grd.addColorStop(1,'#e5cbff60');ctx.fillStyle=grd;ctx.strokeStyle='#c6ecffc2';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,b.r,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#ffffffb3';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,b.r-8,3.7,4.5);ctx.stroke();ctx.fillStyle='#ffffff7a';ctx.beginPath();ctx.arc(13,27,3,0,TAU);ctx.fill();bgLabel(0,b.r+20,'BURBUJA ↑','#e4e0ff',8);ctx.restore()}
 for(const w of level.winds){if(!visible(w.x,w.w+100))continue;const color=w.hot?'#ffc58b':w.vacuum?'#d5beff':level.palette.accent;ctx.save();ctx.fillStyle=color+'0c';rr(w.x,w.y,w.w,w.h,20);ctx.fill();ctx.strokeStyle=color+'55';ctx.lineWidth=2;
  for(let i=0;i<9;i++){const x=w.x+25+i*(w.w-50)/9,y=w.y+((i*81-visualT*(w.final?270:160))%w.h+w.h)%w.h;ctx.beginPath();ctx.moveTo(x,y+40);ctx.quadraticCurveTo(x+14,y+20,x,y);ctx.stroke();ctx.beginPath();ctx.moveTo(x-5,y+7);ctx.lineTo(x,y);ctx.lineTo(x+7,y+8);ctx.stroke()}
  const g=groundAt(level,w.x+w.w*.5).y;ctx.fillStyle='#293448';rr(w.x+w.w*.5-50,g-12,100,30,10);ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(w.x+w.w*.5,g+2,37,10,0,0,TAU);ctx.stroke();bgLabel(w.x+w.w*.5,g+42,w.final?'ACHÍS / PROPULSIÓN':w.hot?'CALOR · ELASTICIDAD':w.vacuum?'VACÍO EXISTENCIAL':'CORRIENTE ↑',color,9);ctx.restore();
 }
 for(const g of level.gates){if(g.broken||!visible(g.x))continue;const y=groundAt(level,g.x).y;ctx.fillStyle=g.type==='acid'?'#c3b153':'#b98963';rr(g.x-g.w/2,y-112,g.w,112,9);ctx.fill();ctx.strokeStyle=g.type==='acid'?'#fff1a8':'#f4cca5';ctx.lineWidth=3;ctx.stroke();for(let j=0;j<4;j++){ctx.strokeStyle='#67423d44';ctx.lineWidth=2;ctx.strokeRect(g.x-g.w/2+9,y-103+j*25,g.w-18,17)}bgLabel(g.x,y-131,g.type==='acid'?'LIMÓN →':'SANDÍA ↓',g.type==='acid'?'#fff39d':'#b7ffa8',10)}
 for(const m of level.presses){if(!visible(m.x))continue;const y=groundAt(level,m.x).y,phase=.5+.5*Math.sin(levelTime*2.5+m.x),base=y-230;ctx.save();ctx.translate(m.x,y);
  ctx.fillStyle=level.palette.mid;rr(-m.w/2-20,-255,m.w+40,30,9);ctx.fill();for(const xx of [-m.w/2-13,m.w/2+7]){ctx.fillStyle=level.palette.edge2;rr(xx,-240,7,240,3);ctx.fill()}
  if(m.type==='roller'||m.type==='cutter'){
   for(const cy of [-53,-111]){ctx.fillStyle=m.type==='cutter'?'#bbb3d8':'#dba5b9';rr(-m.w/2,cy,m.w,36,15);ctx.fill();ctx.strokeStyle='#fff8';ctx.lineWidth=2;ctx.stroke();for(let xx=-m.w/2+12;xx<m.w/2;xx+=19){ctx.strokeStyle='#66527388';ctx.beginPath();ctx.moveTo(xx,cy+4);ctx.lineTo(xx+6*Math.sin(levelTime*12),cy+31);ctx.stroke()}}
  }else if(m.type==='wrapper'){
   ctx.fillStyle='#b59eca';rr(-m.w/2,-168,m.w,118,13);ctx.fill();ctx.fillStyle='#28243b';rr(-m.w/2+17,-126,m.w-34,67,8);ctx.fill();ctx.fillStyle='#d4b4df80';ctx.fillRect(-m.w/2+22,-91,m.w-44,42);bgLabel(0,-140,'ABREFÁCIL*','#f8e7ff',11);
  }else{
   const py=-170+phase*105;ctx.fillStyle='#977588';ctx.fillRect(-9,-230,18,230+py);ctx.fillStyle=m.type==='tooth'?'#fff1dd':'#e2abc7';rr(-m.w/2,py,m.w,53,13);ctx.fill();ctx.fillStyle='#ffffff44';rr(-m.w/2+8,py+4,m.w-16,7,4);ctx.fill();
  }
  bgLabel(0,-269,m.type==='tooth'?'CONTROL DENTAL':m.type==='cutter'?'FORMATO CUBITOS':m.type==='wrapper'?'ENVASADO':m.type==='roller'?'LAMINADO':'CONTROL DE GROSOR',level.palette.accent,8);ctx.restore();
 }
}
