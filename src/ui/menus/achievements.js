 function uiStatsCards(){
   return [
     ['Mundos completados', `${uiWorldDone()} / 7`],
     ['Estrellas de campaña', `${uiTotalStars()} / 21`],
     ['Grados S', uiBestGrades('S')],
     ['Logros', `${profile.achievements.length} / ${Object.keys(ACHIEVEMENTS).length}`],
     ['Informes', `${profile.lore.length} / 7`],
     ['Jefes vencidos', `${(profile.bosses||[]).length} / 7`],
     ['Endless · mejor distancia', efDistance(efStore.normal?.best?.distance||0)],
     ['Relax · mejor distancia', efDistance(efStore.relax?.best?.distance||0)],
     ['Endless · mejor tiempo', efDuration(efStore.normal?.best?.time||0)],
     ['Relax · mejor tiempo', efDuration(efStore.relax?.best?.time||0)],
     ['Endless · más estrellas', `${uiNum(efStore.normal?.best?.stars||0)} ★`],
     ['Endless · velocidad máx.', `${Number(efStore.normal?.best?.speed||0).toFixed(1)} km/h`],
   ].map(([label,val])=>`<div class="gf5-stat-card"><small>${label}</small><strong>${val}</strong></div>`).join('');
 }
 function uiAchievements(tab='achievements'){
   setWide(true);state='achievements';
   const doneTab=tab==='achievements', statsTab=tab==='stats';
   showOverlay(`<div class="overline">LOGROS</div><h2>Tu rastro de <span>azúcar.</span></h2><p class="intro">Medallas, progreso de Historia y récords guardados de Endless Flow.</p><div class="gf5-tabbar"><button class="setting ${doneTab?'active':'ghost'}" id="gf5AchTab">LOGROS</button><button class="setting ${statsTab?'active':'ghost'}" id="gf5StatsTab">ESTADÍSTICAS</button></div>${doneTab?`<div class="gf5-ach-grid">${Object.entries(ACHIEVEMENTS).map(([id,title])=>`<article class="gf5-ach-card ${profile.achievements.includes(id)?'':'locked'}"><div class="gf5-mini">${profile.achievements.includes(id)?'Desbloqueado':'Bloqueado'}</div><b>${uiEsc(title)}</b><p>${profile.achievements.includes(id)?'Consiguido en tu partida local. Sigue explorando para completar la colección.':'Todavía no lo has desbloqueado en este navegador.'}</p></article>`).join('')}</div><div class="gf5-section-note">Campaña: ${uiWorldDone()}/7 mundos · ${uiTotalStars()}/21 estrellas · ${profile.lore.length}/7 informes.</div>`:`<div class="gf5-stats-grid">${uiStatsCards()}</div><div class="gf5-section-note">Récords de Endless separados entre Supervivencia y Relax. Los datos pertenecen a este navegador.</div><div class="gf5-actions"><button class="secondary" id="gf5StatsNormal">SUPERVIVENCIA · RÉCORDS Y CARRERAS</button><button class="secondary" id="gf5StatsRelax">RELAX · RÉCORDS Y CARRERAS</button></div>`}<div class="gf5-backline"><button class="secondary" id="gf5AchBack">← VOLVER</button></div>`,false);
   $('gf5AchTab').onclick=()=>uiAchievements('achievements');
   $('gf5StatsTab').onclick=()=>uiAchievements('stats');
   $('gf5AchBack').onclick=uiMainMenu;
   if($('gf5StatsNormal'))$('gf5StatsNormal').onclick=()=>efRecords('normal');
   if($('gf5StatsRelax'))$('gf5StatsRelax').onclick=()=>efRecords('relax');
 }
