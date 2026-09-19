function efDrawTraps(){
 if(!ef)return;
 for(const tr of level.efTraps){if(!visible(tr.x,250))continue;const phase=efTrapPhase(tr),warn=phase>=.6&&phase<=1.64,live=phase>1.64&&phase<2.08,g=groundAt(level,tr.x).y;
  ctx.save();ctx.translate(tr.x,g);const col=live?'#ff777c':warn?'#ffe096':'#91e6c6';
  bossBox(-tr.w*.5-26,-242,15,246,5,'#536b84','#a3b1bf',2);bossBox(tr.w*.5+10,-242,15,246,5,'#536b84','#a3b1bf',2);bossBox(-tr.w*.5-29,-260,tr.w+58,26,7,'#5d738a','#b8c6c9',2);
  const py=live?-49:-205;bossBox(-12,-240,24,240+py,2,'#c6d3d2','#456',2);bossBox(-tr.w*.5,py,tr.w,46,8,'#6e8391','#1c304a',3);bossBox(-tr.w*.5+4,py+29,tr.w-8,12,3,col,null);bossCircle(0,-276,7,col,'#304657',2);
  if(warn||live){ctx.fillStyle=col+(live?'35':'1c');ctx.fillRect(-tr.w*.5,-190,tr.w,190);bgLabel(0,-80,live?'¡PLOF!':'!',col,22)}
  bgLabel(0,28,live?'PRENSA ACTIVA':warn?'ATENCIÓN':'PASO LIBRE',col,8);ctx.restore();
 }
 // The recycled boundary is visible only to someone deliberately going back.
 if(ef.floor>40&&visible(ef.floor,70)){ctx.save();ctx.strokeStyle='#b1ecdb70';ctx.lineWidth=5;ctx.setLineDash([8,10]);ctx.beginPath();ctx.moveTo(ef.floor,-200);ctx.lineTo(ef.floor,1000);ctx.stroke();ctx.setLineDash([]);bgLabel(ef.floor+110,340,'EL INFINITO ES HACIA ALLÍ →','#eaffd5',10);ctx.restore()}
}
