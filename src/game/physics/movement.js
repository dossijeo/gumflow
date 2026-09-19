const R=20,GRAVITY=1850,MAX_SPEED=1550;
function readInput(){return{left:keys.has('ArrowLeft')||keys.has('KeyA')||touchState.left,right:keys.has('ArrowRight')||keys.has('KeyD')||touchState.right,jump:keys.has('Space')||keys.has('KeyW')||keys.has('ArrowUp')||touchState.jump,elastic:keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyX')||touchState.elastic}}
function jump(){
 const p=player,a=p.grounded?p.angle:0,s=p.grounded?p.speed:p.vx,m=p.flavor==='strawberry'?1.16:p.flavor==='watermelon'?.9:1;
 p.vx=p.grounded?Math.cos(a)*s+Math.sin(a)*420:p.vx;p.vy=Math.min(-400,(p.grounded?Math.sin(a)*s:0)-Math.cos(a)*690*m);p.grounded=false;p.platform=null;p.squash=-.42;p.drop=false;p.manualJump=true;jumpBuffer=0;coyote=0;charge=0;sound('jump');burst(p.x,p.y+R,6,level.palette.edge,90);
}

function land(y,slope,platform){
 const p=player,impact=p.vy,a=Math.atan(slope);p.y=y-R;p.angle=a;p.manualJump=false;
 const mat=surfaceAt(p.x),rebound=mat==='gel'||mat==='tongue',cold=p.cold>0&&p.warm<=0;
 if((input.elastic&&impact>270&&cooldown<=0)||(rebound&&impact>180&&cooldown<=0)){
  const dir=Number(input.right)-Number(input.left);p.vy=-clamp(Math.abs(impact)*(.83+(flow/100)*.08)*(cold?.65:rebound?1.24:1),cold?540:740,rebound?1250:1100);
  p.vx=dir?dir*Math.max(Math.abs(p.vx),520):p.face*Math.max(Math.abs(p.vx),520);p.grounded=false;p.platform=null;p.squash=.9;p.drop=false;charge=0;cooldown=.42;flow=clamp(flow+11,0,100);sound('bounce');burst(p.x,p.y+R,14,level.palette.accent,210);floatText(p.x,p.y-48,rebound?'¡DOBLE BOING!':'¡BOING!',level.palette.accent);return;
 }
 p.grounded=true;p.platform=platform;p.speed=clamp(p.vx*Math.cos(a)+p.vy*Math.sin(a),-MAX_SPEED,MAX_SPEED);p.squash=clamp(impact/1200,.05,.7);p.drop=false;coyote=.12;if(impact>700){p.flat=.2;p.shock=.6;burst(p.x,p.y+R,8,level.palette.edge,110);flow=clamp(flow+4,0,100)}
}

function updateNormal(dt){
 const p=player,dir=Number(input.right)-Number(input.left),mat=p.material,ice=mat==='ice'||mat==='chocolate',boostFlavor=p.flavor==='chile';if(dir)p.face=dir;
 if(jumpBuffer>0&&(p.grounded||coyote>0))jump();
 if(p.grounded){const a=p.platform?0:Math.atan(groundAt(level,p.x).slope);p.angle=a;
  if(input.elastic){charge=clamp(charge+dt*(mat==='caramel'?2:1.55),0,1);p.speed*=Math.exp(-dt*(ice?.35:.8));if(dir&&Math.abs(p.speed)<150)p.speed+=dir*260*dt}
  else{
   if(prevElastic&&charge>.1&&cooldown<=0){p.speed=p.face*clamp(Math.max(Math.abs(p.speed)+charge*620,620+charge*750),0,MAX_SPEED);burst(p.x,p.y+12,20,level.palette.accent,280);floatText(p.x,p.y-48,charge>.8?'¡ELÁSTICO!':'¡IMPULSO!',level.palette.accent);sound('boost');flow=clamp(flow+10,0,100);cooldown=.24;p.squash=-.4}
   charge=0;const top=boostFlavor?1320:720+(flow>60?50:0),accel=ice?750:1180;
   if(dir){if(p.speed*dir<0)p.speed+=dir*(ice?650:2200)*dt;else if(Math.abs(p.speed)<top)p.speed+=dir*accel*dt}
   else p.speed-=Math.sign(p.speed)*Math.min(Math.abs(p.speed),(ice?16:68)*dt);
  }
  if(mat==='sugar')p.speed+=p.face*650*dt;if(mat==='chile')p.speed+=p.face*1250*dt;if(mat==='flour')p.speed*=Math.exp(-dt*.95);if(mat==='caramel'&&!input.elastic)p.speed*=Math.exp(-dt*.8);
  if(p.wrapped>0)p.speed*=Math.exp(-dt*1.8);
  p.speed+=Math.sin(a)*GRAVITY*.7*dt;p.speed=clamp(p.speed,-MAX_SPEED,MAX_SPEED);if(!dir&&Math.abs(p.speed)<7)p.speed=0;
  p.vx=Math.cos(a)*p.speed;p.vy=Math.sin(a)*p.speed;p.x+=p.vx*dt;
  if(p.platform){if(p.x<p.platform.x-3||p.x>p.platform.x+p.platform.w+3){p.grounded=false;p.platform=null}else p.y=p.platform.y-R}
  else if(inGap(level,p.x)){p.grounded=false;p.y+=p.vy*dt}
  else{const g=groundAt(level,p.x);p.y=g.y-R;p.angle=Math.atan(g.slope)}
 }else{
  charge=Math.max(0,charge-dt*2);if(dir)p.vx+=dir*(boostFlavor?1000:600)*dt;p.vx=clamp(p.vx,-MAX_SPEED,MAX_SPEED);
  let gravity=GRAVITY*(p.flavor==='strawberry'?.84:p.flavor==='watermelon'?1.25:1);
  if(p.manualJump&&!input.jump&&p.vy<-130)gravity*=1.55;
  if(input.elastic&&cooldown<=0){gravity*=1.85;p.drop=true;p.vy=Math.max(p.vy,-180)}else p.drop=false;
  if(p.flavor==='cola'&&input.jump&&!input.elastic&&p.floatFuel>0){p.floatFuel-=dt;gravity*=.24;p.vy=Math.max(-390,p.vy-dt*730)}
  p.vy=Math.min(p.vy+gravity*dt,1550);p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle=lerp(p.angle,0,Math.min(1,dt*6));
  for(const gap of level.gaps){if(p.px<gap[1]&&p.x>=gap[1]&&p.y+R>groundAt(level,gap[1]).y+7){p.x=gap[1]-R*.6;p.vx=-Math.abs(p.vx)*.16;p.squash=.55}else if(p.px>gap[0]&&p.x<=gap[0]&&p.y+R>groundAt(level,gap[0]).y+7){p.x=gap[0]+R*.6;p.vx=Math.abs(p.vx)*.16;p.squash=.55}}
  const prevFoot=p.py+R,newFoot=p.y+R;let landed=false;
  if(p.vy>=0){for(const plat of level.platforms){if(plat.broken)continue;if(p.x>plat.x-7&&p.x<plat.x+plat.w+7&&prevFoot<=plat.y+8&&newFoot>=plat.y){
    if(plat.type==='wafer'&&p.flavor==='watermelon'&&p.drop){plat.broken=true;burst(p.x,plat.y,20,'#cfa381',220);floatText(p.x,p.y-50,'CRUNCH');run.score+=150;continue}
    land(plat.y,0,plat);landed=true;break;
  }}}
  if(!landed&&!inGap(level,p.x)){const g=groundAt(level,p.x),oldG=groundAt(level,p.px);if(newFoot>=g.y&&prevFoot<=oldG.y+40&&p.vy-g.slope*p.vx>=-70)land(g.y,g.slope,null)}
 }
 p.x=clamp(p.x,30,level.length+100);if(p.y<-750){p.y=-750;p.vy=Math.max(100,p.vy)}
 if(p.grounded){for(const o of level.loops)if(p.loopLock<=0&&p.speed>360&&p.px<o.x&&p.x>=o.x&&!p.platform){p.mode='loop';p.loop=o;p.arc=0;p.speed=Math.max(740,p.speed);p.grounded=false;charge=0;flow=clamp(flow+14,0,100);sound('loop');break}}
 if(p.mode==='normal')for(const t of level.tubes){const f=t.points[0];if(p.tubeLock<=0&&p.vx>100&&p.px<f.x+14&&p.x>=f.x-8&&Math.abs(p.y-f.y)<60){p.mode='tube';p.tube=t;p.arc=0;p.speed=Math.max(1040,Math.abs(p.vx));p.grounded=false;charge=0;flow=clamp(flow+12,0,100);sound('boost');break}}
 if(p.mode==='normal'&&p.springLock<=0)for(const sp of level.springs){if(Math.abs(p.x-sp.x)<31&&p.y+R>=sp.y-27&&p.y+R<=sp.y+30&&(p.grounded||p.vy>-100)){p.vy=-sp.power;p.vx=Math.max(sp.boost,p.vx);p.grounded=false;p.platform=null;p.springLock=.65;p.squash=.9;p.drop=false;p.manualJump=false;charge=0;cooldown=.22;flow=clamp(flow+11,0,100);sound('spring');burst(p.x,p.y+R,17,level.palette.bright,240);break}}
 if(p.mode==='normal'&&p.grounded)for(const bx of level.boosts)if(p.px<bx&&p.x>=bx){p.speed=Math.max(1080,p.speed);p.vx=Math.cos(p.angle)*p.speed;burst(p.x,p.y+R,11,level.palette.accent,220);sound('boost');flow=clamp(flow+5,0,100)}
}

function updateLoop(dt){const p=player,o=p.loop,rr=o.r-R;p.speed=clamp(p.speed-GRAVITY*.67*Math.sin(p.arc)*dt,440,MAX_SPEED);p.arc+=p.speed/rr*dt;const a=p.arc;p.x=o.x+Math.sin(a)*rr;p.y=o.y-o.r+Math.cos(a)*rr;p.vx=Math.cos(a)*p.speed;p.vy=-Math.sin(a)*p.speed;p.angle=-a;
 if(jumpBuffer>0&&a>.16&&a<TAU-.18){p.mode='normal';p.vx+=Math.sin(a)*420;p.vy+=Math.cos(a)*420;p.grounded=false;p.angle=0;p.loopLock=2;flow=clamp(flow+8,0,100);p.squash=-.4;jumpBuffer=0;sound('jump');burst(p.x,p.y,9,level.palette.accent,120)}
 else if(a>=TAU){p.mode='normal';p.x=o.x+25;p.y=groundAt(level,p.x).y-R;p.speed=Math.max(850,p.speed);p.vx=p.speed;p.vy=0;p.angle=0;p.grounded=true;p.platform=null;p.loopLock=1.5;run.score+=100;floatText(p.x,p.y-50,'LOOP +100',level.palette.bright);flow=clamp(flow+14,0,100)}
}
function updateTube(dt){const p=player,t=p.tube;p.arc+=Math.max(1050,p.speed)*dt;const pt=pointOnTube(t,p.arc);p.x=pt.x;p.y=pt.y;p.angle=pt.angle;p.vx=Math.cos(pt.angle)*p.speed;p.vy=Math.sin(pt.angle)*p.speed;
 if(p.arc>=t.length){p.mode='normal';p.vx=Math.max(950,p.vx);p.vy=-280;p.grounded=false;p.angle=0;p.tubeLock=2;p.manualJump=false;p.squash=-.65;cooldown=.2;flow=clamp(flow+12,0,100);burst(p.x,p.y,22,level.palette.accent,320);floatText(p.x,p.y-55,'¡POP!',level.palette.accent);sound('spring')}
}
