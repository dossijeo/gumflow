function surfaceAt(x){return level.materials.find(m=>x>=m.x&&x<=m.x+m.w)?.type||null}
function hitSegment(x,y,r=45){const p=player,dx=p.x-p.px,dy=p.y-p.py,den=dx*dx+dy*dy,t=den?clamp(((x-p.px)*dx+(y-p.py)*dy)/den,0,1):0;return Math.hypot(x-(p.px+dx*t),y-(p.py+dy*t))<r}
function applyFlavor(type){player.flavor=type;player.flavorTime=14;flavorSeen.add(type);profile.tasted=Array.from(new Set([...(profile.tasted||[]),type]));if(profile.tasted.length>=6)award('flavors');toast('SABOR '+FLAVORS[type].name+' · '+FLAVORS[type].desc);sound('life');burst(player.x,player.y,24,FLAVORS[type].color,230);persist()}
function beforeSpecials(dt){
 const p=player;p.material=surfaceAt(p.x);
 for(const key of ['flavorTime','cold','warm','coat','flat','strip','cut','wrapped','wrapLock','anchorLock','bubbleLock','shock','npcHit'])p[key]=Math.max(0,(p[key]||0)-dt);
 if(p.flavorTime<=0)p.flavor=null;
 if(p.material==='ice'&&p.grounded&&p.warm<=0)p.cold=1.1;if(p.material==='chocolate'&&p.grounded)p.coat=4;
 if(p.material==='mint')p.cold=Math.max(p.cold,.5);
 if(p.grounded)p.floatFuel=2;
 if(Math.abs(p.vx)<15&&p.grounded&&!input.elastic&&!input.jump&&!input.left&&!input.right)p.idle+=dt;else p.idle=0;
 for(const a of level.anchors)a.lock=Math.max(0,a.lock-dt);
 for(const b of level.bubbles){b.lock=Math.max(0,b.lock-dt);b.y=b.baseY+Math.sin(levelTime*1.5+b.phase)*65}
 for(const e of level.enemies){e.lock=Math.max(0,e.lock-dt);e.y=e.baseY+Math.sin(levelTime*3+e.x)*7}
 for(const plat of level.platforms)if(plat.move){const old=plat.y;plat.y=plat.baseY+Math.sin(levelTime*1.6+plat.phase)*plat.move;if(p.platform===plat)p.y+=plat.y-old}
 if(p.wrapped>0){if(p.jumpEdge||p.elasticEdge){p.wrapHits++;p.squash=.6;sound('bounce')}if(p.wrapHits>=4){p.wrapped=0;burst(p.x,p.y,18,'#ead5ff',240);award('wrap');floatText(p.x,p.y-45,'ABREFÁCIL. MÁS O MENOS.')}}
 if(p.mode==='normal'&&p.anchorLock<=0&&input.elastic){for(const a of level.anchors){if(a.lock<=0&&Math.hypot(p.x-a.x,p.y-a.y)<(a.type==='sling'?155:118)){
  p.mode='anchor';p.anchor=a;p.modeTime=0;p.aim=-.73;p.tension=.12;p.stored=Math.hypot(p.vx,p.vy);p.grounded=false;p.platform=null;p.vx=0;p.vy=0;charge=0;sound('boost');tip('← → APUNTA · SUELTA CHICLE PARA LANZARTE',2);break;
 }}}
 if(p.mode==='normal'&&p.bubbleLock<=0&&!input.elastic&&!p.grounded){for(const b of level.bubbles)if(b.lock<=0&&Math.hypot(p.x-b.x,p.y-b.y)<b.r+10){p.mode='bubble';p.bubble=b;p.modeTime=0;p.vx=Math.max(330,p.vx*.65);p.vy=-200;p.drop=false;charge=0;sound('bounce');award('bubble');break}}
}
function updateAnchor(dt){
 const p=player,a=p.anchor;p.modeTime+=dt;p.tension=clamp(p.tension+dt*.8,0,1);p.aim=clamp(p.aim+(Number(input.right)-Number(input.left))*dt*.95,-1.25,-.24);
 p.x=lerp(p.x,a.x-45-p.tension*90,Math.min(1,dt*12));p.y=lerp(p.y,a.y+35+p.tension*55,Math.min(1,dt*12));p.angle=0;p.squash=-.6;charge=p.tension;
 if(!input.elastic||p.modeTime>2.05){const v=clamp(950+p.tension*450+p.stored*.1,950,1550);p.mode='normal';p.vx=Math.cos(p.aim)*v;p.vy=Math.sin(p.aim)*v;p.grounded=false;p.drop=false;p.manualJump=false;p.anchorLock=1.1;a.lock=1.2;cooldown=.65;charge=0;p.squash=-.8;flow=clamp(flow+18,0,100);burst(p.x,p.y,22,level.palette.accent,340);floatText(p.x,p.y-55,'¡FWOOSH!',level.palette.accent);sound('spring');award('sling')}
}
function updateBubble(dt){
 const p=player;p.modeTime+=dt;const dir=Number(input.right)-Number(input.left);p.vx=lerp(p.vx,420+dir*190,dt*2);p.vy=input.jump?-340:-150;p.x+=p.vx*dt;p.y+=p.vy*dt;p.angle=0;p.drop=false;
 if(input.elastic||p.modeTime>2.1){p.mode='normal';p.vx=Math.max(760,p.vx);p.vy=-480;p.bubble.lock=2;p.bubbleLock=1.4;p.manualJump=false;cooldown=.55;flow=clamp(flow+13,0,100);burst(p.x,p.y,22,'#d3b5ff',280);sound('spring');floatText(p.x,p.y-50,'¡POP!')}
}
function afterSpecials(dt){
 const p=player;
 for(const f of level.flavors){if(!f.taken&&hitSegment(f.x,f.y,49)){f.taken=true;applyFlavor(f.type)}}
 for(const st of level.stars){const touches=st.kind==='speed'?(Math.abs(p.x-st.x)<35&&p.y<570&&p.y>-180):hitSegment(st.x,st.y,48);if(st.taken||!touches)continue;
  if(st.kind==='speed'&&Math.abs(p.vx)<800){if(!st.warned){st.warned=true;say('ESTRELLA DE IMPULSO','Necesitas más velocidad. Carga CHICLE y cruza de nuevo.',4)}continue}
  st.taken=true;run.score+=1500;burst(st.x,st.y,35,'#fff0a5',330);sound('life');toast('★ '+st.label+' · '+level.stars.filter(v=>v.taken).length+'/3');
 }
 for(const d of level.documents){if(!d.taken&&hitSegment(d.x,d.y,58)){d.taken=true;if(!profile.lore.includes(d.id)){profile.lore.push(d.id);persist()}run.score+=300;say('INFORME ARCHIVADO · '+(d.id+1)+'/7',WORLDS[d.id].text,7);sound('check');if(profile.lore.length===7)award('lore')}}
 if(p.mode==='normal'){
  for(const wi of level.winds){if(p.x>wi.x&&p.x<wi.x+wi.w&&p.y>wi.y&&p.y<wi.y+wi.h){if(p.grounded){p.grounded=false;p.platform=null;p.vy=-130}p.vx=clamp(p.vx+wi.fx*dt,-MAX_SPEED,MAX_SPEED);p.vy=clamp(p.vy+wi.fy*dt,-900,1400);if(wi.hot){p.warm=5;p.cold=0}}}
  for(const pool of level.pools){if(p.x<pool.x||p.x>pool.x+pool.w)continue;const y=groundAt(level,p.x).y;
   if(pool.type==='freeze'&&p.flavor==='mint'){if(!level.frozen.some(f=>f.pool===pool)){level.frozen.push({pool,time:14});if(p.grounded){p.platform={x:pool.x,y:y-70,w:pool.w,icePool:pool};p.y=y-70-R;p.py=p.y;}}}
   if(pool.type==='soda'&&p.y>y-65){p.vy-=dt*480;if(p.grounded){p.speed*=Math.exp(-dt*.5);if(input.jump){p.vy=-900;p.grounded=false}}}
   if(pool.type==='chocolate'&&p.y>y-80)p.coat=4;
  }
  for(const fr of level.frozen){fr.time-=dt;const po=fr.pool,gy=groundAt(level,p.x).y-70;if(fr.time>0&&p.x>po.x&&p.x<po.x+po.w&&p.vy>=0&&p.y+R>gy&&p.py+R<gy+45){land(gy,0,{x:po.x,y:gy,w:po.w});p.cold=0;}}
  if(p.platform?.icePool&&!level.frozen.some(fr=>fr.pool===p.platform.icePool&&fr.time>0)){p.platform=null;p.grounded=false;}
  level.frozen=level.frozen.filter(fr=>fr.time>0);
  for(const g of level.gates){if(g.broken||Math.abs(p.x-g.x)>g.w+45)continue;const gy=groundAt(level,g.x).y;
   if(g.type==='acid'&&p.flavor==='lemon'&&p.y>gy-160){g.broken=true;burst(g.x,gy-50,22,'#ffed83',240);floatText(g.x,gy-120,'ÁCIDO, PERO EDUCADO');sound('spring');run.score+=200}
   else if(g.type==='wafer'&&(p.flavor==='watermelon'&&(p.drop||p.vy>200))&&p.y>gy-220){g.broken=true;burst(g.x,gy-45,26,'#cfa381',250);floatText(g.x,gy-120,'PESO NETO');sound('spring');p.vy=-480;run.score+=200}
   else if(!g.broken&&p.y+R>gy-112&&p.y-R<gy&&p.px<g.x-g.w/2&&p.x>=g.x-g.w/2){p.x=g.x-g.w/2-R;p.speed=-150;p.vx=-150;p.squash=.9;p.flat=.5;flow=Math.max(0,flow-15);say('GUM · PLAN B',g.type==='acid'?'Limón disuelve. Saltar también sirve.':'Con sandía puedes romperla. O saltar por encima.',3)}
  }
  for(const m of level.presses){const gy=groundAt(level,m.x).y;if(p.x>m.x-m.w/2&&p.x<m.x+m.w/2&&p.y>gy-125&&(m.lock||0)<=0){m.lock=3;m.done=true;if(m.type==='wrapper'){wrapPlayer();}else if(m.type==='cutter'){p.cut=.85;floatText(p.x,p.y-65,'REUNIÓN DE EQUIPO');sound('bounce')}else if(m.type==='roller'){p.strip=1.1;p.vx=Math.max(700,p.vx);p.speed=Math.max(700,p.speed);floatText(p.x,p.y-65,'FORMATO FAMILIAR');award('flat')}else{p.flat=.9;p.speed=Math.max(450,p.speed);floatText(p.x,p.y-65,'A4, SIN MÁRGENES');award('flat')}burst(p.x,p.y,10,'#ffafcd',120)}}
  for(const e of level.enemies){if(e.lock>0||!hitSegment(e.x,e.y,52))continue;e.lock=2.8;e.hits++;
   if(e.type==='wrapper'){wrapPlayer()}else if(e.type==='straw'){p.grounded=false;p.platform=null;p.vx=Math.max(850,p.vx);p.vy=-700;p.shock=.6;floatText(p.x,p.y-55,'¡FUUU!',level.palette.accent);sound('spring')}
   else{p.grounded=false;p.platform=null;p.vx=Math.max(e.type==='bomb'?1100:760,p.vx);p.vy=e.type==='bomb'?-820:-900;p.squash=.8;p.drop=false;p.manualJump=false;cooldown=.45;run.score+=150;flow=clamp(flow+10,0,100);burst(e.x,e.y,20,e.type==='bomb'?'#ffbf79':'#dfff91',300);sound('bounce');floatText(p.x,p.y-65,e.type==='bomb'?'IMPULSO NO HOMOLOGADO':'¡BOING!')}
  }
 }
 for(const m of level.presses)m.lock=Math.max(0,(m.lock||0)-dt);
 for(const c of level.chases){if(p.x>c.start&&!c.done&&!c.active){c.active=true;c.x=p.x-650;say('QA-RL',levelIndex<5?'INSPECCIÓN EN MOVIMIENTO. NO SE DETENGA.':'PROTEGER A 0G-17. PROCEDO A HACER DE ESCOLTA.',4)}
  if(c.active){c.x+=Math.min(c.speed,Math.max(250,(p.x-c.x)*1.2))*dt;if(p.x-c.x>1200)c.x=p.x-1200;if(p.x>c.end){c.active=false;c.done=true;run.score+=500;say('QA-RL',levelIndex<5?'La incidencia se ha escapado de nuevo.':'Acompañamiento completado. Todo está razonablemente fuera de control.',4)}else if(c.x>p.x-60&&p.npcHit<=0){p.npcHit=2.5;p.vx=1100;p.speed=1100;p.vy=-430;p.grounded=false;p.platform=null;run.score=Math.max(stageBase.score,run.score-100);p.shock=1;floatText(p.x,p.y-65,'INSPECCIÓN + EMPUJÓN');sound('spring')}}
 }
 for(const n of level.npcs){if(!n.said&&p.x>n.x-140){n.said=true;n.time=levelTime;say(n.type==='coffee'?'EMPLEADO DEL MES':n.type==='bubble'?'BUBBLE':n.speaker||'DR. CHEW',n.text,4.2);if(n.type==='coffee')award('coffee');if(n.type==='bubble')setTimeout(()=>{if(state==='playing'&&Math.abs(player.x-n.x)<1500)say('BUBBLE','La pared se ha movido. Lo habéis visto todos.',3)},650)}}
 const newChapter=level.sections.findIndex(s=>p.x>=s.x&&p.x<s.end);if(newChapter>=0&&newChapter!==chapter){chapter=newChapter;$('chapterHUD').textContent=`${String(chapter+1).padStart(2,'0')} / ${String(level.sections.length).padStart(2,'0')} · ${level.sections[chapter].name.toUpperCase()}`}
 if(flow>=99)award('flow');if(levelTime>2)award('first');
 dialogueTime-=dt;if(dialogueTime<=0)$('dialogue').classList.remove('show');
}
function wrapPlayer(){const p=player;if(p.wrapLock>0)return;p.wrapped=3.5;p.wrapLock=5;p.wrapHits=0;p.squash=.6;floatText(p.x,p.y-65,'ABREFÁCIL*');say('LETRA PEQUEÑA','Pulsa SALTO o CHICLE varias veces. *Fácil para la máquina, no para ti.',3);sound('hurt')}

