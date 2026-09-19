function refreshHUD(){
 if(!run||!player)return;const p=player,speed=Math.hypot(p.vx,p.vy*.45);
 $('lives').innerHTML=profile.settings.assist?'<span style="font-size:21px;font-weight:900;color:#ff92c1">∞</span>':Array.from({length:5},(_,i)=>`<i class="life${i<run.lives?'':' off'}"></i>`).join('');$('lives').setAttribute('aria-label',profile.settings.assist?'Vidas infinitas':`${run.lives} vidas`);
 $('sugars').textContent=run.sugar;$('clock').textContent=formatTime(levelTime);$('score').textContent=Math.round(run.score).toLocaleString(document.documentElement.lang==='en'?'en-US':'es-ES');$('progressFill').style.width=clamp(p.x/level.finish*100,0,100)+'%';$('speedNum').textContent=Math.round(speed*.22);$('speedFill').style.width=clamp(speed/MAX_SPEED*100,0,100)+'%';$('chargeFill').style.width=charge*100+'%';$('flowFill').style.width=flow+'%';
 $('flowText').textContent=flow>99?'FLOW MAX':'FLUJO ×'+(1+Math.min(3,Math.floor(flow/26)));$('flowCaption').textContent=flow>78?'SIN CONSERVANTES':flow>48?'TODO ENCAJA':flow>22?'ASÍ SE HACE':'ENCUENTRA TU RITMO';$('flowBox').style.opacity=flow>5?1:.48;
 let ability=p.mode==='tube'?'TRÁNSITO DE PRODUCTO →':p.mode==='loop'?'LOOP · SALTA PARA SALIR':p.mode==='anchor'?'← → APUNTA · SUELTA CHICLE':p.mode==='bubble'?'SALTO: ASCIENDE · CHICLE: POP':p.wrapped>0?'¡PULSA SALTO / CHICLE!':p.drop?'CAÍDA ELÁSTICA ↓':charge>.12?`ELASTICIDAD ${Math.round(charge*100)}% · SUELTA`:`<span class="key-label"><kbd>X</kbd> / <kbd>SHIFT</kbd> </span>Mantén y suelta: impulso`;
 if(p.mode==='normal'&&!p.drop&&level.anchors.some(a=>Math.hypot(a.x-p.x,a.y-p.y)<220))ability='MANTÉN CHICLE PARA ENGANCHARTE';$('abilityText').innerHTML=ability;
 $('starsHUD').innerHTML=level.stars.map(s=>s.taken?'★':'☆').join('')+'<small>EXPLORA · DOMINA · ACELERA</small>';
 const fh=$('flavorHUD');if(p.flavor){fh.style.display='block';fh.style.borderColor=FLAVORS[p.flavor].color;fh.style.color=FLAVORS[p.flavor].color;fh.textContent=FLAVORS[p.flavor].name+' · '+Math.ceil(p.flavorTime)+'s'}else if(p.cold>0){fh.style.display='block';fh.style.color='#b5e8ff';fh.textContent='MODO HOCKEY · HIELO'}else fh.style.display='none';
}

