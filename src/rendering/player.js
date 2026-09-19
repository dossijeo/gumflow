function drawPlayer(){
 if(!player)return;const p=player,g=groundAt(level,p.x);
 if(p.mode==='dead'){if(deathTimer>.55){ctx.save();ctx.translate(p.x,p.y);ctx.scale(2.5,.22);gum(0,0,0,0,0,0,false);ctx.restore()}return}
 if(!inGap(level,p.x)){const d=Math.max(0,g.y-p.y-R);ctx.fillStyle=`rgba(8,8,22,${clamp(.25-d/1600,.03,.25)})`;ctx.save();ctx.translate(p.x,g.y-1);ctx.rotate(Math.atan(g.slope));ctx.beginPath();ctx.ellipse(0,0,Math.max(9,27-d*.035),4.5,0,0,TAU);ctx.fill();ctx.restore()}
 for(const t of trails){ctx.save();ctx.translate(t.x,t.y);ctx.rotate(t.angle);ctx.globalAlpha=clamp(t.life/.16*.16,0,.16);ctx.fillStyle=flow>75?level.palette.accent:'#ff8bbb';ctx.beginPath();ctx.ellipse(0,0,R*t.sx,R*t.sy,0,0,TAU);ctx.fill();ctx.restore()}
 if(p.inv>0&&Math.floor(visualT*12)%2===0)ctx.globalAlpha=.48;
 if(charge>.1){ctx.strokeStyle=level.palette.accent+'99';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,35,Math.PI*.7,Math.PI*.7+TAU*charge);ctx.stroke()}
 if(flow>77){ctx.strokeStyle=level.palette.bright+'78';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x,p.y,31+Math.sin(visualT*8)*2,visualT*5,visualT*5+Math.PI*1.2);ctx.stroke()}
 const floaty=p.mode==='bubble'||(p.flavor==='cola'&&input.jump&&!p.grounded&&p.floatFuel>0&&!input.elastic);
 if(floaty){ctx.fillStyle='#e0c1ff19';ctx.strokeStyle='#e5d0ffb0';ctx.lineWidth=2;ctx.beginPath();ctx.arc(p.x,p.y,39+Math.sin(visualT*7)*2,0,TAU);ctx.fill();ctx.stroke();ctx.strokeStyle='#ffffffbb';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,32,3.7,4.4);ctx.stroke()}
 if(p.mode==='anchor'){
  const a=p.anchor;ctx.strokeStyle='#ff95c0';ctx.lineWidth=9;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(a.x,a.y-(a.type==='sling'?62:0));ctx.quadraticCurveTo(p.x+50,p.y,p.x,p.y);if(a.type==='sling'){ctx.moveTo(a.x,a.y+62);ctx.quadraticCurveTo(p.x+50,p.y+15,p.x,p.y)}ctx.stroke();
  ctx.strokeStyle='#ffd7e9';ctx.lineWidth=2;ctx.stroke();drawAim(p.x,p.y,p.aim,90+p.tension*90);
 }
 if(p.cut>0){const t=p.cut/.85;for(let i=0;i<3;i++){ctx.save();ctx.translate(p.x+(i-1)*38*Math.sin(t*Math.PI),p.y+(i%2?-22:5)*Math.sin(t*Math.PI));ctx.scale(.55,.55);gum(0,0,p.angle,80,0,0,false);ctx.restore()}}
 else{
  ctx.save();ctx.translate(p.x,p.y);let sx=1,sy=1;
  if(p.flat>0){sx=1+Math.min(1,p.flat*2)*1.15;sy=1-Math.min(1,p.flat*2)*.65}
  if(p.strip>0){sx=1+Math.min(1,p.strip)*1.3;sy=1-Math.min(1,p.strip)*.58}
  if(p.cold>0&&p.warm<=0){sx=Math.max(sx,1.18);sy=Math.min(sy,.79)}
  ctx.translate(0,R*(1-sy));ctx.scale(sx,sy);gum(0,0,p.angle,Math.abs(p.vx),p.squash,charge,p.drop);ctx.restore();
 }
 if(p.flavor){ctx.strokeStyle=FLAVORS[p.flavor].color+'cc';ctx.lineWidth=2;ctx.setLineDash([3,8]);ctx.beginPath();ctx.arc(p.x,p.y,31,0,TAU);ctx.stroke();ctx.setLineDash([])}
 if(p.cold>0&&p.warm<=0){ctx.strokeStyle='#c1f6ffbb';ctx.lineWidth=2;rr(p.x-29,p.y-29,58,50,11);ctx.stroke();ctx.fillStyle='#b5e8ff22';ctx.fill();ctx.strokeStyle='#e9fdff99';ctx.beginPath();ctx.moveTo(p.x-23,p.y-19);ctx.lineTo(p.x-12,p.y-26);ctx.stroke()}
 if(p.coat>0){ctx.fillStyle='#794837b3';ctx.beginPath();ctx.moveTo(p.x-19,p.y+9);ctx.quadraticCurveTo(p.x-8,p.y+18,p.x,p.y+12);ctx.quadraticCurveTo(p.x+9,p.y+22,p.x+19,p.y+10);ctx.lineTo(p.x+15,p.y+20);ctx.quadraticCurveTo(p.x,p.y+27,p.x-17,p.y+18);ctx.fill()}
 if(p.wrapped>0){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(Math.sin(visualT*30)*.055);ctx.fillStyle='#e1c9eecc';ctx.strokeStyle='#9271b1';ctx.lineWidth=2;rr(-38,-27,76,56,9);ctx.fill();ctx.stroke();for(const xx of [-46,38]){ctx.beginPath();ctx.moveTo(xx,-18);ctx.lineTo(xx+8,-12);ctx.lineTo(xx+8,16);ctx.lineTo(xx,20);ctx.closePath();ctx.fill()}ctx.fillStyle='#bd588e';rr(-25,-16,50,25,7);ctx.fill();bgLabel(0,1,'GUM','#fff4db',14);ctx.fillStyle='#765c80';for(let j=0;j<15;j++)ctx.fillRect(-23+j*3,14,j%2+1,9);ctx.restore()}
 if(p.flavor==='chile'&&Math.abs(p.vx)>700){ctx.fillStyle='#ffb468';ctx.beginPath();ctx.moveTo(p.x-p.face*28,p.y+4);ctx.lineTo(p.x-p.face*(55+Math.sin(visualT*20)*10),p.y+16);ctx.lineTo(p.x-p.face*35,p.y-9);ctx.fill()}
 if(p.idle>3){const t=(p.idle-3)%4;if(t<2.8){const radius=4+t*5;ctx.strokeStyle='#ffd3e5';ctx.fillStyle='#ffb9d345';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(p.x+p.face*(23+radius*.4),p.y+7,radius,0,TAU);ctx.fill();ctx.stroke()}else if(t<3.1){bgLabel(p.x+35,p.y-26,'¡POP!','#fff4db',10)}}
 if(p.shock>0){bgLabel(p.x,p.y-47,'!',level.palette.bright,20)}ctx.globalAlpha=1;
}

