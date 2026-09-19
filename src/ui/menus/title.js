 function uiMainMenu(){
   uiPauseContext=false;HD.museumStopped=false;HD.preview=null;
   if(ef){if(!ef.finished)efStoreRun('Salida al menú');state='efmenu';run=null;efLeave()}
   chipPreview=null;document.body.classList.remove('boss-active');
   if(run&&['playing','paused','dying','story'].includes(state)&&!bossOnly) saveSession();
   bossOnly=false;uiFreeRun=false;state='menu';$('hud').style.display='none';levelIndex=0;level=makeLevel(0);resetPlayer(150);initPlayerExtras();camX=600;camY=-150;setWide(false);
   showOverlay(`<div class="gf5-hero"><div class="overline">La fuga más pegajosa del mundo</div><h1>GUM<span>FLOW</span><i class="v2">6.1</i></h1><p class="tagline">100% chicle. 0% obediencia.</p><div class="gf5-main-actions"><button class="primary gf5-big" id="gf5PlayMain">▶ JUGAR</button><button class="secondary" id="gf5AchMain">★ LOGROS</button><button class="secondary" id="gf5MuseumMain">▣ MUSEO</button><button class="secondary" id="gf5OptionsMain">⚙ OPCIONES</button></div><div class="gf5-subnote">${uiCampaignSessionText()}</div><p class="save-note">${storageOK?'Guardado local automático en campaña y récords locales en Endless.':'Este visor bloquea el guardado local; el juego sigue funcionando, pero no conservará tu progreso.'}</p><div class="menu-footer">GUMFLOW · 6.1 · SIN CONEXIÓN</div></div>`,false);
   $('gf5PlayMain').onclick=uiPlayHub;
   $('gf5AchMain').onclick=()=>uiAchievements('achievements');
   $('gf5MuseumMain').onclick=()=>uiMuseum('archive');
   $('gf5OptionsMain').onclick=()=>uiOptions('game');
   hdInstallTitle();
 }
