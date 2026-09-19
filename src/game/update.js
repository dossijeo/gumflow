function update(dt,override){
 if(state==='dying'){deathTimer-=dt;updateEffects(dt);if(deathTimer<=0)respawn();return}
 if(state==='finishing'){transitionTimer-=dt;player.x+=player.vx*dt;player.y=groundAt(level,player.x).y-R;player.angle=Math.atan(groundAt(level,player.x).slope);updateEffects(dt);if(transitionTimer<=0)results();return}
 if(state!=='playing')return;
 input=override||readInput();const p=player;p.jumpEdge=input.jump&&!lastJumpInput;p.elasticEdge=input.elastic&&!prevElastic;if(p.jumpEdge)jumpBuffer=.15;lastJumpInput=input.jump;
 jumpBuffer=Math.max(0,jumpBuffer-dt);coyote=p.grounded?.13:Math.max(0,coyote-dt);cooldown=Math.max(0,cooldown-dt);
 p.px=p.x;p.py=p.y;p.inv=Math.max(0,p.inv-dt);p.loopLock=Math.max(0,p.loopLock-dt);p.tubeLock=Math.max(0,p.tubeLock-dt);p.springLock=Math.max(0,p.springLock-dt);p.squash*=Math.exp(-dt*10);
 levelTime+=dt;bannerTime=Math.max(0,bannerTime-dt);beforeSpecials(dt);
 if(p.mode==='loop')updateLoop(dt);else if(p.mode==='tube')updateTube(dt);else if(p.mode==='anchor')updateAnchor(dt);else if(p.mode==='bubble')updateBubble(dt);else updateNormal(dt);
 const speed=Math.hypot(p.vx,p.vy*.45);peakSpeed=Math.max(peakSpeed,speed);if(speed>450)flow=clamp(flow+dt*(speed-300)/100,0,100);else if(p.mode!=='anchor')flow=Math.max(0,flow-dt*14);
 const mult=1+Math.min(3,Math.floor(flow/26));
 for(const sweet of level.sweets){if(sweet.taken||Math.abs(sweet.x-p.x)>80||Math.abs(sweet.y-p.y)>85)continue;if(hitSegment(sweet.x,sweet.y,39)){sweet.taken=true;run.sugar++;run.totalSugar++;levelCollected++;run.score+=10*mult*(sweet.high?2:1);burst(sweet.x,sweet.y,4,level.palette.bright,85);sound('sugar');if(run.sugar>=60){run.sugar-=60;if(run.lives<5){run.lives++;toast('+1 VIDA · ¡QUÉ DULCE!');sound('life')}else{run.score+=500;toast('VIDAS AL MÁXIMO · +500')}}}}
 afterSpecials(dt);
 for(let i=0;i<level.checkpoints.length;i++){const c=level.checkpoints[i];if(p.x>=c.x&&checkpoint<i+1){checkpoint=i+1;c.active=true;run.score+=150;toast('CHECKPOINT '+checkpoint+'/'+level.checkpoints.length+' · GUARDADO');sound('check');burst(c.x,c.y-80,22,level.palette.bright,200);saveSession()}}
 if(p.mode==='normal'){
  for(const h of level.hazards){const y=groundAt(level,h.x+h.w/2).y;if(p.x+R*.65>h.x&&p.x-R*.65<h.x+h.w&&p.y+R*.8>y-28&&p.y-R<y+17){loseLife('spike');break}}
  if(state==='playing'&&(p.y>1150||(inGap(level,p.x)&&p.y>groundAt(level,p.x).y+225))){p.inv=0;loseLife('fall')}
 }
 if(state==='playing'&&p.x>=level.finish&&p.y<groundAt(level,p.x).y+30&&p.mode==='normal')completeLevel();
 for(let i=0;i<level.tips.length;i++){const t=level.tips[i];if(p.x>=t.x&&p.x<t.end&&!level.seenTips.has(i)){level.seenTips.add(i);tip(t.text,7);break}}
 prevElastic=input.elastic;updateEffects(dt);music(dt);
}

