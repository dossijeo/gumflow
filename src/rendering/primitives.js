function rr(x,y,w,h,r=8){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function pathLine(points){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y))}
function worldTransform(parallaxX=1,parallaxY=1){const s=baseScale*zoom;ctx.setTransform(DPR*s,0,0,DPR*s,-camX*s*DPR*parallaxX,-camY*s*DPR*parallaxY);if(shake&&!reduced)ctx.translate(rnd(-shake,shake)*.45,rnd(-shake,shake)*.45)}
function screenTransform(){ctx.setTransform(DPR,0,0,DPR,0,0)}
