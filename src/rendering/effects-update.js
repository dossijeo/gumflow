function updateEffects(dt){
 for(const p of particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=400*dt}particles=particles.filter(p=>p.life>0);
 for(const f of floaters){f.life-=dt;f.y-=38*dt}floaters=floaters.filter(f=>f.life>0);
 for(const t of trails)t.life-=dt;trails=trails.filter(t=>t.life>0);
 if(player&&state==='playing'&&Math.abs(player.vx)>450&&!reduced){trails.push({x:player.x,y:player.y,angle:player.angle,sx:1+Math.abs(player.vx)/1700,sy:.8,life:.16});if(trails.length>20)trails.shift()}
 toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('show');tipTime-=dt;if(tipTime<=0)$('tip').classList.remove('show');shake=Math.max(0,shake-dt*50);
}
