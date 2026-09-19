function bossCircle(x,y,r,fill,stroke='#172032',line=3){ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke()}}
function bossBox(x,y,w,h,r,fill,stroke='#172032',line=3){rr(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke()}}
function bossBolt(x,y){bossCircle(x,y,4,'#d5e5e3','#293d4a',1.5);ctx.strokeStyle='#293d4a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-2,y-1);ctx.lineTo(x+2,y+1);ctx.stroke()}
function bossEyes(x,y,space=19){for(const dir of [-1,1]){bossCircle(x+space*dir,y,13,'#fff6dd','#213544',2);bossCircle(x+space*dir-3,y+2,5,'#202437',null)}}
function bossModel(b){
 const t=levelTime,ang=b.phase==='warning'?Math.sin(t*18)*.035:Math.sin(t*2)*.025;
 ctx.save();ctx.translate(b.x,b.y);ctx.rotate(ang);if(b.index===2&&b.phase==='attack')ctx.scale(1.1,.72);
 ctx.shadowColor='#15102466';ctx.shadowBlur=18;ctx.shadowOffsetY=12;
 if(b.defeated){ctx.globalAlpha=clamp(1-b.t*.22,.25,1);ctx.rotate(Math.min(b.t*.12,.35))}
 const metal=ctx.createLinearGradient(-100,-90,100,95);metal.addColorStop(0,'#688499');metal.addColorStop(.43,'#354c64');metal.addColorStop(1,'#1a263e');
 switch(b.index){
 case 0:{
  for(const side of [-1,1]){ctx.strokeStyle='#142031';ctx.lineWidth=24;ctx.beginPath();ctx.moveTo(side*96,-12);ctx.lineTo(side*147,35);ctx.lineTo(side*155,108);ctx.stroke();ctx.strokeStyle='#97a9aa';ctx.lineWidth=13;ctx.stroke();bossCircle(side*147,35,17,'#869fa4');bossBox(side*155-31,89,62,26,7,'#454760');for(let j=0;j<3;j++)bossBox(side*155-23+j*18,109,11,17,2,'#b8c8c5')}
  bossBox(-109,-82,218,150,25,metal,'#132032',5);bossBox(-82,-60,164,66,12,'#142638','#89a9b0',3);bossEyes(0,-30,29);ctx.strokeStyle='#ff9d8f';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-50,-48);ctx.lineTo(-12,-36);ctx.moveTo(12,-36);ctx.lineTo(50,-48);ctx.stroke();
  bossBox(-86,59,172,24,5,'#f9cf6d');ctx.save();rr(-84,61,168,20,4);ctx.clip();for(let x=-100;x<100;x+=28){ctx.fillStyle='#26313b';ctx.beginPath();ctx.moveTo(x,56);ctx.lineTo(x+13,56);ctx.lineTo(x+37,90);ctx.lineTo(x+24,90);ctx.fill()}ctx.restore();for(const x of [-94,94])for(const y of [-67,51])bossBolt(x,y);
  ctx.strokeStyle='#b4d9d7';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-83);ctx.lineTo(0,-109);ctx.stroke();bossCircle(0,-114,9,b.phase==='open'?'#b9ff93':'#ff967c');break;
 }
 case 1:{
  ctx.save();ctx.rotate(Math.sin(t*5)*.06);bossBox(-33,-127,66,36,8,'#ee627c','#502839',4);for(let x=-26;x<30;x+=9){ctx.strokeStyle='#fbb6b7';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,-121);ctx.lineTo(x,-97);ctx.stroke()}
  bossBox(-25,-98,50,45,11,'#94c8caaa');bossBox(-80,-72,160,183,41,'#78b7a96b','#c6f8e6',4);ctx.save();rr(-75,-67,150,172,36);ctx.clip();ctx.fillStyle='#cf8545';ctx.fillRect(-90,-18,180,150);ctx.fillStyle='#f2c67f';for(let i=0;i<7;i++)bossCircle(-65+i*22,-20+Math.sin(t*3+i)*6,17,'#f8d9a4',null);ctx.fillStyle='#fff4d529';ctx.fillRect(-62,-45,16,126);ctx.restore();bossEyes(0,-47,22);bossBox(-81,8,162,61,10,'#6b3955','#3b2440',3);bgLabel(0,88,'NO AGITAR','#ffe7a1',12);ctx.restore();break;
 }
 case 2:{
  const grad=ctx.createRadialGradient(-28,-55,5,0,0,99);grad.addColorStop(0,'#efbdff');grad.addColorStop(.65,'#b973ed');grad.addColorStop(1,'#8050c7');
  ctx.beginPath();ctx.ellipse(0,0,89+Math.sin(t*4)*3,86,0,0,TAU);ctx.fillStyle=grad;ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#402a62';ctx.stroke();ctx.strokeStyle='#9b68d2';ctx.lineWidth=17;ctx.lineCap='round';for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(side*75,15);ctx.lineTo(side*109,-8);ctx.stroke();bossBox(side*47-25,72,57,23,12,'#eef1dc','#463159',3)}
  bossBox(-61,-45,122,35,12,'#27283e');bossBox(-55,-40,45,20,6,'#99f0f0',null);bossBox(10,-40,45,20,6,'#99f0f0',null);ctx.fillStyle='#ffffff50';ctx.fillRect(-47,-39,7,18);ctx.fillRect(18,-39,7,18);ctx.strokeStyle='#583277';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-2,23,.15,Math.PI-.15);ctx.stroke();bossCircle(-39,-61,12,'#efd3ff77',null);break;
 }
 case 3:{
  bossBox(-97,-98,194,188,25,metal,'#19394b',5);bossCircle(0,-23,68,'#102c46','#b2f4fb',5);
  ctx.save();ctx.translate(0,-23);ctx.rotate(t*(b.phase==='open'?1:8));for(let i=0;i<6;i++){ctx.rotate(TAU/6);ctx.beginPath();ctx.moveTo(2,0);ctx.quadraticCurveTo(68,-31,56,14);ctx.lineTo(9,10);ctx.closePath();ctx.fillStyle=i%2?'#87cde2':'#d0f8ff';ctx.fill()}ctx.restore();
  for(const x of [-73,73])for(const y of [-75,69])bossBolt(x,y);
  ctx.fillStyle='#d6f7ff';for(let i=0;i<7;i++){const x=-91+i*28;ctx.beginPath();ctx.moveTo(x,-92);ctx.lineTo(x+13,-92);ctx.lineTo(x+6,-65+i%3*8);ctx.fill()}
  bossBox(-78,57,54,18,5,'#a2f4ff');bgLabel(-51,70,'-40°','#254564',11);bossBox(38,57,42,18,4,b.phase==='open'?'#ffd79a':'#6cd4e0');break;
 }
 case 4:{
  ctx.strokeStyle='#37212a';ctx.lineWidth=35;ctx.beginPath();ctx.moveTo(60,-19);ctx.lineTo(137,-123);ctx.stroke();ctx.strokeStyle='#b87a59';ctx.lineWidth=23;ctx.stroke();ctx.strokeStyle='#e7b18a';ctx.lineWidth=5;ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,-18,113,61,0,0,TAU);ctx.fillStyle='#e1a071';ctx.fill();ctx.strokeStyle='#523139';ctx.lineWidth=5;ctx.stroke();
  ctx.beginPath();ctx.ellipse(0,-27,99,41,0,0,TAU);ctx.fillStyle='#422d30';ctx.fill();ctx.beginPath();ctx.ellipse(-7,-31,85,31,-.07,0,TAU);ctx.fillStyle='#89462e';ctx.fill();ctx.strokeStyle='#e4a473';ctx.lineWidth=3;ctx.stroke();
  ctx.beginPath();ctx.moveTo(-105,-1);ctx.bezierCurveTo(-108,94,105,94,106,-1);ctx.closePath();ctx.fillStyle='#ac7258';ctx.fill();ctx.lineWidth=5;ctx.strokeStyle='#4b2d32';ctx.stroke();bossEyes(0,-35,28);for(const x of [-81,-57,57,81])bossBolt(x,13);bgLabel(0,66,'85% DRAMA','#ffe7bd',10);break;
 }
 case 5:{
  bossBox(-113,-73,226,158,20,metal,'#27243f',5);bossCircle(-77,-89,40,'#ecb6d7','#493251',5);bossCircle(-77,-89,20,'#c66a9f');bossCircle(-77,-89,7,'#483154');bossCircle(68,-90,40,'#cfb1fd','#47324e',5);bossCircle(68,-90,20,'#8f76c3');bossCircle(68,-90,7,'#43365f');
  bossBox(-80,-50,160,40,8,'#252039','#8e9da9',3);ctx.fillStyle='#f4ead1';for(let x=-63;x<71;x+=23){ctx.fillRect(x,-46,13,11);ctx.fillRect(x,-27,13,11)}
  bossBox(-72,-2,144,91,7,'#ceaa82','#805a54',3);bossBox(-11,-3,22,93,0,'#ea8dc5',null);bossBox(-73,27,146,15,0,'#f4a9ce',null);bgLabel(0,76,'ABREFÁCIL*','#51324b',10);for(const x of [-97,97])for(const y of [-54,64])bossBolt(x,y);break;
 }
 case 6:{
  bossBox(73,-33,153,54,23,'#a7d6e3','#33556c',5);bossBox(151,-23,44,35,12,'#668cac',null);
  bossBox(-125,-51,225,85,25,'#e6f7ee','#43687b',5);ctx.save();rr(-121,-47,217,77,23);ctx.clip();for(let x=-115;x<90;x+=15){ctx.fillStyle=x%2?'#77c8d6':'#b7e8df';ctx.fillRect(x,-11,9,53);ctx.strokeStyle='#efffff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+3,-7);ctx.lineTo(x+3,31);ctx.stroke()}ctx.restore();
  bossBox(-63,-72,106,34,12,'#456b87');bossEyes(-11,-55,23);bossCircle(67,-21,10,b.phase==='open'?'#b5ffad':'#ff999c');bgLabel(-23,-24,'PERSONA ≠ PLACA','#31566a',10);break;
 }
 }
 ctx.shadowBlur=0;ctx.shadowOffsetY=0;
 // One consistent readable target across visually and mechanically different bosses.
 if(!b.defeated){
  const col=b.phase==='open'?'#c5ff9c':b.phase==='attack'?'#ff8b91':'#c4cbdb';
  ctx.shadowColor=col;ctx.shadowBlur=b.phase==='open'?19:0;
  bossCircle(0,24,37,'#1a2839',col,4);bossCircle(0,24,23,b.phase==='open'?'#d6ffa9':'#64778a','#ffffff85',2);
  if(b.phase==='open'){ctx.strokeStyle='#4c7752';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-9,24);ctx.lineTo(-2,31);ctx.lineTo(12,15);ctx.stroke()}
  else {bossBox(-9,20,18,14,3,'#1e3247',null);ctx.strokeStyle='#233c54';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,20,7,Math.PI,0);ctx.stroke()}
  if(b.hurt>0){ctx.strokeStyle='#fff4c7';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,24,46+(1-b.hurt)*50,0,TAU);ctx.stroke()}
 }
 ctx.restore();
}
function drawBossScene(){
 const b=level?.boss;if(!b||state==='menu'||state==='select'||state==='bossselect'||!visible(b.start,b.w+250))return;
 ctx.save();
 // Manual launch pads; they never auto-complete the fight when holding right.
 for(const pad of b.pads){
  ctx.save();ctx.translate(pad.x,555);const bounce=Math.sin(levelTime*4)*3;
  bossBox(-65,-20-bounce,130,27+bounce,17,'#79e6bf','#cfffdb',3);
  ctx.strokeStyle='#fff5d4';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-pad.dir*25,-5);ctx.lineTo(pad.dir*22,-27);ctx.lineTo(pad.dir*12,-9);ctx.moveTo(pad.dir*22,-27);ctx.lineTo(pad.dir*2,-30);ctx.stroke();
  bgLabel(0,36,'SALTO / CHICLE','#e9ffe8',10);ctx.restore();
 }
 for(const x of [b.start+12,b.end-12]){
  bossBox(x-9,220,18,344,6,'#34495d','#9ea9c0',2);bossBox(x-22,550,44,17,4,'#1c2e42');
  if(!b.defeated){ctx.strokeStyle='#95eadca5';ctx.lineWidth=3;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(x,224);ctx.lineTo(x,548);ctx.stroke();ctx.setLineDash([]);bossCircle(x,208,9,'#affed5','#2a5149',3)}else bossCircle(x,544,6,'#befcab',null);
 }
 if(b.active){
  if(b.phase==='warning'&&(b.index===2||b.index===6)){ctx.fillStyle='#ff8b8644';ctx.fillRect(b.start+30,510,b.w-60,40);bgLabel(b.start+b.w*.5,503,'→  BARRIDO: SALTA  ←','#ffe7ab',14)}
  if(b.phase==='open'){
   ctx.strokeStyle='#baff9860';ctx.lineWidth=2;ctx.setLineDash([5,7]);ctx.beginPath();ctx.moveTo(b.x,555);ctx.lineTo(b.x,b.y+65);ctx.stroke();ctx.setLineDash([]);bgLabel(b.x,578,'↑ NÚCLEO ABIERTO','#d8ffc1',11);
  }
  for(const h of b.hazards){
   if(h.kind==='press'){
    const live=h.age>=h.delay&&h.age<h.delay+h.duration;
    ctx.fillStyle=live?'#ffbd8266':'#ff908844';ctx.fillRect(h.x-h.w*.5,395,h.w,165);ctx.strokeStyle='#ffaaa0';ctx.lineWidth=2;ctx.setLineDash(live?[]:[7,6]);ctx.strokeRect(h.x-h.w*.5,395,h.w,165);ctx.setLineDash([]);
    const headY=live?484:250;bossBox(h.x-h.w*.5-9,headY,h.w+18,48,8,'#566a7b','#1c2639',4);bossBox(h.x-16,120,32,headY-120,6,'#90a5ad','#303c52',2);bossBox(h.x-h.w*.5-6,headY+30,h.w+12,10,1,'#efd381',null);if(!live)bgLabel(h.x,548,'!','#ffede5',26);
   }else if(h.kind==='beam'){
    const live=h.age>=h.delay&&h.age<h.delay+h.duration;ctx.strokeStyle=live?'#c7faff':'#91d6f477';ctx.lineWidth=live?18:2;ctx.setLineDash(live?[]:[12,18]);ctx.beginPath();ctx.moveTo(b.start,h.y);ctx.lineTo(b.end,h.y);ctx.stroke();ctx.setLineDash([]);if(live){ctx.strokeStyle='#ffffff';ctx.lineWidth=4;ctx.stroke()}
   }else if(h.kind==='drop'&&h.age<h.delay){bossCircle(h.x,545,25,'#ffb48340','#ffcb9b',2);bgLabel(h.x,537,'!','#fff3dd',21)}
   else if(h.kind==='box'){
    ctx.save();ctx.translate(h.x,h.y);ctx.rotate(h.age*2);bossBox(-23,-23,46,46,4,'#d8ac84','#715266',3);bossBox(-4,-24,8,48,0,'#f3afd2',null);ctx.restore();
   }else if(h.kind==='wave'){
    ctx.strokeStyle='#ffc894';ctx.lineWidth=9;ctx.beginPath();ctx.arc(h.x,555,21,Math.PI,0);ctx.stroke();
   }else {bossCircle(h.x,h.y,h.r,h.kind==='drop'?'#995236':'#a9eadebb',h.kind==='drop'?'#f8cb97':'#efffff',2);bossCircle(h.x-h.r*.28,h.y-h.r*.3,h.r*.28,'#fff5e888',null)}
  }
  bossModel(b);
 }else{bgLabel(b.start+b.w*.53,345,'CONTROL FINAL','#dbfada',18)}
 ctx.restore();
}
function drawBossHUD(){
 const b=level?.boss;if(!b?.active||!['playing','dying','finishing'].includes(state)||(b.defeated&&b.t>5))return;
 screenTransform();ctx.save();const w=Math.min(440,CW*.46),h=62,x=(CW-w)/2,y=CH<500?9:15;
 bossBox(x,y,w,h,12,'#151626f5',b.def.color+'aa',1.5);
 let size=CH<500?11:13;ctx.font=`900 ${size}px system-ui`;while(ctx.measureText(b.def.name).width>w-28&&size>8){size--;ctx.font=`900 ${size}px system-ui`}
 ctx.fillStyle='#fff5e6';ctx.textAlign='center';ctx.fillText(b.def.name,CW*.5,y+19);
 const status=b.defeated?'SALIDA ABIERTA':b.phase==='open'?'NÚCLEO VERDE · SALTA PARA GOLPEAR':b.phase==='intro'?'ENCUENTRA TU RITMO':b.phase==='warning'?'ATENCIÓN AL SUELO':b.phase==='attack'?'ESQUIVA · ESPERA LA APERTURA':'¡IMPACTO CONFIRMADO!';
 ctx.font=`750 ${CH<500?7.5:9}px system-ui`;ctx.fillStyle=b.phase==='open'?'#cfff9f':'#c6d4df';ctx.fillText(status,CW*.5,y+33);
 const unit=(w-32)/b.maxHp;for(let i=0;i<b.maxHp;i++)bossBox(x+16+i*unit,y+44,unit-5,7,3,i<b.hp?b.def.color:'#444355',null);
 ctx.restore();
}

