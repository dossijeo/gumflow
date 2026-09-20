/* CrazyGames-only hooks inside the original shared scope. Geometry, movement,
 * scores, death handling and the adaptive music director are not rewritten. */
const GumflowCGGame=(()=>{
  const portal=window.GumflowCrazyGames,resources=portal.resources,shell=portal.shell;
  if(!portal.snapshot().initialized)throw new Error('Initialize SDK/Data Module before game code');
  let gameReady=false,sceneBusy=false,sceneToken=0,played=false,warmed=false;
  let pendingScene=Promise.resolve(),lastSave=0;
  const menuAudio=shell.takeAudio();
  if(menuAudio.context)audioCtx=menuAudio.context;
  if(menuAudio.buffer){HD.cache.set('menu',{buffer:menuAudio.buffer,used:performance.now()});HD.suspended={key:'menu',offset:menuAudio.position,time:hdNow()};}
  if(!menuAudio.buffer&&menuAudio.bufferPromise)menuAudio.bufferPromise.then(b=>{if(b&&!HD.cache.has('menu'))HD.cache.set('menu',{buffer:b,used:performance.now()});});
  hdFullscreen=async function(){};hdTitleFullscreenState=function(){};$('full').onclick=hdFullscreen;
  const oldIsGame=hdIsGame;hdIsGame=function(){return played&&oldIsGame();};
  const oldWarm=hdWarmGameplay;
  hdWarmGameplay=async function(){if(played)return oldWarm();};
  function sync(){
    if(!gameReady||sceneBusy){portal.setGameplay(false);return;}
    if(portal.focusLost&&state==='paused')return;
    portal.clearFocusLoss();portal.setGameplay(state==='playing');
    if(state==='playing'&&!played){
      played=true;shell.timings.firstGameplay=performance.now();
      // The three gameplay mixes arrive AFTER gameplay really starts. The menu
      // music continues until Everyday is decoded, then the existing engine fades.
      hdWarmGameplay();
    }
    if(played&&!warmed){warmed=true;setTimeout(()=>resources.warm([...BG_IMAGES,...EF_LAYER_IMAGES]),1500);}
  }
  function note(){
    const save=portal.storage.snapshot();
    const es=I18N.language==='es';
    const text=save.readOnly?(es?'La cuenta ha cambiado. Recarga para usar su progreso.':'Account changed. Reload to use its progress.'):save.error?(es?'No se ha podido guardar. El progreso actual puede perderse: ':'Save failed. Current progress may be lost: ')+save.error.message:
      save.mode==='sdk'?(es?'Guardado mediante CrazyGames. Inicia sesión en el portal para sincronizar entre dispositivos.':'Saved through CrazyGames. Sign in on the portal to sync across devices.'):
      (es?'Vista previa fuera de CrazyGames: sin sincronización en la nube.':'Off-portal preview: no cloud synchronization.');
    for(const n of document.querySelectorAll('.save-note')){n.dataset.noTranslate='true';n.textContent=text;}
    let warning=$('cgSaveWarning');
    if((save.error||save.readOnly)&&!warning){warning=document.createElement('div');warning.id='cgSaveWarning';warning.setAttribute('role','alert');warning.dataset.noTranslate='true';document.body.appendChild(warning);}
    if(warning){warning.hidden=!(save.error||save.readOnly);warning.textContent=(save.error||save.readOnly)?text:'';}
  }
  function decorate(){
    for(const id of ['full','gf6TitleFull']){const b=$(id);if(b){b.hidden=true;b.tabIndex=-1;b.setAttribute('aria-hidden','true');}}
    let n=$('cgMuteNotice');
    if(portal.muted&&$('panel')){if(!n){n=document.createElement('p');n.id='cgMuteNotice';n.dataset.noTranslate='true';n.setAttribute('role','status');$('panel').appendChild(n);}
      n.textContent=I18N.language==='es'?'CrazyGames ha silenciado el audio. Usa los controles del portal.':'Audio is muted by CrazyGames. Use the portal controls.';
    }else n?.remove();note();
  }
  portal.onMute(decorate);window.addEventListener('gumflow-save-status',note);
  const oldLanguage=I18N.setLanguage;I18N.setLanguage=function(...a){const out=oldLanguage.apply(this,a);decorate();return out;};
  const oldOverlay=showOverlay;showOverlay=function(...a){const out=oldOverlay(...a);decorate();sync();return out;};
  const oldHide=hideOverlay;hideOverlay=function(...a){const out=oldHide(...a);sync();return out;};
  // Preserve synchronous loadLevel callers (continueSession restores checkpoints
  // immediately afterwards). Freeze only ticking/input while the chosen artwork
  // arrives, without changing their state or pretending this is active play.
  function gate(images){
    const token=++sceneToken;sceneBusy=true;clearInput();portal.setGameplay(false);portal.beginLoading();
    shell.show('Cargando escenario…','Loading stage…');
    const attempt=()=>resources.group(images).then(()=>{
      if(token!==sceneToken)return;sceneBusy=false;clearInput();GumflowGamepad.reset(true);shell.hide();portal.endLoading();sync();
    }).catch(e=>{if(token===sceneToken)shell.error(e,'Stage assets',()=>{shell.show('Reintentando…','Retrying…');pendingScene=attempt();});});
    pendingScene=attempt();return pendingScene;
  }
  const oldLoad=loadLevel;loadLevel=function(...a){sceneBusy=true;const out=oldLoad(...a);gate([BG_IMAGES[levelIndex]]);return out;};
  const oldEndless=startEndless;startEndless=function(...a){sceneBusy=true;const out=oldEndless(...a);gate(EF_LAYER_IMAGES);return out;};
  const oldUpdate=update;update=function(dt,override){
    if(!gameReady||sceneBusy)return;
    oldUpdate(dt,override);sync();
    // Save current campaign session periodically as well as existing checkpoints.
    // SDK performs its own network debounce. No second local mirror is maintained.
    if(state==='playing'&&!ef&&!bossOnly){lastSave+=dt;if(lastSave>=15){lastSave=0;saveSession();}}
  };
  const oldFrame=frame;frame=function(time){sync();oldFrame(time);sync();};
  const oldRead=readInput;readInput=function(){return gameReady&&!sceneBusy?oldRead():{left:false,right:false,jump:false,elastic:false};};
  queueMicrotask(()=>{
    try{gameReady=true;clearInput();GumflowGamepad.reset(true);decorate();portal.markReady();sync();}
    catch(e){portal.failGame(e);}
  });
  return {sync,decorate,get focusPaused(){return portal.focusLost;},wait:()=>pendingScene,loading:()=>sceneBusy};
})();
window.__gumTest.crazygames={sync:GumflowCGGame.sync,info:()=>window.GumflowCrazyGames.snapshot(),
 audio:()=>window.GumflowCrazyGames.audioSnapshot(),fullscreen:()=>hdFullscreen(),
 sceneReady:()=>GumflowCGGame.wait(),loading:()=>GumflowCGGame.loading(),
 resources:()=>window.GumflowCrazyGames.resources.info(),timings:()=>({...window.GumflowCrazyGames.shell.timings})};
