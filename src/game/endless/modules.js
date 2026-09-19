function efAppendModule(m){
 const l=level,x=ef.nextX,v=m.variant,L=m.length,dist=(ef.offset+x)*EF_METRES,tier=Math.min(10,1+Math.floor(dist/800));
 const sec={x,end:x+L,safeX:x+210,id:ef.chunkId++,name:m.name,kind:m.kind,moduleId:m.id,tier,entry:m.entry,exit:m.exit,globalX:x+ef.offset,stars:[],flavorItems:[]};l.sections.push(sec);ef.lastExit=m.exit;ef.lastKind=m.kind;ef.recent.push(m.id);if(ef.recent.length>8)ef.recent.shift();ef.history.push({id:sec.id,module:m.id,at:sec.globalX});if(ef.history.length>64)ef.history.shift();
 const ground=(o)=>groundAt(l,x+o).y;
 const p=(xx,y,w=250,type='normal',move=0)=>{const q={x:x+xx,y,baseY:y,w,type,move,phase:(sec.id*1.7+xx*.002)};l.platforms.push(q);return q};
 const mat=(xx,w,type)=>l.materials.push({x:x+xx,w,type});
 const sp=(xx,power=870,boost=810)=>l.springs.push({x:x+xx,y:ground(xx),power,boost});
 const anc=(xx,y,type='sling')=>l.anchors.push({x:x+xx,y,type,lock:0});
 const bub=(xx,y,r=50)=>l.bubbles.push({x:x+xx,y,baseY:y,r,phase:xx*.008,lock:0});
 const gust=(xx,w,fy=-2700,fx=260,hot=false,vacuum=false)=>l.winds.push({x:x+xx,y:170,w,h:430,fy,fx,hot,vacuum});
 const flav=(xx,type,y)=>{const f={x:x+xx,y:y??ground(xx)-48,type,taken:false};l.flavors.push(f);sec.flavorItems.push(f);return f};
 const hazard=(xx,w=65)=>{l.hazards.push({x:x+xx,w});l.signs.push({x:x+xx-650,y:ground(xx-650),text:'SALTA →',type:'jump'})};
 const gate=(xx,type)=>l.gates.push({x:x+xx,w:68,type,broken:false});
 const press=(xx,type='roller')=>l.presses.push({x:x+xx,w:120,type,lock:0});
 const sweet=(xx,y,high=true)=>l.sweets.push({x:x+xx,y,taken:false,high});
 const star=(xx,y,kind='skill',label='RUTA DE RIESGO')=>{const s={x:x+xx,y,kind,label,taken:false,_efCounted:false};l.stars.push(s);sec.stars.push(s)};
 const gap=(xx,len,bridge=false)=>{l.gaps.push([x+xx,x+xx+len]);if(bridge)p(xx+len*.30,575,Math.max(190,len*.40),'cap');l.signs.push({x:x+xx-660,y:ground(xx-660),text:'HUECO →',type:'jump'})};
 const loop=(xx,r=185)=>l.loops.push({x:x+xx,y:ground(xx),r});
 const pipe=(xx,end,tall=0)=>l.tubes.push(tube([[x+xx,ground(xx)-20],[x+xx+220,390],[x+xx+480,170-tall],[x+end-380,150-tall],[x+end-140,350],[x+end,425]]));
 const enemy=(xx,type='bounce',y)=>l.enemies.push({x:x+xx,y:y??ground(xx)-30,baseY:y??ground(xx)-30,type,phase:xx*.007,lock:0,hits:0});
 // Every variant has a flat, obstacle-free entry and recovery exit. Curves have
 // zero slope at joins, so they cannot create a cliff between random modules.
 let nodes;
 switch(m.kind){
 case 'wave':nodes=v?[[0,560],[680,560],[1280,755],[2050,470],[2780,710],[L-610,560],[L,560]]:[[0,560],[650,560],[1350,710],[2160,435],[L-600,560],[L,560]];break;
 case 'ice':nodes=[[0,560],[650,560],[1180,570],[1850,755],[2580,570],[L-500,560],[L,560]];break;
 case 'sling':case 'sticky':case 'tower':nodes=[[0,560],[650,560],[1120,680],[1690,480],[2260,560],[L,560]];break;
 default:nodes=[[0,560],[560,560],[850,650+v*30],[1110,560],[L-700,560],[L,560]];
 }
 for(const [dx,y] of nodes)efNode(x+dx,y);
 let hint='';
 switch(m.kind){
 case 'wave':
  mat(680,480,'sugar');if(v){mat(2060,320,'gel');p(2380,360,420);star(2580,313)}else if(sec.id>0){p(1950,280,310);star(2090,235)}
  hint=sec.id===0?'← → para correr. SALTO para saltar. Mantén CHICLE en el suelo y suelta para acelerar.':'RESPIRA · Pendientes, azúcar y música. La siguiente combinación viene en camino.';break;
 case 'loop':
  mat(580,410,'sugar');l.boosts.push(x+1130);loop(v?1920:1740,v?230:177);p(v?2140:1990,v?230:275,340);star(v?2280:2110,v?185:230);
  hint='LOOP · Puedes salir saltando hacia una ruta alta. Mantener el impulso también es una opción.';break;
 case 'doubleloop':
  mat(580,450,'sugar');l.boosts.push(x+1090);loop(1550,v?215:170);loop(v?2700:2650,v?175:210);p(2930,240,270);star(3050,195);hint='DOBLE LOOP · Dos radios diferentes. Salta en la segunda vuelta para buscar la estrella.';break;
 case 'loopgap':
  mat(630,420,'sugar');l.boosts.push(x+1100);loop(1510,v?205:177);gap(2230,v?520:380,true);p(2410,255,200);star(2510,210);if(v)anc(2040,312);
  hint='LOOP + HUECO · Prepara el salto a la salida. La ruta alta tiene una estrella.';break;
 case 'leap':
  gap(1720,v?620:400,false);sp(1570,v?920:830,v?1020:860);p(1880,220,240);star(1990,170);if(v){anc(2440,310);mat(2800,300,'gel')}
  hint='SALTO LARGO · Muelle en la ruta baja; salto anticipado para alcanzar la plataforma alta.';break;
 case 'islands':
  gap(1550,v?1290:1010,false);for(let j=0;j<(v?4:3);j++)p(1550+j*310,450-(j%2)*80,230,j%2?'cap':'normal',v?22:0);
  p(1550+(v?1290:1010)-410,540,530,'cap');sp(1430,810,650);star(2170,270);anc(2310,268);hint='ISLAS · Encadena saltos. Bajo las plataformas no hay suelo.';break;
 case 'springs':
  sp(1270,820,680);sp(2130,v?1110:920,850);mat(1500,450,'gel');p(2520,v?180:260,290);star(2630,v?132:214);if(v)anc(2820,265);
  hint='GELATINA · Mantén CHICLE al caer para dirigir el rebote. No necesitas quedarte en el suelo.';break;
 case 'sling':
  anc(1690,385);anc(v?2380:2290,v?250:300);p(2600,v?220:310,370);star(2750,v?174:264);hazard(2320,65);if(v)sp(1190,710,550);
  hint='TIRACHINAS · Mantén CHICLE cerca del anclaje. ← → apunta. Suelta para salir disparado.';break;
 case 'sticky':
  anc(1670,330,'sticky');anc(2090,v?250:300,'sling');anc(2510,280,'sticky');p(2780,260,350);star(2940,213);hazard(2370,80);
  hint='ADHESIÓN · Puedes convertir el impulso en una catapulta. El suelo sigue siendo una alternativa.';break;
 case 'tower':
  p(1280,455,260);p(1650,355,300);p(2060,240,310,'tram',v?32:0);p(2470,325,380);sp(1120,800,600);anc(1930,240);star(2200,191);
  if(v)hazard(2670,90);hint='AZOTEAS · Plataformas altas con estrellas. Abajo hay una ruta más sencilla.';break;
 case 'bubble':
  l.pools.push({x:x+1250,w:1350,type:'soda'});bub(1570,390,v?62:50);bub(2240,v?248:320,52);sp(1320,590,410);p(2480,230,380);star(2650,182);flav(980,'cola');
  hint='BURBUJA · SALTO asciende. CHICLE revienta la burbuja y te devuelve el impulso.';break;
 case 'soda':
  l.pools.push({x:x+1370,w:1250,type:'soda'});mat(1310,1360,'soda');bub(1750,373);flav(990,'cola');p(2120,v?270:340,300,'cap');star(2260,v?222:293);if(v)gust(2400,300);
  hint='REFRESCO · COLA permite flotar manteniendo SALTO. La estrella no se recoge corriendo por abajo.';break;
 case 'fan':
  gust(1350,v?450:340,-2650,v?590:330);p(2080,260,420);star(2240,215);if(v){gust(2670,300,-2400,420);p(3130,335,260)}
  hint='CORRIENTE · Usa el viento para subir. Suelta SALTO y evita CHICLE si buscas altura.';break;
 case 'ice':
  mat(720,L-1250,'ice');l.boosts.push(x+990);p(1950,375,350);star(2120,324);if(v)hazard(2780,75);flav(2850,'mint');
  hint='HIELO · Frenas menos. Prepárate antes de llegar a un obstáculo.';break;
 case 'hot':
  mat(950,760,'ice');gust(1640,320,-1900,240,true);mat(2030,390,'chile');flav(1940,'chile');p(2600,265,310);star(2740,217);if(v)hazard(2780,80);
  hint='DESCONGELADO EXPRÉS · El aire caliente restaura elasticidad; el picante añade turbo.';break;
 case 'acid':
  flav(1140,'lemon');gate(1980,'acid');p(1680,335,260);star(1800,286);if(v){gate(2700,'acid');p(2480,335,240)}
  hint='LIMÓN · Disuelve las barreras. Saltar por encima también sirve.';break;
 case 'heavy':
  flav(1130,'watermelon');gate(2070,'wafer');p(1830,340,380,'wafer');star(2020,287);sp(1540,870,510);if(v){p(2700,370,380,'wafer');gate(2900,'wafer')}
  hint='SANDÍA · Cae con CHICLE para romper galletas. Puedes saltar las barreras sin destruirlas.';break;
 case 'wrap':
  press(1550,'wrapper');press(2390,v?'cutter':'wrapper');if(v)gust(2070,320,-2050,-320,false,true);p(1870,340,370);star(2030,290);
  hint='ENVASADO · Pulsa SALTO o CHICLE varias veces para abrir el envoltorio. La ruta alta evita las máquinas.';break;
 case 'roller':
  press(1570,'roller');press(2430,v?'cutter':'roller');p(1950,340,350);star(2090,289);if(v)mat(2560,380,'sugar');
  hint='FORMATO FAMILIAR · Rodillos y cortadoras deforman, pero no consumen vidas.';break;
 case 'slalom':
  hazard(1520,60+Math.min(tier,6)*5);hazard(v?2600:2490,v?120:70);p(1880,347,370);star(2050,297);if(v)anc(2190,287);
  hint='PINCHOS · Dos saltos deliberados. Los carteles avisan con antelación.';break;
 case 'press':
  for(let j=0;j<(v?2:1);j++)l.efTraps.push({x:x+1700+j*1120,y:560,w:130,period:3.1,phase:(sec.id*.71+j*1.25)%3.1,kind:'press',tier});
  p(1920,310,370);star(2090,263);l.signs.push({x:x+1000,y:ground(1000),text:'PRENSA !',type:'jump'});if(v)anc(2570,286);
  hint='PRENSA TEMPORIZADA · Ámbar avisa, rojo aplasta. Salta por la ruta alta o mide el paso.';break;
 case 'tube':
  pipe(1280,v?2970:2480,v?90:0);p(1710,300,300);star(1860,249);if(v){mat(3040,310,'gel');flav(3240,'strawberry')}
  hint='TUBO · La ruta guiada conserva velocidad. Salta antes de entrar para ir a por la estrella.';break;
 case 'tongue':
  mat(1310,1380,'tongue');sp(1250,690,590);p(1940,285,340,'tooth',v?33:0);p(2530,320,320,'tooth');star(2090,235);if(v)press(2830,'tooth');
  hint='LENGUA ELÁSTICA · Encadena rebotes entre dientes. No hace falta explicar qué estás pisando.';break;
 case 'vacuum':
  gust(1420,500,-2400,-430,false,true);anc(1990,305);gust(2300,v?470:320,-2900,690);p(2920,255,370);star(3080,207);if(v)press(2690,'wrapper');
  hint='CORRIENTES CRUZADAS · El anclaje permite redirigir el movimiento sin pelearte con el viento.';break;
 }
 // Sparse ground sweets prevent the life economy from becoming automatically infinite.
 for(let xx=470;xx<L-220;xx+=190){const wx=x+xx;if(inGap(l,wx)||l.hazards.some(h=>wx>h.x-75&&wx<h.x+h.w+65)||l.gates.some(g=>Math.abs(wx-g.x)<95))continue;sweet(xx,ground(xx)-48,false)}
 for(const plat of l.platforms.filter(q=>q.x>=x&&q.x<x+L))for(let xx=plat.x+45;xx<plat.x+plat.w-25;xx+=88)l.sweets.push({x:xx,y:plat.y-42,taken:false,high:true});
 if(sec.id%4===2){l.props.push({x:x+430,y:365,type:'board',text:EF_GAGS[sec.id%EF_GAGS.length]})}
 if(sec.id%9===5){l.npcs.push({x:x+L-430,type:'coffee',text:EF_COFFEE[Math.floor(sec.id/9)%EF_COFFEE.length],said:false})}
 if(efRandom()<.12)l.props.push({x:x+L-520,y:ground(L-520)-90,type:'vending'});
 if(sec.id%11===7)l.npcs.push({x:x+460,type:'bubble',text:'Yo llevo aquí desde antes de que existiera el final.',said:false});
 sec.hint=hint;ef.nextX=x+L;l.length=ef.nextX;
}
