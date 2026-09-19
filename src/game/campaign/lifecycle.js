function retryLevel(){
 run.lives=3;run.score=stageBase?.score||0;run.sugar=stageBase?.sugar||0;run.totalSugar=stageBase?.totalSugar||0;run.totalDeaths=stageBase?.totalDeaths||0;run.stars=stageBase?.stars||0;
 loadLevel(levelIndex);state='playing';setWide(false);hideOverlay();sound('start');saveSession();
}

function loseLife(reason){
 if(state!=='playing'||player.inv>0)return;
 if(!profile.settings.assist)run.lives--;run.totalDeaths++;levelDeaths++;flow=0;charge=0;
 deathQuote=levelDeaths===10?'Hemos empezado a detectar un patrón.':DEATH_LINES[(levelDeaths*7+levelIndex*11)%DEATH_LINES.length];
 player.mode='dead';deathTimer=1.15;state='dying';shake=reduced?0:9;burst(player.x,player.y,26,'#ff83b8',370);sound('hurt');floatText(player.x,player.y-50,reason==='fall'?'NO ERA SUELO':'¡PLOF!');say(reason==='fall'?'DEPARTAMENTO DE ATERRIZAJES':'CONTROL DE CALIDAD',deathQuote,4);
 $('curtain').classList.add('flash');setTimeout(()=>$('curtain').classList.remove('flash'),130);refreshHUD();
}

function respawn(){
 if(run.lives<=0&&!profile.settings.assist){saveSession();state='gameover';setWide(false);showOverlay(`<div class="overline">Sin vidas. No sin elasticidad.</div><h2>Formato<br><span>para untar.</span></h2><p class="death-quote">«${deathQuote}»</p><p class="intro">${level.name}. Puedes reintentar la fase con tres vidas; no pierdes las fases anteriores ni el archivo descubierto.</p><div class="result-grid"><div class="result-card"><div class="value">${formatTime(levelTime)}</div><div class="label">Tiempo</div></div><div class="result-card"><div class="value">${levelCollected}</div><div class="label">Azúcares</div></div><div class="result-card"><div class="value">${levelDeaths}</div><div class="label">Nuevas texturas</div></div></div><div class="buttons"><button class="primary" id="retryGame">REINTENTAR FASE ↻</button><button class="secondary" id="relaxGame">CONTINUAR EN RELAX</button><button class="secondary" id="backMenu">MENÚ</button></div>`);$('retryGame').onclick=retryLevel;$('relaxGame').onclick=()=>{profile.settings.assist=true;run.lives=3;persist();respawn();hideOverlay()};$('backMenu').onclick=menu;return}
 const x=checkpoint?level.checkpoints[checkpoint-1].x+35:level.spawn;resetPlayer(x,2.4);initPlayerExtras();camX=x-worldW*.32;camY=player.y-worldH*.65;state='playing';clearInput();
 for(const c of level.chases)if(c.end>x){c.active=false;c.x=c.start-550;c.done=false}
 for(const f of level.flavors)if(f.x>=x)f.taken=false;
 toast(checkpoint?'DE VUELTA AL CHECKPOINT':'LA SIGUIENTE VIENE SIN CONSERVANTES');saveSession();
}

function completeLevel(){
 if(state!=='playing')return;state='finishing';transitionTimer=1.1;player.vx=350;player.speed=350;burst(player.x,player.y-60,60,level.palette.bright,650);sound('win');
 const timeBonus=Math.max(0,Math.round(12000-levelTime*60)),lifeBonus=run.lives*350,stars=level.stars.filter(s=>s.taken).length;
 run.score+=timeBonus+lifeBonus;run.stars=(run.stars||0)+stars;const grade=levelDeaths===0&&levelTime<100&&stars>=2?'S':levelDeaths===0?'A':levelDeaths<=2?'B':'C';
 const res={index:levelIndex,name:level.name,time:levelTime,sugar:levelCollected,deaths:levelDeaths,peak:peakSpeed,bonus:timeBonus+lifeBonus,points:run.score-stageBase.score,stars,grade};
 run.results.push(res);run.totalTime+=levelTime;
 const old=profile.records[levelIndex]||{};profile.records[levelIndex]={time:Math.min(old.time||Infinity,levelTime),stars:Math.max(old.stars||0,stars),starFlags:level.stars.map((s,i)=>s.taken||old.starFlags?.[i]||false),grade:!old.grade||'SABC'.indexOf(grade)<'SABC'.indexOf(old.grade)?grade:old.grade};
 if(levelDeaths===0)award('clean');if(Object.values(profile.records).reduce((sum,r)=>sum+(r.starFlags||[]).filter(Boolean).length,0)>=21)award('stars');
 if(levelIndex===6){award('finish');profile.session=null}else profile.session={level:levelIndex+1,run:structuredClone(run),checkpoint:0,levelTime:0,fresh:true};
 persist();refreshHUD();
}

