/* Lightweight title UI; the original game/menu implementation takes over when
 * its code is ready. Music buffer/context are handed over, never played twice. */
(function(root){
  'use strict';
  function createShell(portal){
    const el=document.getElementById('cgShell'),stage=document.getElementById('cgStage'),detail=document.getElementById('cgDetail');
    const retry=document.getElementById('cgRetry'),audioButton=document.getElementById('cgAudio'),langButton=document.getElementById('cgLanguage');
    const canvas=document.getElementById('cgHero'),ctx=canvas.getContext('2d');
    const R=20,TAU=Math.PI*2,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));let visualT=0;
    /* @CG_GUM_RENDERER */
    let language='en',preferences={},initialized=false,taken=false,pendingAction=null,enter=()=>{};
    let context=null,buffer=null,source=null,bus=null,startedAt=0,decoding=null,raf=0;
    const timings={shellCreated:performance.now(),firstPaint:null,menuAudioReady:null,coreRequested:null,coreReady:null,firstGameplay:null};
    const L=(es,en)=>language==='es'?es:en;
    function paint(){
      if(taken)return;
      visualT=performance.now()/1000;ctx.clearRect(0,0,360,360);ctx.save();ctx.translate(180,185);ctx.scale(4.4,4.4);
      gum(0,Math.sin(visualT*2)*1.5,Math.sin(visualT)*.04,100,Math.max(0,Math.sin(visualT*2))*.12,0,false,true);ctx.restore();raf=requestAnimationFrame(paint);
    }
    function labels(){
      const names={play:L('▶ JUGAR','▶ PLAY'),achievements:L('★ LOGROS','★ ACHIEVEMENTS'),museum:L('▣ MUSEO','▣ MUSEUM'),options:L('⚙ OPCIONES','⚙ OPTIONS')};
      for(const b of el.querySelectorAll('[data-cg-action]'))b.textContent=names[b.dataset.cgAction];
      el.querySelector('.cg-tag').textContent=L('100% chicle. 0% obediencia.','100% gum. 0% obedience.');
      audioButton.textContent=preferences.sound===false||preferences.musicOn===false?L('♪ ACTIVAR MÚSICA','♪ ENABLE MUSIC'):L('♫ MÚSICA','♫ MUSIC');
      langButton.textContent=language==='es'?'ES → EN':'EN → ES';
    }
    function updateVolume(){if(bus&&context){bus.gain.setTargetAtTime(preferences.sound===false||preferences.musicOn===false||document.hidden?0:(preferences.musicVolume??.7)*.78,context.currentTime,.025);}}
    function play(){
      if(taken||!initialized||preferences.sound===false||preferences.musicOn===false||preferences.musicStyle==='classic')return;
      try{
        if(!context){context=new (root.AudioContext||root.webkitAudioContext)();bus=context.createGain();bus.connect(portal.audioDestination(context));}
        updateVolume();context.resume().catch(()=>{});
        if(!decoding){
          decoding=fetch('./hd-menu-interlude.mp3').then(r=>{if(!r.ok)throw new Error('Menu music HTTP '+r.status);return r.arrayBuffer()})
            .then(b=>context.decodeAudioData(b)).then(b=>{buffer=b;timings.menuAudioReady=performance.now();play();return b;})
            .catch(e=>{stage.textContent=L('Música de menú no disponible; puedes seguir jugando.','Menu music unavailable; you can still play.');console.warn(e);return null});
        }
        if(buffer&&!source){source=context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(bus);startedAt=context.currentTime;source.start();}
      }catch(e){console.warn('GUMFLOW menu audio:',e);}
    }
    function writeAudio(){
      let profile={};try{profile=JSON.parse(portal.storage.getItem('gumflow-v3')||portal.storage.getItem('gumflow-v2')||'{}')}catch(_){}
      profile.version=3;profile.settings={...profile.settings,...preferences};
      portal.storage.setItem('gumflow-v3',JSON.stringify(profile));
    }
    for(const b of el.querySelectorAll('[data-cg-action]'))b.onclick=()=>{pendingAction=b.dataset.cgAction;play();enter(pendingAction);};
    audioButton.onclick=()=>{try{const on=preferences.sound===false||preferences.musicOn===false;preferences.sound=on;preferences.musicOn=on;writeAudio();labels();updateVolume();play();}catch(e){error(e,'Save');}};
    langButton.onclick=()=>{try{language=language==='es'?'en':'es';portal.storage.setItem('gumflow-language',language);labels();}catch(e){error(e,'Save');}};
    const unlock=()=>play();document.addEventListener('pointerdown',unlock,{passive:true});document.addEventListener('keydown',unlock);
    const visibility=()=>{if(!taken){updateVolume();if(!document.hidden)play();}};document.addEventListener('visibilitychange',visibility);
    // Tiny shell is keyboard/touch friendly; gamepad is available even while
    // game.js downloads. Ignore unsupported mappings rather than guessing.
    let padWas=false,padAxis=0;
    const padTimer=setInterval(()=>{
      if(taken||el.hidden||document.hidden)return;
      const pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p?.mapping==='standard');if(!pad)return;
      const buttons=[...el.querySelectorAll('button:not([hidden]):not(:disabled)')];if(!buttons.length)return;
      const at=Math.max(0,buttons.indexOf(document.activeElement));
      const axis=(pad.buttons[13]?.pressed||pad.buttons[15]?.pressed||pad.axes[1]>.5)?1:(pad.buttons[12]?.pressed||pad.buttons[14]?.pressed||pad.axes[1]<-.5)?-1:0;
      if(axis&&axis!==padAxis)buttons[(at+axis+buttons.length)%buttons.length].focus();padAxis=axis;
      const pressed=!!pad.buttons[0]?.pressed;if(pressed&&!padWas)buttons[at].click();padWas=pressed;
    },80);
    function status(es,en){if(!el.classList.contains('cg-error'))stage.textContent=L(es,en);}
    function error(e,phase,retryFn=()=>location.reload()){
      el.hidden=false;el.classList.add('cg-error');document.getElementById('cgBusy').hidden=true;
      stage.textContent=L('No se pudo completar la carga.','Loading could not be completed.');
      const code=String(e?.code||''),message=String(e?.message||e);
      detail.textContent=(phase?phase+': ':'')+(code?code+' — ':'')+message+
        (code==='dataModuleDisabled'?'\nUpload → Progress Save → Yes, using the Data Module from the CrazyGames SDK.':'');
      detail.hidden=false;retry.hidden=false;retry.onclick=retryFn;retry.focus();
    }
    function hide(){el.hidden=true;el.classList.remove('cg-error');detail.hidden=true;retry.hidden=true;document.getElementById('cgBusy').hidden=false;}
    function show(es,en){el.hidden=false;el.classList.remove('cg-error');if(taken)el.classList.add('cg-scene');detail.hidden=true;retry.hidden=true;document.getElementById('cgBusy').hidden=false;status(es,en);}
    // The renderer is tiny and drawn from the actual Gum function, not a new mascot.
    paint();requestAnimationFrame(()=>requestAnimationFrame(()=>{timings.firstPaint=performance.now();}));
    return {timings,status,error,show,hide,onEnter(fn){enter=fn;},get action(){return pendingAction;},
      hydrate(){
        initialized=true;
        const raw=portal.storage.getItem('gumflow-v3')||portal.storage.getItem('gumflow-v2');
        if(raw){try{preferences=JSON.parse(raw).settings||{}}catch(_){preferences={}}}
        const saved=portal.storage.getItem('gumflow-language');language=['es','en'].includes(saved)?saved:portal.language;
        labels();audioButton.disabled=false;langButton.disabled=false;play();
      },
      takeAudio(){
        taken=true;cancelAnimationFrame(raf);clearInterval(padTimer);document.removeEventListener('pointerdown',unlock);document.removeEventListener('keydown',unlock);document.removeEventListener('visibilitychange',visibility);
        if(bus&&context)bus.gain.setTargetAtTime(0,context.currentTime,.025);
        if(source){try{source.stop(context.currentTime+.14)}catch(_){}source.onended=()=>{source.disconnect();bus.disconnect();};}
        return {context,buffer,position:buffer&&source?(context.currentTime-startedAt)%buffer.duration:0,bufferPromise:decoding};
      }
    };
  }
  root.GumflowCGShell={createShell};
})(globalThis);
