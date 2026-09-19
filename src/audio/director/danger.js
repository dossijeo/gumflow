function music61FlightFeet(t,x){
 const p=player;
 if(p.grounded){
  if(p.platform){if(x>=p.platform.x-10&&x<=p.platform.x+p.platform.w+10)return p.platform.y;
   const distance=Math.max(0,p.vx>=0?p.platform.x+p.platform.w-p.x:p.x-p.platform.x),time=Math.max(0,t-distance/Math.max(80,Math.abs(p.vx)));
   return Math.min(p.platform.y+.5*GRAVITY*time*time,groundAt(level,x).y);
  }
  return groundAt(level,x).y;
 }
 let feet=p.y+R+p.vy*t+.5*GRAVITY*t*t;
 // Account for an actual landing platform on the predicted path, not arbitrary art behind it.
 if(p.vy+GRAVITY*t>0)for(const plat of level.platforms){if(plat.broken||x<plat.x||x>plat.x+plat.w||plat.y<p.y+R-20)continue;if(feet>=plat.y)feet=Math.min(feet,plat.y)}
 return feet;
}
function music61Threat(){
 const p=player,l=level,m=MUSIC61,sp=Math.abs(p.vx),dir=sp>25?Math.sign(p.vx):(input.left?-1:input.right?1:p.face||1);
 const horizon=1.3,reach=clamp(sp*horizon+100,185,1750);
 let risk=0,kind='none',time=Infinity;
 const add=(v,k,t=0)=>{if(v>risk){risk=v;kind=k;time=t}};
 const approach=(x,w=0)=>{
  const edge=dir>0?x:x+w,d=(edge-p.x)*dir-R;
  if(d < -w-R*2 || d>reach)return null;
  const t=Math.max(0,d/Math.max(180,sp)),gain=clamp(1-t/(horizon+.25),.15,1);
  return {t,gain,dist:d,center:dir>0?x+Math.min(w/2,30):x+w-Math.min(w/2,30)};
 };
 // Guided loops and tubes are safe trajectories. Their speed alone is not danger.
 if(p.mode==='loop'||p.mode==='tube'||p.mode==='anchor'||p.mode==='bubble')return {risk:0,kind:'none',ttc:Infinity};
 for(const h of l.hazards){const a=approach(h.x,h.w);if(!a)continue;const gy=groundAt(l,h.x+h.w/2).y,feet=music61FlightFeet(a.t,a.center);if(feet>=gy-62)add(.36+.62*a.gain,'spikes',a.t)}
 for(const g of l.gaps){
  const edge=dir>0?g[0]:g[1],dist=(edge-p.x)*dir,width=g[1]-g[0],inside=p.x>g[0]&&p.x<g[1];
  if(!inside&&(dist<-40||dist>reach))continue;
  const far=dir>0?g[1]+35:g[0]-35,tFar=Math.max(0,(far-p.x)*dir/Math.max(sp,160)),gy=groundAt(l,edge).y;
  // A built-in spring before the edge and a current safe ballistic crossing are not cliff alarms.
  const launch=!inside&&p.grounded&&!p.platform&&sp>150&&l.springs.some(s=>(s.x-p.x)*dir>0&&(edge-s.x)*dir>0&&Math.abs(edge-s.x)<260);
  const flying=!p.grounded&&sp>130&&tFar<1.8&&p.y+R+p.vy*tFar+.5*GRAVITY*tFar*tFar<groundAt(l,far).y-8;
  const bridge=p.platform&&!p.platform.broken&&p.platform.x<=g[0]+35&&p.platform.x+p.platform.w>=g[1]-35&&p.platform.y<gy+60;
  const rescue=l.platforms.some(a=>!a.broken&&p.x>=a.x&&p.x<=a.x+a.w&&a.y>=p.y+R-20&&a.y<gy+140&&p.vy>=0);
  if(launch||flying||bridge||inside&&rescue)continue;
  const t=inside?0:Math.max(0,dist/Math.max(sp,160));
  if(!p.grounded&&!inside&&music61FlightFeet(t,edge)<gy-170)continue;
  add(inside?.96:.36+.61*clamp(1-t/(horizon+.35),0,1),'gap',t);
 }
 for(const tr of l.efTraps||[]){const a=approach(tr.x-tr.w/2,tr.w);if(!a)continue;
  const phase=((levelTime+a.t+tr.phase)%tr.period+tr.period)%tr.period;
  if(phase<1.18||phase>2.12||music61FlightFeet(a.t,tr.x)<groundAt(l,tr.x).y-205)continue;
  add(.38+.59*a.gain,'press',a.t);
 }
 for(const g of l.gates){if(g.broken||g.type==='acid'&&p.flavor==='lemon'||g.type==='wafer'&&p.flavor==='watermelon'&&p.drop)continue;
  const a=approach(g.x-g.w/2,g.w);if(a&&music61FlightFeet(a.t,g.x)>groundAt(l,g.x).y-140)add(.22+.49*a.gain,'gate',a.t);
 }
 for(const q of l.presses){if(q.type!=='wrapper'||q.lock>0)continue;const a=approach(q.x-q.w/2,q.w);if(a&&music61FlightFeet(a.t,q.x)>groundAt(l,q.x).y-140)add(.19+.46*a.gain,'wrapper',a.t)}
 for(const e of l.enemies){if(e.type!=='wrapper'||e.lock>0)continue;const a=approach(e.x-25,50);if(a&&Math.abs(music61FlightFeet(a.t,e.x)-R-e.y)<72)add(.25+.43*a.gain,'wrapper',a.t)}
 if(p.wrapped>0)add(.7,'wrapped');
 if(p.y>960||inGap(l,p.x)&&p.y>groundAt(l,p.x).y+155)add(1,'fall');
 const x=(ef?.offset||0)+p.x,localDeaths=m.deathSites.filter(d=>m.clock-d.at<28&&Math.abs(x-d.x)<1100).length;
 if(localDeaths&&risk>.2)risk=Math.min(1,risk+Math.min(.16,localDeaths*.07));
 const finite=ef?!ef.relax:!profile.settings.assist;
 if(finite&&run.lives===1&&risk>.18)risk=Math.min(1,risk*1.15);
 // No anxiety for standing still, backtracking, or merely having one remaining life.
 if(m.stall>7&&(risk>.12||localDeaths>0))add(clamp(.28+(m.stall-7)*.033,.28,.76),'stalled',0);
 return {risk:clamp(risk,0,1),kind,ttc:time};
}
