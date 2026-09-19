function background(){
 const p=level.palette;screenTransform();let gr=ctx.createLinearGradient(0,0,0,CH);gr.addColorStop(0,p.sky);gr.addColorStop(1,p.sky2);ctx.fillStyle=gr;ctx.fillRect(0,0,CW,CH);
 const glow=ctx.createRadialGradient(CW*.72,CH*.36,0,CW*.72,CH*.36,CW*.72);glow.addColorStop(0,p.accent+'19');glow.addColorStop(1,p.accent+'00');ctx.fillStyle=glow;ctx.fillRect(0,0,CW,CH);
 worldTransform(.12,.10);let left=camX*.12-500,right=left+worldW+1000;
 if(levelIndex===6){
  ctx.fillStyle=p.back;ctx.beginPath();ctx.moveTo(left,-500);for(let x=left;x<right+80;x+=35)ctx.lineTo(x,100+Math.sin(x*.006)*60);ctx.lineTo(right,-500);ctx.closePath();ctx.fill();
  for(let x=Math.floor(left/220)*220;x<right;x+=220){ctx.fillStyle='#a7667a55';ctx.beginPath();ctx.ellipse(x+100,340+Math.sin(x)*60,90,185,.3,0,TAU);ctx.fill()}
 }else for(let x=Math.floor(left/190)*190;x<right;x+=190){const n=Math.abs(Math.sin(x*1.837)),h=130+n*250;ctx.fillStyle=p.back;rr(x,610-h,120+n*50,h+260,levelIndex===3?20:12);ctx.fill();ctx.fillRect(x+22,584-h,64,40);if(levelIndex===4)ctx.fillRect(x+28,430-h,38,170);ctx.fillStyle=p.accent+'16';for(let j=0;j<4;j++)for(let row=0;row<(levelIndex===2?5:2);row++)ctx.fillRect(x+18+j*24,640-h+row*43,9,19)}
 worldTransform(.35,.25);left=camX*.35-600;right=left+worldW+1200;
 for(let x=Math.floor(left/520)*520;x<right;x+=520){
  const n=Math.abs(Math.sin(x*.743)),h=240+n*125,y=650-h;
  ctx.save();
  if(levelIndex===0){
   ctx.lineWidth=22;ctx.strokeStyle=p.mid;ctx.beginPath();ctx.moveTo(x-70,y+90);ctx.lineTo(x+195,y+90);ctx.quadraticCurveTo(x+240,y+90,x+240,y+40);ctx.lineTo(x+240,y-40);ctx.stroke();ctx.strokeStyle=p.haze+'70';ctx.lineWidth=3;ctx.stroke();
   const g=ctx.createLinearGradient(x,y,x+145,y);g.addColorStop(0,p.back);g.addColorStop(.5,p.mid);g.addColorStop(1,p.back);ctx.fillStyle=g;rr(x,y,145,h,36);ctx.fill();ctx.strokeStyle=p.haze+'55';ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle=p.sky;rr(x+34,y+50,78,h-107,30);ctx.fill();ctx.save();rr(x+39,y+54,68,h-116,27);ctx.clip();ctx.fillStyle='#f084b440';ctx.fillRect(x+35,y+95+Math.sin(visualT)*9,75,h);for(let j=0;j<7;j++){ctx.fillStyle='#ffcfe83b';ctx.beginPath();ctx.arc(x+51+j%3*20,y+130+((j*45-visualT*20+h)%Math.max(40,h-150)),4+j%3,0,TAU);ctx.fill()}ctx.restore();ctx.fillStyle=p.haze;ctx.fillRect(x+13,635,20,100);ctx.fillRect(x+113,635,20,100);bgLabel(x+72,y+35,'POLÍMEROS / 0G',p.accent);
   ctx.fillStyle=p.mid;rr(x+220,480,200,32,12);ctx.fill();for(let j=0;j<6;j++){const xx=x+235+((j*35+visualT*17)%175);ctx.fillStyle=j===2?'#ffd687':'#d78eb1';rr(xx,456,21,25,7);ctx.fill();ctx.fillStyle='#38243a';ctx.fillRect(xx+5,464,3,4);ctx.fillRect(xx+13,464,3,4);if(j===2)ctx.fillRect(xx+9,455,3,4)}
  }else if(levelIndex===1){
   ctx.strokeStyle=p.mid;ctx.lineWidth=34;ctx.beginPath();ctx.moveTo(x,740);ctx.lineTo(x,340);ctx.bezierCurveTo(x,175,x+310,175,x+310,340);ctx.lineTo(x+310,740);ctx.stroke();ctx.strokeStyle=p.haze+'4a';ctx.lineWidth=2;ctx.stroke();
   ctx.fillStyle='#8f6ac82f';ctx.fillRect(x+75,305,36,435);ctx.fillStyle='#6fe3bb2a';ctx.fillRect(x+191,310,68,450);ctx.strokeStyle='#8ce9dd33';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x-140,325);ctx.lineTo(x+75,325);ctx.lineTo(x+75,525);ctx.stroke();
   for(let j=0;j<6;j++){ctx.strokeStyle='#d6ffff2b';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+145+Math.sin(j+x)*42,620-((visualT*30+j*67)%330),8+j%4*5,0,TAU);ctx.stroke()}
   ctx.fillStyle=p.mid;rr(x+335,490,135,105,16);ctx.fill();bgLabel(x+402,527,'COLA',p.accent,18);bgLabel(x+402,548,'NO POTABLE','#d8bcff',8);bgLabel(x+155,210,'SODA / DRENAJE 02',p.accent);
  }else if(levelIndex===2){
   const bh=280+n*150;ctx.fillStyle=p.mid;rr(x,650-bh,166,bh+130,18);ctx.fill();ctx.fillStyle=p.back;rr(x+17,635-bh,132,45,12);ctx.fill();bgLabel(x+83,663-bh,'CANDY CO.',p.accent,15);
   for(let row=0;row<6;row++)for(let j=0;j<4;j++){ctx.fillStyle=(j+row+Math.floor(x/520))%3?'#ffe3aa22':'#ffd28766';rr(x+22+j*33,705-bh+row*45,17,24,4);ctx.fill()}
   ctx.strokeStyle='#bf8ca380';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(x+250,650);ctx.lineTo(x+250,300);ctx.stroke();ctx.fillStyle='#ffb8c56b';ctx.beginPath();ctx.arc(x+250,300,56,0,TAU);ctx.fill();ctx.strokeStyle='#f4d29988';ctx.lineWidth=9;ctx.beginPath();for(let t=0;t<TAU*2.3;t+=.1){const r=t*3.3;if(t===0)ctx.moveTo(x+250,300);else ctx.lineTo(x+250+Math.cos(t)*r,300+Math.sin(t)*r)}ctx.stroke();
   ctx.fillStyle='#d493c54a';rr(x+330,405,150,80,10);ctx.fill();bgLabel(x+405,435,'SIN AZÚCAR*','#ffdab4',14);bgLabel(x+405,456,'*EN LA LETRA PEQUEÑA','#efddf0',7);
  }else if(levelIndex===3){
   ctx.fillStyle=p.mid;rr(x,230,215,510,25);ctx.fill();ctx.strokeStyle=p.haze+'62';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle=p.back;rr(x+20,260,175,220,13);ctx.fill();ctx.strokeStyle=p.accent+'50';ctx.lineWidth=2;ctx.stroke();
   ctx.strokeStyle=p.accent+'23';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(x+32,415);ctx.lineTo(x+112,285);ctx.moveTo(x+70,462);ctx.lineTo(x+181,285);ctx.stroke();ctx.fillStyle='#b7eafa88';rr(x+178,525,8,67,4);ctx.fill();bgLabel(x+107,514,'−18°',p.accent,29);bgLabel(x+107,549,'IDEAS CONGELADAS',p.accent,8);
   ctx.fillStyle='#abedff66';for(let j=0;j<6;j++){ctx.beginPath();ctx.moveTo(x+j*40,230);ctx.lineTo(x+j*40+15,280+(j%3)*18);ctx.lineTo(x+j*40+25,230);ctx.fill()}
   ctx.fillStyle='#72bed249';rr(x+305,440,155,135,18);ctx.fill();ctx.strokeStyle='#d4f7ff70';ctx.lineWidth=2;ctx.stroke();bgLabel(x+382,511,'FRESCO',p.accent,20);bgLabel(x+382,534,'CONGELADO DESDE AYER',p.accent,7);
  }else if(levelIndex===4){
   ctx.fillStyle=p.mid;rr(x,380,215,320,12);ctx.fill();ctx.fillStyle=p.back;rr(x+23,407,169,160,66);ctx.fill();const fire=ctx.createRadialGradient(x+105,508,4,x+105,508,110);fire.addColorStop(0,'#ffbe7555');fire.addColorStop(1,'#dc673100');ctx.fillStyle=fire;ctx.fillRect(x-10,395,250,190);ctx.fillStyle='#ca745453';ctx.fillRect(x+56,560,24,120);ctx.fillRect(x+139,560,24,120);ctx.fillStyle=p.mid;ctx.fillRect(x+22,125,39,270);ctx.fillRect(x+145,180,30,217);
   ctx.strokeStyle=p.haze+'55';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x+315,60);ctx.lineTo(x+315,285);ctx.stroke();ctx.save();ctx.translate(x+315,295);ctx.rotate(Math.sin(visualT*.7+x)*.15);ctx.fillStyle=p.mid;ctx.beginPath();ctx.ellipse(0,0,71,30,0,0,TAU);ctx.fill();rr(-61,-10,122,92,25);ctx.fill();ctx.fillStyle='#eea0644d';ctx.fillRect(-8,73,17,360);ctx.restore();bgLabel(x+109,610,'72% CACAO',p.accent,19);bgLabel(x+109,631,'28% ARREPENTIMIENTO',p.accent,8);
  }else if(levelIndex===5){
   ctx.strokeStyle=p.mid;ctx.lineWidth=26;ctx.beginPath();ctx.moveTo(x-50,520);ctx.lineTo(x+455,520);ctx.stroke();ctx.fillStyle=p.mid;rr(x+80,240,175,250,18);ctx.fill();ctx.fillStyle=p.back;rr(x+99,276,137,155,13);ctx.fill();ctx.strokeStyle=p.accent+'55';ctx.lineWidth=3;ctx.stroke();bgLabel(x+167,268,'WRAPMASTER 9000',p.accent,9);
   for(let j=0;j<4;j++){const xx=x-80+((j*130+visualT*24)%530);ctx.fillStyle='#b9a0bf66';rr(xx,435,94,69,6);ctx.fill();ctx.strokeStyle='#e4d2ff66';ctx.lineWidth=2;ctx.strokeRect(xx+8,444,77,48);ctx.fillStyle='#ded3e766';for(let k=0;k<11;k++)ctx.fillRect(xx+20+k*5,463,1+k%2,19)}
   ctx.strokeStyle='#dfb1e647';ctx.lineWidth=32;ctx.beginPath();ctx.moveTo(x+340,650);ctx.bezierCurveTo(x+420,230,x+200,100,x+470,50);ctx.stroke();ctx.strokeStyle='#ffffff25';ctx.lineWidth=2;ctx.stroke();bgLabel(x+175,460,'LIBRE ALBEDRÍO: 0 g',p.accent,8);
  }else{
   ctx.fillStyle='#be718d44';ctx.beginPath();ctx.ellipse(x+250,155,220,95,0,0,TAU);ctx.fill();
   for(let j=0;j<3;j++){ctx.fillStyle='#f4d0c9aa';rr(x+50+j*133,126+Math.sin(x+j)*17,99,167,28);ctx.fill();ctx.fillStyle='#ffebe55a';rr(x+63+j*133,140,25,96,12);ctx.fill()}
   ctx.fillStyle='#ce7f9188';ctx.beginPath();ctx.moveTo(x-40,800);ctx.bezierCurveTo(x+70,465,x+330,480,x+540,800);ctx.fill();ctx.strokeStyle='#ffbdd333';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x+40,702);ctx.bezierCurveTo(x+120,550,x+310,565,x+410,730);ctx.stroke();
   for(let j=0;j<5;j++){ctx.strokeStyle='#e0fff933';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x+40+j*83,460+Math.sin(visualT+j)*20,12+j%3*7,0,TAU);ctx.stroke()}
  }
  ctx.restore();
 }
 worldTransform(.65,.5);left=camX*.65-200;right=left+worldW+400;
 if(levelIndex===2){
  ctx.fillStyle=p.mid+'77';ctx.fillRect(left,702,right-left,12);for(let x=Math.floor(left/430)*430;x<right;x+=430){ctx.strokeStyle=p.mid+'77';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(x,705);ctx.lineTo(x,480);ctx.stroke();ctx.fillStyle=p.edge+'66';rr(x-20,455,42,60,15);ctx.fill();ctx.fillStyle='#85ecc88a';ctx.beginPath();ctx.arc(x+1,496,8,0,TAU);ctx.fill()}
 }else if(levelIndex!==6){ctx.strokeStyle=p.pipe+'40';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(left,820);ctx.lineTo(right,820);ctx.stroke();for(let x=Math.floor(left/280)*280;x<right;x+=280){ctx.fillStyle=p.mid+'77';ctx.fillRect(x,725,12,300);ctx.strokeStyle=p.mid+'99';ctx.lineWidth=5;ctx.strokeRect(x-12,803,36,34)}}
 screenTransform();if(!reduced){ctx.fillStyle=levelIndex===3?'#d9f7ff70':'#ffffff19';for(let i=0;i<(levelIndex===3?50:22);i++){const xx=((i*173.9+visualT*(3+i%4))%(CW+40))-20,yy=((i*113.7+visualT*(levelIndex===3?18:-3))%(CH+40)+CH+40)%(CH+40)-20;ctx.beginPath();ctx.arc(xx,yy,1+i%3,0,TAU);ctx.fill()}}
}

