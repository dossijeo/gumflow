function makeLevel(index){
 const w=WORLDS[index],l={name:w.name,subtitle:w.subtitle,palette:WORLD_PALETTES[index],length:0,finish:0,spawn:150,nodes:[[0,560]],gaps:[],loops:[],springs:[],boosts:[],hazards:[],checkpoints:[],platforms:[],tubes:[],sweets:[],signs:[],tips:[],seenTips:new Set(),sections:[],materials:[],anchors:[],bubbles:[],winds:[],flavors:[],gates:[],presses:[],enemies:[],stars:[],documents:[],npcs:[],props:[],events:new Set(),pools:[],frozen:[],chases:[],endPulse:0};
 let x=0;
 const node=(xx,yy)=>{const last=l.nodes.at(-1);if(xx===last[0])last[1]=yy;else l.nodes.push([xx,yy])};
 const platform=(xx,y,width=270,type='normal',move=0)=>{const p={x:xx,y,baseY:y,w:width,type,move,phase:xx*.013};l.platforms.push(p);return p};
 const spring=(xx,power=860,boost=850)=>l.springs.push({x:xx,power,boost});
 const material=(xx,len,type)=>l.materials.push({x:xx,w:len,type});
 const flavor=(xx,type,y=null)=>l.flavors.push({x:xx,y,type,taken:false});
 const anchor=(xx,y,type='sling')=>l.anchors.push({x:xx,y,type,lock:0});
 const tubeAt=(xx,len=1120)=>l.tubes.push({build:xx,len});
 const gap=(xx,len=470)=>{l.gaps.push([xx,xx+len]);spring(xx-100,980,900);platform(xx+len*.4,260,200)};
 const sign=(xx,text,type='loop')=>l.signs.push({x:xx,text,type});
 const lengths={start:3050,loop:3000,roller:3250,sling:3400,tube:3250,bounce:3400,sticky:3400,chase:3500,soda:3150,bubble:3400,fan:3150,acid:3300,city:3200,tower:3600,ice:3350,hot:3300,heavy:3500,wrap:3350,vacuum:3400,mouth:3200,tooth:3350,tongue:3450,final:3900};
 for(let i=0;i<w.modules.length;i++){
  const kind=w.modules[i],baseLen=lengths[kind],extra=2100+(i%3)*220,len=baseLen+extra,off=x; l.sections.push({x:off,end:off+len,name:w.sections[i],kind});
  // A slow entry, a fast descending curve, a flat device bed and an uphill exit.
  const endY=560,low=650+(index%3)*22,high=470-(i%2)*35;
  node(off,560);node(off+360,560);node(off+880,low);node(off+1430,high);node(off+1720,560);node(off+baseLen-450,560);node(off+baseLen,560);
  const wave=(i+index)%4;node(off+baseLen+340,wave===1?660:470);node(off+baseLen+800,wave===2?430:700);node(off+baseLen+1270,560);node(off+baseLen+extra-470,560);node(off+len,560);
  l.boosts.push(off+650);
  if(i>0&&i%2===0)l.checkpoints.push({x:off+140});
  if(i>0)sign(off+190,('0'+(i+1))+'  →');
  let hint='';
  switch(kind){
   case 'start':
    material(off+460,450,'sugar');platform(off+1300,290,360);flavor(off+2050,'strawberry');
    l.hazards.push({x:off+2550,w:65});sign(off+2280,'SALTO','jump');
    hint='← → / A D para correr. ESPACIO para saltar. Mantén X / SHIFT (CHICLE) en suelo y suelta para acelerar.';
    break;
   case 'loop':
    l.loops.push({x:off+2100,r:180+(index%2)*25});material(off+1620,290,'sugar');
    platform(off+2350,260,340);hint='Los loops conservan el impulso. Salta dentro para salir por la tangente y alcanzar otra ruta.';
    break;
   case 'roller':
    l.presses.push({x:off+1850,type:index===5?'cutter':'roller',w:120,done:false});
    l.presses.push({x:off+2350,type:'press',w:140,done:false});material(off+2050,160,'flour');platform(off+1660,275,400);
    hint=index===5?'La cortadora te divide en cubitos. Tranquilo: todos sois tú. Las prensas aplastan, pero no consumen una vida.':'Rodillos y prensas te deforman sin quitar vidas. Mantén tu velocidad: el chicle siempre recupera la forma.';
    break;
   case 'sling':
    spring(off+1560,770,820);anchor(off+1900,240,'sling');platform(off+2230,190,300);gap(off+2420,460);
    hint='TIRACHINAS: mantén CHICLE cerca del doble anclaje. ← → cambia el ángulo; suelta para salir. La ruta baja también sirve.';
    break;
   case 'tube':
    tubeAt(off+1760,1050);material(off+350,420,index===3?'ice':'sugar');
    hint='Tubo de transporte: entra desde el suelo. Suelta CHICLE para no caer en picado al salir.';
    break;
   case 'bounce':
    material(off+1750,320,index===6?'tongue':'gel');gap(off+2220,600);spring(off+1820,1060,960);
    platform(off+2520,205,300);flavor(off+1520,index===4?'watermelon':'strawberry');
    hint='REBOTE: en el aire mantén CHICLE para caer con fuerza. Orienta el rebote con ← →. Los pozos no son colchonetas.';
    break;
   case 'sticky':
    material(off+1750,320,'caramel');anchor(off+1880,395,'sticky');spring(off+1580,640,680);
    platform(off+2170,215,320);l.enemies.push({x:off+2670,type:'bounce'});
    hint='ADHESIÓN: mantén CHICLE al pasar por la placa ámbar. Apunta con ← → y suelta para redirigir tu impulso.';
    break;
   case 'soda':
    material(off+1740,720,'soda');flavor(off+1490,'cola');l.pools.push({x:off+1740,w:720,type:'soda'});platform(off+1920,340,250,'cap',35);
    hint='Sabor COLA: salta y mantén SALTO en el aire para hinchar una burbuja. CHICLE la revienta.';
    break;
   case 'bubble':
    l.pools.push({x:off+1710,w:1120,type:'soda'});material(off+1710,1120,'soda');
    for(let b=0;b<3;b++)l.bubbles.push({x:off+1830+b*340,baseY:410-b*38,y:410-b*38,r:48,phase:b*2,lock:0});
    spring(off+1580,660,580);platform(off+2180,170,270,'cap',34);flavor(off+1470,'cola');
    hint='Las burbujas grandes te recogen. Mantén SALTO para ascender, CHICLE para salir; ← → permite dirigirlas.';
    break;
   case 'fan':
    l.winds.push({x:off+1760,w:600,y:40,h:590,fx:index===5?520:230,fy:-2550,hot:index===3});
    platform(off+2370,165,320,'normal',index===3?45:30);flavor(off+1500,index===1?'mint':index===3?'chile':'strawberry');
    hint='Las corrientes te elevan sin detenerte. Salta dentro y usa ← → para elegir dónde salir.';
    break;
   case 'acid':
    flavor(off+1550,'lemon');l.gates.push({x:off+2160,type:'acid',w:72,broken:false});platform(off+1960,255,390);
    l.enemies.push({x:off+2760,type:'straw'});
    hint='LIMÓN: atraviesa la pared amarilla para disolverla. Sin el sabor, salta por encima o comprímete para volver a acelerar.';
    break;
   case 'city':
    material(off+1700,440,'sugar');l.loops.push({x:off+2120,r:195});platform(off+2420,200,340,'bus',28);flavor(off+1510,'strawberry');
    hint='Candy City tiene rutas por el suelo y por los tejados. Sigue los azúcares altos; no hace falta parar para explorar.';
    break;
   case 'tower':
    spring(off+1710,1110,780);platform(off+2050,250,240,'bus',42);platform(off+2500,140,330);anchor(off+2360,30,'sling');
    gap(off+2960,370);hint='AZOTEAS: el muelle te eleva; mantén CHICLE junto al tirachinas para alcanzar la plataforma de arriba.';
    break;
   case 'ice':
    material(off+450,750,'ice');material(off+1670,1120,'ice');flavor(off+1500,'mint');
    l.pools.push({x:off+2130,w:510,type:'freeze'});l.enemies.push({x:off+2670,type:'bounce'});
    hint='HIELO: cuesta frenar y el chicle está rígido. Con MENTA se forma una pasarela que te mantiene por encima del charco.';
    break;
   case 'hot':
    flavor(off+1490,'chile');material(off+1770,420,'chile');l.winds.push({x:off+1730,w:440,y:250,h:420,fx:400,fy:-750,hot:true});
    l.pools.push({x:off+2310,w:430,type:index===3?'freeze':'chocolate'});material(off+2280,480,index===3?'ice':'chocolate');
    hint='CHILE: turbo con cara de arrepentimiento. Las salidas de aire caliente recuperan tu elasticidad en el congelador.';
    break;
   case 'heavy':
    flavor(off+1440,'watermelon');platform(off+1810,320,370,'wafer');l.gates.push({x:off+2030,type:'wafer',w:90,broken:false});
    spring(off+1630,760,690);l.enemies.push({x:off+2670,type:'bomb'});material(off+2500,320,'chocolate');
    hint='SANDÍA: pesas más. Salta y mantén CHICLE sobre la galleta: el impacto abre el paso. Las bolitas con mecha te impulsan.';
    break;
   case 'wrap':
    l.presses.push({x:off+1820,w:170,type:'wrapper',done:false});l.presses.push({x:off+2540,w:100,type:'cutter',done:false});
    l.enemies.push({x:off+2210,type:'wrapper'});platform(off+1660,260,450);
    hint='ENVUELTO: pulsa SALTO o CHICLE varias veces para romper el papel. También se rompe solo; nunca te quedarás atrapado.';
    break;
   case 'vacuum':
    l.winds.push({x:off+1740,w:850,y:60,h:620,fx:800,fy:-900,vacuum:true});
    platform(off+2120,220,260,'normal',70);l.enemies.push({x:off+2650,type:'straw'});flavor(off+1510,'cola');
    hint='VACÍO: la máquina te atrae y te eleva. Aprovecha la corriente, salta sobre las pajitas y encadena la salida.';
    break;
   case 'mouth':
    material(off+1720,760,'soda');flavor(off+1450,'mint');l.pools.push({x:off+1780,w:610,type:'freeze'});platform(off+1900,320,280,'tooth',20);
    hint='No es una cueva. MENTA te ayuda a cruzar la saliva. Las plataformas blancas son dientes; no hace falta cepillarlos.';
    break;
   case 'tooth':
    spring(off+1570,880,750);platform(off+1850,310,230,'tooth',60);platform(off+2300,260,260,'tooth',45);
    l.presses.push({x:off+2750,w:140,type:'tooth',done:false});hint='Los dientes se mueven. Aterriza encima o usa la ruta baja. Si te pillan, te dejan plano, no eliminado.';
    break;
   case 'tongue':
    material(off+1670,850,'tongue');spring(off+1830,1140,900);platform(off+2240,150,360,'tooth');
    l.winds.push({x:off+2710,w:330,y:220,h:450,fx:350,fy:-1400});hint='La lengua devuelve tus impactos con un rebote enorme. Conserva el impulso para enlazar con el hilo dental.';
    break;
   case 'chase':
    l.chases.push({start:off+350,end:off+len-150,x:off-200,active:false,done:false,speed:610+index*18});
    l.loops.push({x:off+2030,r:165});flavor(off+1520,'chile');l.enemies.push({x:off+2730,type:'bomb'});
    hint=index===5?'QA-RL ha leído el informe. «Estoy intentando AYUDARTE. Por favor, sigue huyendo».':'QA-RL inicia una inspección móvil. Mantén el impulso. Si te alcanza, te impulsa y penaliza puntos, pero no bloquea la salida.';
    break;
   case 'final':
    flavor(off+1450,'chile');l.winds.push({x:off+1760,w:850,y:-150,h:850,fx:800,fy:-2400,final:true});
    anchor(off+2700,100,'sling');platform(off+2910,180,380,'tooth');l.chases.push({start:off+300,end:off+len-300,x:off-200,active:false,done:false,speed:690});
    hint='OPERACIÓN ESTORNUDO: corre hacia la corriente, salta y deja que te lance. Última salida a la derecha. ¡ACHÍS!';
    break;
  }
  // Every sector ends with a different flowing combination, not an empty extension.
  const tail=off+baseLen,combo=(i+index)%5;
  l.boosts.push(tail+570);
  if(combo===0){l.loops.push({x:tail+1510,r:142+(index%2)*20});platform(tail+1750,305,280);material(tail+280,360,index===3?'ice':index===4?'chocolate':'sugar')}
  else if(combo===1){tubeAt(tail+1390,600);platform(tail+670,250,300);l.enemies.push({x:tail+320,type:'bounce'})}
  else if(combo===2){material(tail+1380,380,index===6?'tongue':'gel');spring(tail+1430,890,940);platform(tail+1790,300,300);l.enemies.push({x:tail+480,type:'bomb'})}
  else if(combo===3){anchor(tail+1490,355,'sticky');spring(tail+1250,680,780);platform(tail+1830,220,300);material(tail+1400,350,index===4?'chocolate':'caramel')}
  else{l.winds.push({x:tail+1360,w:350,y:220,h:440,fx:320,fy:-1500,hot:index===3});platform(tail+1860,265,300,'normal',24);material(tail+140,410,index===3?'ice':'flour')}
  l.tips.push({x:off+120,end:off+1000,text:hint});
  // No blind spikes in gadget landing corridors: hazards belong to the approach.
  if(i===4&&index!==0){l.hazards.push({x:off+290,w:60});sign(off+30,'SALTO','jump')}
  if(i===1||i===4)l.enemies.push({x:off+len-650,type:i===1?'bounce':'bomb'});
  x+=len;
 }
 l.finish=x+750;l.length=x+1100;node(x+350,560);node(l.length,560);
 for(const g of l.gaps){const yy=groundAt(l,g[0]).y;platform(g[0]+35,yy+65,Math.max(140,(g[1]-g[0])*.43));platform(g[0]+(g[1]-g[0])*.52,yy+35,Math.max(160,(g[1]-g[0])*.43));}
 for(const o of [...l.loops,...l.springs,...l.checkpoints,...l.signs])o.y=groundAt(l,o.x).y;
 l.tubes=l.tubes.map(t=>{const y=groundAt(l,t.build).y-20;return tube([[t.build,y],[t.build+t.len*.14,y-90],[t.build+t.len*.27,170],[t.build+t.len*.49,90],[t.build+t.len*.74,210],[t.build+t.len*.90,390],[t.build+t.len,390]])});
 for(const e of l.enemies){e.baseY=groundAt(l,e.x).y-30;e.y=e.baseY;e.lock=0;e.hits=0}
 for(const f of l.flavors)if(f.y===null)f.y=groundAt(l,f.x).y-50;
 // The three stars are different challenges, not a mandatory toll at the exit.
 const exploreX=l.sections[1].x+1120,exY=groundAt(l,exploreX).y-145;
 platform(exploreX-120,exY+45,320);l.stars.push({x:exploreX,y:exY,kind:'explore',label:'EXPLORACIÓN',taken:false});
 const skillSec=l.sections.find(s=>s.kind==='sling'||s.kind==='tower'),skillX=skillSec.x+2290;
 l.stars.push({x:skillX,y:skillSec.kind==='tower'?95:145,kind:'skill',label:'HABILIDAD',taken:false});
 const speedX=l.finish-210;l.boosts.push(l.finish-500);l.stars.push({x:speedX,y:515,kind:'speed',label:'IMPULSO ≥ 800',taken:false});
 l.documents.push({x:l.sections[3].x+500,y:groundAt(l,l.sections[3].x+500).y-48,taken:false,id:index});
 l.npcs=[{x:480,type:'chew',speaker:w.speaker,text:w.line,said:false},{x:l.sections[2].x+950,type:'bubble',text:'Aparta, esto lo tengo dominado.',said:false},{x:l.sections[5].x+450,type:'coffee',text:COFFEE_LINES[index],said:false}];
 l.props.push({x:l.sections[4].x+1100,type:'vending',y:groundAt(l,l.sections[4].x+1100).y-90});
 for(let i=0;i<l.sections.length;i++)l.props.push({x:l.sections[i].x+300,type:'board',text:[['NO LAMER LA MAQUINARIA','PRODUCTO CON INICIATIVA'],['NO BEBER EL DESAGÜE','EN SERIO.'],['ALQUILER: 800 CARAMELOS','PISO SIN ENVOLTORIO'],['AQUÍ SE CONGELAN IDEAS','MODO HOCKEY'],['PUEDE CONTENER CACAO','Y MALAS DECISIONES'],['ABREFÁCIL*','*DEPENDE DE TI'],['NO ES UN HOTEL','SALIDA POR ESTORNUDO']][index][i%2],y:groundAt(l,l.sections[i].x+300).y-175});
 sign(l.finish-420,'META →','end');l.signs.at(-1).y=560;
 for(let sx=410;sx<l.finish-120;sx+=115){if(inGap(l,sx)||l.hazards.some(h=>sx>h.x-75&&sx<h.x+h.w+75)||l.loops.some(o=>Math.abs(o.x-sx)<160))continue;l.sweets.push({x:sx,y:groundAt(l,sx).y-48,taken:false})}
 for(const p of l.platforms)for(let sx=p.x+28;sx<p.x+p.w-15;sx+=64)l.sweets.push({x:sx,y:p.y-43,taken:false,high:true});
 for(const o of l.loops)for(let j=1;j<=11;j++){let a=j/12*TAU;l.sweets.push({x:o.x+Math.sin(a)*(o.r-22),y:o.y-o.r+Math.cos(a)*(o.r-22),taken:false,high:true})}
 for(const s of l.springs)for(let j=0;j<8;j++){const t=.08+j*.105;l.sweets.push({x:s.x+s.boost*t,y:s.y-20-s.power*t+925*t*t,taken:false,high:true})}
 return l;
}

