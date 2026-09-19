function efSnapshot(){if(!ef)return null;return {id:ef.id,seed:ef.seed,relax:ef.relax,date:ef.date,distance:efGetDistance(),time:ef.elapsed,stars:ef.stars,sugar:run.totalSugar,speed:ef.peak*.22,flow:ef.flowMax,combo:ef.bestCombo,bosses:ef.bosses,score:run.score,deaths:run.totalDeaths,modules:ef.completed,reason:ef.reason||'En curso',continued:!!ef.continued}}
const EF_METRICS=[['distance','Distancia',efDistance],['time','Tiempo activo',efDuration],['stars','Estrellas',v=>efNumber(v)+' ★'],['sugar','Dulces',efNumber],['speed','Velocidad máxima',v=>(v||0).toFixed(1)+' km/h'],['bosses','Minijefes',efNumber],['combo','Mejor FLOW continuo',efDuration],['score','Puntuación',efNumber]];
function efStoreRun(reason='En curso'){
 if(!ef)return [];ef.reason=reason;const s=efSnapshot(),bucket=efStore[s.relax?'relax':'normal'],fresh=[];
 if(!ef.registered){bucket.runs++;ef.registered=true}
 for(const [key,label] of EF_METRICS)if((s[key]||0)>(bucket.best[key]||0)){bucket.best[key]=s[key];fresh.push(label)}
 bucket.best.flow=Math.max(bucket.best.flow||0,s.flow);
 bucket.top=bucket.top.filter(r=>r.id!==s.id);bucket.top.push(s);bucket.top.sort((a,b)=>b.distance-a.distance||b.stars-a.stars||b.sugar-a.sugar);bucket.top=bucket.top.slice(0,5);
 try{localStorage.setItem('gumflow-endless-v1',JSON.stringify(efStore));efStorageOK=true}catch(_){efStorageOK=false}
 return fresh;
}
function efStatCards(record){return EF_METRICS.map(([k,label,fmt])=>`<div class="ef-stat"><small>${label}</small><strong>${fmt(record?.[k]||0)}</strong></div>`).join('')}
