/* Only emitted into the CrazyGames index. First-paint menu is independent of
 * game.js and all world artwork. Never report that menu as gameplay. */
(function(){
  'use strict';
  const portal=window.GumflowCG.createPortal({log:m=>console.warn('GUMFLOW / CrazyGames:',m)});
  window.GumflowCrazyGames=portal;
  portal.resources=window.GumflowCGResources.createResources();
  const shell=window.GumflowCGShell.createShell(portal);portal.shell=shell;
  window.addEventListener('blur',()=>portal.noteFocusLoss(),true);
  window.addEventListener('visibilitychange',()=>{if(document.hidden)portal.noteFocusLoss();},true);
  let phase='SDK download',coreRequested=false,failed=false;
  function deadline(promise,message,ms=30000){
    let timer;return Promise.race([promise,new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error(message)),ms);})]).finally(()=>clearTimeout(timer));
  }
  function sdkReady(){
    if(window.CrazyGames?.SDK)return Promise.resolve(window.CrazyGames.SDK);
    return deadline(new Promise((resolve,reject)=>{
      const tag=document.getElementById('cg-sdk');
      if(!tag){reject(new Error('Official SDK script tag is missing'));return;}
      const loaded=()=>window.CrazyGames?.SDK?resolve(window.CrazyGames.SDK):reject(new Error('SDK downloaded but window.CrazyGames.SDK is missing'));
      tag.addEventListener('load',loaded,{once:true});
      tag.addEventListener('error',()=>reject(new Error('SDK download failed. Check network/content blocking for sdk.crazygames.com.')),{once:true});
    }),'SDK download timed out',25000);
  }
  function loadTag(url,kind){
    return deadline(new Promise((resolve,reject)=>{
      const tag=document.createElement(kind==='script'?'script':'link');
      tag.onload=()=>resolve();tag.onerror=()=>reject(new Error('Missing or blocked '+url+'. Upload every file from the CrazyGames ZIP, keeping names unchanged.'));
      if(kind==='script'){tag.src=url;tag.async=true;}else{tag.rel='stylesheet';tag.href=url;}
      document.head.appendChild(tag);
    }),url+' load timed out');
  }
  // Capture an exception *inside* game.js too (a script load event alone cannot
  // tell whether its JS executed). The previous generic message hid this detail.
  window.addEventListener('error',event=>{
    if(coreRequested&&!portal.ready&&typeof event.message==='string') {
      const detail=event.message==='Script error.'?'JavaScript execution failed; browser hid cross-origin details.':event.message;
      portal.failGame(new Error(detail+' (game.js:'+String(event.lineno||'?')+')'));
    }
  });
  window.addEventListener('keydown',e=>{
    if(!portal.ready&&e.target.closest?.('#cgShell')==null&&e.code!=='Tab')e.stopImmediatePropagation();
  },true);
  function launch(action){
    const ids={play:'gf5PlayMain',achievements:'gf5AchMain',museum:'gf5MuseumMain',options:'gf5OptionsMain'};
    if(action&&ids[action])document.getElementById(ids[action])?.click();
  }
  let loadCorePromise=null;
  function loadCore(){
    if(loadCorePromise)return loadCorePromise;
    loadCorePromise=(async()=>{
      coreRequested=true;shell.timings.coreRequested=performance.now();phase='Game module';
      shell.status('Preparando los modos de juego…','Preparing game modes…');
      await loadTag('./styles.css','style');
      await Promise.all([loadTag('./game.js','script'),deadline(portal.whenReady(),'Game initialization timed out. Check the uploaded game.js.',30000)]);
      shell.timings.coreReady=performance.now();shell.hide();document.documentElement.classList.remove('cg-loading');
      launch(shell.action);
    })().catch(e=>{failed=true;portal.dispose();shell.error(e,phase);console.error('GUMFLOW startup:',phase,e);throw e;});
    loadCorePromise.catch(()=>{});return loadCorePromise;
  }
  shell.onEnter(()=>{if(portal.snapshot().initialized&&!failed)loadCore();});
  (async()=>{
    try{
      const sdk=await sdkReady();phase='SDK initialization / cloud save';
      await deadline(portal.initialize(sdk),'SDK initialization / cloud save timed out');
      shell.hydrate();phase='Menu ready';shell.status('Preparando el juego en segundo plano…','Preparing the game in the background…');
      // Give the lightweight menu/audio a head start; no other MP3s or world
      // textures are requested here. A Play press prioritizes the game module.
      await new Promise(r=>setTimeout(r,500));
      await loadCore();
    }catch(e){if(!failed){failed=true;portal.dispose();shell.error(e,phase);console.error('GUMFLOW startup:',phase,e);}}
  })();
})();
