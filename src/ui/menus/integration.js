 const css=document.createElement('style');
 css.textContent=`/* @include "src/styles/menu-layout.css" */`;
 document.head.appendChild(css);
 const uiBaseOverlay=showOverlay;
 showOverlay=function(html,center=true){
   uiBaseOverlay(html,center);$('overlay').scrollTop=0;
   const panel=$('panel');panel.classList.remove('gf5-animate');void panel.offsetWidth;panel.classList.add('gf5-animate');
 };
 function uiInfoBack(){HD.preview=null;chipPreview=null;pumpChip();if(uiPauseContext){uiPauseContext=false;state='playing';pause()}else uiMainMenu()}
 function uiArtwork(i){
  uiArtIndex=(i+7)%7;state='galleryart';setWide(true);
  showOverlay(`<div class="overline">MUSEO / GALERÍA · ${uiArtIndex+1} / 7</div><h2>${uiEsc(WORLDS[uiArtIndex].name)}</h2><img class="gf5-art" src="${BG_SOURCES[uiArtIndex]}" alt="Ilustración de ${uiEsc(WORLDS[uiArtIndex].name)}"><div class="gf5-backline"><button class="secondary" id="gf5ArtBack">← GALERÍA</button><button class="secondary" id="gf5ArtPrev">ANTERIOR</button><button class="primary" id="gf5ArtNext">SIGUIENTE →</button></div>`,false);
  $('gf5ArtBack').onclick=()=>uiMuseum('gallery');$('gf5ArtPrev').onclick=()=>uiArtwork(uiArtIndex-1);$('gf5ArtNext').onclick=()=>uiArtwork(uiArtIndex+1);
 }
 function uiLaunchFree(i){uiNextFree=true;startRun(i,true)}
 const uiBaseStart=startRun,uiBaseContinue=continueSession,uiBaseTrial=startBossTrial,uiBaseSave=saveSession,uiBaseComplete=completeLevel,uiBaseResults=results;
 startRun=function(...args){uiFreeRun=uiNextFree;uiNextFree=false;uiPauseContext=false;uiBaseStart(...args)};
 continueSession=function(...args){uiFreeRun=false;uiPauseContext=false;uiBaseContinue(...args)};
 startBossTrial=function(...args){uiFreeRun=false;uiPauseContext=false;uiBaseTrial(...args)};
 saveSession=function(){if(uiFreeRun)return;uiBaseSave()};
 completeLevel=function(){if(!uiFreeRun){uiBaseComplete();return}const saved=structuredClone(profile.session);uiBaseComplete();profile.session=saved;persist()};
 results=function(){uiBaseResults();if(uiFreeRun){$('nextGame').textContent='REPETIR ESCENARIO';$('nextGame').onclick=()=>uiLaunchFree(levelIndex);const note=$('panel').querySelector('.overline');if(note)note.textContent='FREE PLAY · ESCENARIO COMPLETADO';}};
 const uiBasePause=pause;
 pause=function(){
  uiBasePause();if(state!=='paused')return;
  $('panel').querySelector('.settings')?.remove();
  const row=$('panel').querySelector('.buttons');
  if(row&&!$('gf5PauseOptions')){const button=document.createElement('button');button.id='gf5PauseOptions';button.className='secondary';button.textContent='OPCIONES';button.onclick=()=>{uiPauseContext=true;uiOptions('game')};row.appendChild(button)}
  if($('archiveGame')){$('archiveGame').textContent='MUSEO';$('archiveGame').onclick=()=>{uiPauseContext=true;uiMuseum('archive')}}
  if($('helpGame'))$('helpGame').onclick=()=>{uiPauseContext=true;uiOptions('controls')};
 };
 const uiBaseRetry=retryLevel;
 retryLevel=function(){if(uiFreeRun&&!ef&&!bossOnly){uiLaunchFree(levelIndex);return}uiBaseRetry()};
 const uiBaseTips=tip;
 tip=function(...args){if(profile.settings.tips===false){tipTime=0;$('tip').classList.remove('show');return}uiBaseTips(...args)};
 const uiBaseLobby=efLobby,uiBaseRecords=efRecords;
 efLobby=function(tab='normal'){
  uiPauseContext=false;uiBaseLobby(tab);
  $('panel').querySelector('.ef-record-title')?.remove();$('panel').querySelector('.ef-stats')?.remove();$('efHistory')?.remove();
  $('efHome').textContent='← JUGAR';$('efHome').onclick=uiPlayHub;
  const note=document.createElement('p');note.className='gf5-section-note';note.textContent='Todos tus récords y las cinco mejores carreras están en Logros → Estadísticas.';$('panel').appendChild(note);
 };
 efRecords=function(tab='normal'){
  uiBaseRecords(tab);$('efRecordsBack').textContent='← LOGROS / ESTADÍSTICAS';$('efRecordsBack').onclick=()=>uiAchievements('stats');
 };
 bossSelect=function(){uiFreePlay()};
 const uiScreens=new Set(['menu','playhub','freeplay','achievements','museum','options','galleryart','efmenu','efrecords','efhelp']);
 addEventListener('keydown',e=>{
  if(!uiScreens.has(state))return;
  if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement){e.stopImmediatePropagation();return}
  if(['Escape','KeyP'].includes(e.code)){
   e.preventDefault();e.stopImmediatePropagation();
   if(state==='menu')return;
   if(state==='playhub')uiMainMenu();
   else if(state==='freeplay'||state==='efmenu')uiPlayHub();
   else if(state==='galleryart')uiMuseum('gallery');
   else if(state==='efrecords')uiAchievements('stats');
   else if(state==='efhelp'){if(ef&&uiPauseContext)uiInfoBack();else efLobby()}
   else uiInfoBack();
   return;
  }
  if(e.code==='Enter'||e.code==='Space'){
   e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;
   const active=document.activeElement;
   if(active instanceof HTMLButtonElement&&$('panel').contains(active))active.click();else $('panel').querySelector('button:not(:disabled)')?.click();return;
  }
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.code)){
   e.preventDefault();e.stopImmediatePropagation();
   const buttons=[...$('panel').querySelectorAll('button:not(:disabled)')];if(!buttons.length)return;
   let i=buttons.indexOf(document.activeElement);const dir=['ArrowLeft','ArrowUp'].includes(e.code)?-1:1;
   i=i<0?0:(i+dir+buttons.length)%buttons.length;buttons[i].focus();
  }
 },true);
 // Only the background and the existing Gum renderer move under front-end pages.
 const uiBaseRender=render,uiBaseCamera=updateCamera;
 render=function(){
   if(uiScreens.has(state)&&!uiPauseContext&&!ef){background();drawMenuHero();return}uiBaseRender();
 };
 updateCamera=function(dt){
   if(uiScreens.has(state)&&!uiPauseContext&&!ef){camX=1850+Math.sin(visualT*.1)*65;camY=-120;zoom=1;return}uiBaseCamera(dt);
 };
 window.__gumTest.uiPaused=()=>uiPauseContext;
 window.__gumTest.uiInfo=()=>({version:'6.1',state,freePlay:uiFreeRun,fromPause:uiPauseContext,title:document.title,thumbnailCount:UI_THUMBS.length,settings:{...profile.settings},buttons:[...$('panel').querySelectorAll('button')].map(b=>b.textContent)});
 Object.assign(window.__gumTest,{save:saveSession,restore:continueSession,pause,render});

 // Rewire entry points for the redesigned front-end.
 menu=uiMainMenu;
 levelSelect=uiFreePlay;
 soundBooth=()=>uiMuseum('music');
 window.__gumTest.menu=menu;
})();


