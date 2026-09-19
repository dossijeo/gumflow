function hdGameState(dt){
 const m=MUSIC61;if(!player||!run)return;
 if(m.level!==level||m.run!==run)music61Reset();
 if(state==='dying'){
  if(m.lastState!=='dying'){
   const x=(ef?.offset||0)+player.x;m.deathSites.push({x,at:m.clock});m.deathSites=m.deathSites.slice(-5);
   m.deathAt=m.clock;m.deathAudioUntil=hdNow()+.5;m.burstUntil=0;m.cooldownUntil=m.clock+35;m.recoveryUntil=0;m.events=[];
   music61Choose('everyday','death');
  }
  m.lastState=state;HD.tension=0;return;
 }
 if(state!=='playing'){m.lastState=state;return}
 if(m.lastState==='dying'){m.graceUntil=m.clock+.65;m.safeFor=0;m.risk=0;m.raw=0;m.stall=0;m.progressX=(ef?.offset||0)+player.x;music61Choose('everyday','respawn')}
 m.lastState=state;m.clock+=dt;m.stateAge+=dt;m.timeByState[HD.state]+=dt;music61Movements();
 m.scan+=dt;if(m.scan<.075)return;const span=m.scan;m.scan=0;
 const p=player,x=(ef?.offset||0)+p.x,intends=input.left||input.right||input.jump||input.elastic;
 if(Math.abs(x-m.progressX)>70){m.progressX=x;m.stall=Math.max(0,m.stall-span*5)}else if(intends&&p.mode==='normal'&&Math.abs(p.vx)<180)m.stall+=span;else m.stall=Math.max(0,m.stall-span*2);
 const start=performance.now(),th=music61Threat();m.detectionMs+=(performance.now()-start);m.scans++;
 m.raw=th.risk;m.threat=th.kind;m.ttc=th.ttc;
 m.risk=lerp(m.risk,th.risk,1-Math.exp(-span/(th.risk>m.risk?.085:.42)));
 m.safeFor=th.risk<.24?m.safeFor+span:0;
 HD.stall=m.stall;HD.recentDeaths=m.deathSites.filter(d=>m.clock-d.at<28&&Math.abs(x-d.x)<1100).length;HD.tension=m.risk;
 const boss=!!lBoss();
 if(boss){m.wasBoss=true;m.burstUntil=0;m.recoveryUntil=0;music61Choose('epic','boss');return}
 if(m.wasBoss){m.wasBoss=false;m.burstUntil=0;m.cooldownUntil=m.clock+40;m.graceUntil=m.clock+.55;music61Choose('everyday','boss-cleared');return}
 if(HD.testState){music61Choose(HD.testState,'test');return}
 if(m.clock<m.graceUntil){music61Choose('everyday','respawn');return}
 const imminent=th.risk>=.84||m.risk>.44;
 if(imminent){m.candidateAge+=span}else m.candidateAge=0;
 if(th.risk>.84||m.candidateAge>=.075){
  if(m.burstUntil>m.clock){m.burstUntil=0;m.cooldownUntil=m.clock+40}
  music61Choose('tension',th.kind==='none'?'danger':th.kind);return;
 }
 if(HD.state==='tension'&&!(m.safeFor>.65&&m.risk<.28&&m.stateAge>1.75))return;
 if(HD.state==='tension')music61Choose('everyday','relief');
 const ev=m.events,loops=ev.filter(e=>e.kind==='loop').length,types=new Set(ev.map(e=>e.kind));
 const chain=(loops>=2||ev.length>=3&&loops>=1&&types.size>=2)&&flow>=70&&Math.hypot(p.vx,p.vy)>650;
 const recovery=m.clock<m.recoveryUntil&&ev.some(e=>m.clock-e.at<.4&&e.kind==='sling')&&Math.hypot(p.vx,p.vy)>1000&&m.raw<.2;
 if(m.clock>=m.cooldownUntil&&m.burstUntil<=m.clock&&(chain||recovery)){
  m.burstStart=m.clock;m.burstUntil=m.clock+(recovery?4.5:6.5);m.burstReason=recovery?'recovery':'sequence';m.cooldownUntil=m.burstUntil+40;m.recoveryUntil=0;
 }
 if(m.burstUntil>m.clock){
  const quiet=m.clock-m.lastEvent>3.1&&p.mode==='normal'&&m.clock-m.burstStart>3.5;
  if(!quiet){music61Choose('epic',m.burstReason);return}m.burstUntil=0;
 }
 music61Choose('everyday','normal');
}
