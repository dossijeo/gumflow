function efAppendBoss(){
 const x=ef.nextX,L=3200,idx=Math.floor(efRandom()*7),rank=++ef.nextBossIndex,a=x+750,w=1360,def={...BOSS_BOOK[idx]};def.name=def.short+' · Mk.'+rank;
 for(const [dx,y] of [[0,560],[750,560],[2110,560],[L,560]])efNode(x+dx,y);
 const hp=Math.min(5,3+Math.floor((rank-1)/3));
 const b={index:idx,def,start:a,end:a+w,w,entry:x+330,x:a+w*.54,y:300,phase:'intro',t:0,active:false,defeated:false,hp,maxHp:hp,round:0,hurt:0,hazards:[],emitted:0,opening:false,targetX:a+w*.52,hitCount:0,wonTime:0,pads:[{x:a+185,dir:1},{x:a+w-185,dir:-1}],padLock:0,rank,ef:true};
 const sec={x,end:x+L,safeX:x+330,id:ef.chunkId++,name:def.name,kind:'efboss',moduleId:'boss-'+idx,tier:Math.min(10,1+rank),boss:b,globalX:ef.offset+x};level.sections.push(sec);
 level.platforms.push({x:a+270,y:457,baseY:457,w:170,type:'normal',move:0,phase:0},{x:a+w-440,y:457,baseY:457,w:170,type:'normal',move:0,phase:0});
 level.signs.push({x:x+150,y:560,text:'MINIJEFE →',type:'end'});
 for(let dx=2220;dx<L-200;dx+=180)level.sweets.push({x:x+dx,y:512,taken:false});
 sec.hint='MINIJEFE · Esquiva y salta al núcleo VERDE. Gelatinas con SALTO / CHICLE. Premio: ★ + vida + dulces.';ef.nextX=x+L;level.length=ef.nextX;ef.lastKind='boss';
}

