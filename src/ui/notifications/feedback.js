function formatTime(t){return Math.floor(t/60)+':'+(t%60).toFixed(1).padStart(4,'0')}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastTime=2.2;}
function tip(text,d=5.5){tipText=text;tipTime=d;$('tip').textContent=text;$('tip').classList.add('show')}
function floatText(x,y,text,color='#fff4db'){floaters.push({x,y,text,color,life:1.2,max:1.2})}
function burst(x,y,n,color,speed=200){if(reduced)n=Math.ceil(n/3);for(let i=0;i<n;i++)particles.push({x,y,vx:rnd(-speed,speed),vy:rnd(-speed,speed),life:rnd(.3,.8),max:.8,size:rnd(2,7),color});if(particles.length>220)particles.splice(0,particles.length-220)}
