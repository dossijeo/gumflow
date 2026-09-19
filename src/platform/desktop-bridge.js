/** Optional desktop services. The same HTML still runs without Tauri. */
const GumflowDesktop = (() => {
  const api=window.__TAURI__, available=!!api?.core?.invoke;
  let nativePads=[],pending=false,next=0,last=0,error=null,ready=false;
  let fullscreen=false,fullscreenPending=false;
  function poll(now) {
    if(!available||pending||now<next||document.hidden) return;
    pending=true;next=now+16;
    api.core.invoke('controller_snapshot').then(data=>{
      nativePads=Array.isArray(data?.pads)?data.pads:[];ready=!!data?.ready;
      error=data?.error||null;last=performance.now();
    }).catch(e=>{nativePads=[];error=String(e);next=performance.now()+5000;})
      .finally(()=>{pending=false;});
  }
  async function refreshFullscreen() {
    if(!available) return;
    try {fullscreen=await api.window.getCurrentWindow().isFullscreen();} catch (_) {}
    const b=$('gf6TitleFull');
    if(b){b.textContent=I18N.text(fullscreen?'⛶ SALIR DE PANTALLA COMPLETA':'⛶ PANTALLA COMPLETA');b.setAttribute('aria-pressed',String(fullscreen));}
  }
  async function toggleFullscreen() {
    if(!available||fullscreenPending) return;
    fullscreenPending=true;
    try {
      const win=api.window.getCurrentWindow();
      await win.setFullscreen(!(await win.isFullscreen()));
      await refreshFullscreen();
    } catch(e) {toast(I18N.language==='en'?'Fullscreen unavailable':'Pantalla completa no disponible');}
    finally {fullscreenPending=false;}
  }
  if(available){
    // Existing title and HUD buttons resolve hdFullscreen at click time.
    hdFullscreen=toggleFullscreen;
    hdTitleFullscreenState=refreshFullscreen;
    $('full').onclick=toggleFullscreen;
    addEventListener('resize',()=>refreshFullscreen());
    addEventListener('keydown',e=>{if(e.code==='F11'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)toggleFullscreen();}},true);
  }
  return {available,poll,toggleFullscreen,
    pads(now){return now-last<600?nativePads:[];},
    status(){return {available,ready,error,fullscreen};}};
})();
