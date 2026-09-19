function updateCamera(dt){if(!player)return;if(state==='menu'){camX=1850+Math.sin(visualT*.1)*65;camY=-120;zoom=1;return}
 const speed=Math.abs(player.vx),targetZoom=reduced?1:1-clamp((speed-650)/2400,0,.16);zoom=lerp(zoom,targetZoom,1-Math.exp(-dt*2));worldW=CW/(baseScale*zoom);worldH=CH/(baseScale*zoom);
 let px=player.mode==='loop'?player.loop.x:player.x,py=player.mode==='loop'?player.loop.y-player.loop.r*.7:player.y;
 const lead=player.vx>=-50?worldW*.31:worldW*.63;let tx=px-lead+clamp(player.vx*.14,-120,170),ty=py-worldH*.61;
 tx=clamp(tx,-80,Math.max(-80,level.length-worldW*.75));camX=lerp(camX,tx,1-Math.exp(-dt*6));camY=lerp(camY,ty,1-Math.exp(-dt*4));
}
