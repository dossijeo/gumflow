let bossOnly=false;
const baseMakeLevel=makeLevel;
makeLevel=function(index){
 const l=baseMakeLevel(index),oldFinish=l.finish,entry=l.length+160,a=entry+220,w=1360,def=BOSS_BOOK[index];
 l.originalFinish=oldFinish;l.finish=a+w+560;l.length=l.finish+450;
 l.nodes.push([entry,560],[a+260,560],[a+w,560],[l.length,560]);
 l.checkpoints.push({x:entry,y:560,boss:true});
 l.sections.push({x:entry-100,end:l.length,name:def.name,kind:'boss'});
 for(const sign of l.signs)if(sign.type==='end')sign.text='CONTROL FINAL →';
 l.signs.push({x:entry-220,y:560,text:'JEFE · CHECKPOINT →',type:'end'});
 l.boss={index,def,start:a,end:a+w,w,entry,x:a+w*.54,y:300,phase:'intro',t:0,active:false,defeated:false,hp:index===6?4:3,maxHp:index===6?4:3,round:0,hurt:0,hazards:[],emitted:0,opening:false,targetX:a+w*.52,hitCount:0,wonTime:0,pads:[{x:a+185,dir:1},{x:a+w-185,dir:-1}],padLock:0};
 l.props.push({x:entry-10,y:365,type:'board',text:'EL PROBLEMA TIENE GARANTÍA'});
 l.platforms.push({x:a+270,y:457,baseY:457,w:170,type:'normal',move:0,phase:0},{x:a+w-440,y:457,baseY:457,w:170,type:index===6?'tooth':'normal',move:0,phase:0});
 l.signs.push({x:l.finish-160,y:560,text:'LIBERTAD →',type:'end'});
 // Small return ramps keep the arena readable. Launch pads require deliberate input.
 l.tips.push({x:entry-80,end:a+240,text:'JEFE FINAL · Esquiva los ataques. Cuando el núcleo se ponga VERDE, golpéalo saltando. Las gelatinas laterales lanzan con SALTO o CHICLE.'});
 for(let x=a+w+100;x<l.finish;x+=90)l.sweets.push({x,y:512,taken:false});
 return l;
};
