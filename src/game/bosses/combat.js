function setBossPhase(b,phase){
 b.phase=phase;b.t=0;b.emitted=0;b.opening=phase==='open';
 if(phase==='warning'){
  b.hazards=[];b.targetX=clamp(player.x,b.start+200,b.end-200);
  tip(b.def.warning,3);
  if(b.index===0)for(const dx of [-230,0,230])b.hazards.push({kind:'press',x:clamp(b.targetX+dx,b.start+100,b.end-100),y:560,age:0,delay:1.2+Math.abs(dx)/350,duration:.38,w:110});
  if(b.index===3)b.hazards.push({kind:'beam',x:b.start,y:535,age:0,delay:1.25,duration:.48,w:b.w},{kind:'beam',x:b.start,y:393,age:0,delay:2.4,duration:.48,w:b.w});
 }
 if(phase==='open'){
  b.hazards=[];b.targetX=b.start+b.w*[.50,.67,.33,.52][b.round%4];
  tip(b.def.open,4.8);sound('check');
 }
}
function wakeBoss(b){
 if(b.active||b.defeated)return;
 b.active=true;b.phase='intro';b.t=0;b.hazards=[];b.x=b.start+b.w*.54;b.y=290;
 for(const chase of level.chases){chase.active=false;chase.done=true}
 $('dialogue').classList.remove('show');dialogueTime=0;
 tip(b.def.intro,4.5);toast('JEFE FINAL · '+b.def.short);bannerTime=0;
 // Completing a platforming stage guarantees the boss checkpoint, even on a high route.
 checkpoint=level.checkpoints.length;level.checkpoints.forEach(c=>c.active=true);saveSession();
}
function resetEncounter(){const b=level?.boss;if(!b||b.defeated)return;b.active=false;b.phase='intro';b.t=0;b.hp=b.maxHp;b.round=0;b.hurt=0;b.hazards=[];b.opening=false;b.hitCount=0;b.padLock=0;}
function damageBoss(b){
 if(b.phase!=='open'||b.hurt>0||b.defeated)return;
 b.hp--;b.hitCount++;b.round++;b.hurt=.75;b.hazards=[];run.score+=750;flow=clamp(flow+23,0,100);
 burst(b.x,b.y+24,38,b.def.color,440);floatText(b.x,b.y-110,'¡CRACK! · '+b.hp,b.def.color);sound('bossHit');shake=reduced?0:6;
 player.vy=-510;player.grounded=false;player.platform=null;player.drop=false;player.inv=Math.max(player.inv,.85);player.squash=-.6;
 if(b.hp<=0){
  b.defeated=true;b.opening=false;b.phase='defeated';b.t=0;b.wonTime=levelTime;run.score+=2000;
  const old=profile.bosses||[];profile.bosses=Array.from(new Set([...old,levelIndex]));
  toast('JEFE VENCIDO · SALIDA ABIERTA');tip(b.def.outro,7);sound('win');saveSession();persist();
 }else{setBossPhase(b,'recover');tip(['Eso ha sonado caro.','El presupuesto no cubría esto.','Calidad: cuestionable. Chicle: excelente.'][b.round%3],2)}
}
function bossDangerHit(kind){
 const p=player;if(p.inv>0||state!=='playing')return;
 if(kind==='box'){p.wrapped=2.7;p.wrapHits=0;p.wrapLock=3.2;p.inv=1.1;p.vx*=.55;p.speed*=.55;burst(p.x,p.y,12,'#d0b5ff',190);tip('¡ENVUELTO! Pulsa SALTO o CHICLE para abrir.',2.5);sound('hurt')}
 else loseLife('boss');
}
function bossStep(dt){
 const b=level?.boss,p=player;if(!b||state!=='playing')return;
 if(!b.active&&!b.defeated&&p.x>=b.start-55)wakeBoss(b);
 if(!b.active)return;
 b.t+=dt;b.hurt=Math.max(0,b.hurt-dt);b.padLock=Math.max(0,b.padLock-dt);
 if(b.defeated){if(b.t<2&&Math.floor(b.t*20)!==b.emitted){b.emitted=Math.floor(b.t*20);burst(b.x+rnd(-85,85),b.y+rnd(-55,70),3,b.def.color,180)}return}
 // Visible energy doors, never an invisible blocker at the old finish line.
 if(p.x<b.start+30){p.x=b.start+30;if(p.vx<0){p.vx=0;p.speed=0}}
 if(p.x>b.end-30){p.x=b.end-30;if(p.vx>0){p.vx=0;p.speed=0}}
 if(b.phase==='intro'&&b.t>2.1)setBossPhase(b,'warning');
 else if(b.phase==='warning'&&b.t>1.15)setBossPhase(b,'attack');
 else if(b.phase==='attack'&&b.t>2.65)setBossPhase(b,'open');
 else if(b.phase==='open'&&b.t>5.5)setBossPhase(b,'warning');
 else if(b.phase==='recover'&&b.t>1.1)setBossPhase(b,'warning');
 const open=b.phase==='open',rest=b.phase==='recover';
 if(b.phase==='attack'&&(b.index===2||b.index===6)){
  const u=clamp(b.t/1.15,0,2),v=u<=1?u:2-u;
  b.x=lerp(b.start+125,b.end-125,v);b.y=b.index===6?492:498;
  const rw=b.index===6?120:53,rh=b.index===6?34:42;
  if(Math.abs(p.x-b.x)<rw+R*.7&&Math.abs(p.y-b.y)<rh+R*.7)bossDangerHit('charge');
 }else{
  b.x=lerp(b.x,open?b.targetX:b.start+b.w*.55,Math.min(1,dt*(open?5:2.5)));
  b.y=lerp(b.y,open?407:rest?330:292+Math.sin(levelTime*2)*18,Math.min(1,dt*5));
 }
 if(b.phase==='attack'){
  if(b.index===0&&b.emitted===0){b.emitted++;for(const dir of [-1,1])b.hazards.push({kind:'wave',x:b.targetX,y:538,vx:dir*390,vy:0,r:18,age:0,life:3})}
  if(b.index===1&&b.t>b.emitted*.62&&b.emitted<4){const vx=[-240,80,-80,240][b.emitted++];b.hazards.push({kind:'fizz',x:b.x,y:b.y+50,vx,vy:-180,r:20,age:0,life:2.6,bounces:0})}
  if(b.index===4&&b.t>b.emitted*.30&&b.emitted<8){b.emitted++;b.hazards.push({kind:'drop',x:clamp(p.x+Math.sin(b.emitted*2.3)*210,b.start+60,b.end-60),y:80,vy:0,vx:0,r:20,age:0,delay:.72,life:2.8})}
  if(b.index===5&&b.t>b.emitted*.62){b.emitted++;b.hazards.push({kind:'box',x:b.emitted%2?b.start+50:b.end-50,y:b.emitted%2?521:433,vx:b.emitted%2?460:-460,vy:0,r:24,age:0,life:3.5});p.vx+=Math.sign(b.x-p.x)*25*dt}
  if(b.index===6&&b.emitted===0){b.emitted++;for(let j=0;j<3;j++)b.hazards.push({kind:'fizz',x:b.end-120,y:250+j*45,vx:-260-j*35,vy:-70,r:15,age:0,life:2.3,bounces:0})}
 }
 for(const h of b.hazards){
  h.age+=dt;
  if(h.kind==='press'||h.kind==='beam'){
   if(h.age>=h.delay&&h.age<h.delay+h.duration){
    if(h.kind==='press'&&Math.abs(p.x-h.x)<h.w*.5+R*.55&&p.y>370)bossDangerHit('press');
    if(h.kind==='beam'&&Math.abs(p.y-h.y)<17)bossDangerHit('beam');
   }
   continue;
  }
  if(h.kind==='drop'&&h.age<h.delay)continue;
  h.x+=h.vx*dt;h.y+=h.vy*dt;if(h.kind==='fizz'||h.kind==='drop')h.vy+=750*dt;
  if(h.y>539&&h.kind==='fizz'&&h.bounces<1){h.y=538;h.vy=-300;h.bounces++}
  if(h.y>580)h.life=0;
  if(Math.hypot(p.x-h.x,p.y-h.y)<h.r+R*.7){bossDangerHit(h.kind);h.life=0}
 }
 b.hazards=b.hazards.filter(h=>h.delay!==undefined&&(h.kind==='press'||h.kind==='beam')?h.age<h.delay+h.duration+.15:h.age<h.life&&h.x>b.start-100&&h.x<b.end+100);
 if(state!=='playing')return;
 // The core is hit with the existing jump / elastic impact, not a new attack button.
 if(open&&!p.grounded&&p.mode==='normal'&&hitSegment(b.x,b.y+24,57))damageBoss(b);
}
