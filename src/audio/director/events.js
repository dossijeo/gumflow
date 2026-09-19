function music61Choose(next,reason){
 if(HD.state!==next){
  if(HD.state==='tension'&&next==='everyday'&&MUSIC61.clock-MUSIC61.tensionSince>=5.5)MUSIC61.recoveryUntil=MUSIC61.clock+4;
  if(next==='tension')MUSIC61.tensionSince=MUSIC61.clock;
  MUSIC61.history.push({at:+MUSIC61.clock.toFixed(2),from:HD.state,to:next,reason,x:Math.round((ef?.offset||0)+(player?.x||0)),risk:+MUSIC61.raw.toFixed(2)});
  if(MUSIC61.history.length>120)MUSIC61.history.shift();MUSIC61.stateAge=0;
 }
 HD.state=next;HD.reason=reason;
}
function music61Reset(){
 const m=MUSIC61,x=(ef?.offset||0)+(player?.x||0);
 if(m.run!==run)m.cooldownUntil=0;
 Object.assign(m,{level,run,scan:0,raw:0,risk:0,threat:'none',ttc:Infinity,candidateAge:0,stateAge:0,safeFor:0,stall:0,progressX:x,prevX:x,prevMode:null,prevRef:null,prevSpring:0,prevDrop:false,events:[],deathSites:[],lastDeaths:run?.totalDeaths||0,burstUntil:0,recoveryUntil:0,wasBoss:false,graceUntil:m.clock+.5});
 m.recentIds.clear();HD.stall=0;HD.recentDeaths=0;HD.tension=0;HD.world=level;HD.candidate='everyday';HD.rush=0;music61Choose('everyday','normal');
}
function music61Event(kind,ref){
 const m=MUSIC61;if(state!=='playing'||!ref)return;
 const globalX=(ef?.offset||0)+(ref.x??player.x),id=kind+':'+Math.round(globalX);
 if(m.clock-(m.recentIds.get(id)??-100)<25)return;
 m.recentIds.set(id,m.clock);m.events.push({kind,at:m.clock,id,x:globalX});m.lastEvent=m.clock;
 if(m.events.length>16)m.events.shift();
 if(m.recentIds.size>50)for(const [k,t]of m.recentIds)if(m.clock-t>30)m.recentIds.delete(k);
}
function music61Movements(){
 const m=MUSIC61,p=player;if(!p)return;
 const ref=p.mode==='loop'?p.loop:p.mode==='tube'?p.tube:p.mode==='anchor'?p.anchor:null;
 if(p.mode==='loop'&&(m.prevMode!=='loop'||ref!==m.prevRef))music61Event('loop',ref);
 if(p.mode==='tube'&&(m.prevMode!=='tube'||ref!==m.prevRef))music61Event('tube',ref?.points?.[0]);
 if(m.prevMode==='anchor'&&p.mode==='normal'&&Math.hypot(p.vx,p.vy)>820)music61Event('sling',m.prevRef);
 if(p.springLock>.5&&m.prevSpring<=.05)music61Event('spring',{x:player.x});
 if(m.prevDrop&&!p.drop&&p.vy<-480)music61Event('bounce',{x:player.x});
 m.prevMode=p.mode;m.prevRef=ref;m.prevSpring=p.springLock||0;m.prevDrop=p.drop;
 m.events=m.events.filter(e=>m.clock-e.at<=9);
}
