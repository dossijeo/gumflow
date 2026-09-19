/** Additive controller support. Runs BEFORE the original frame, without changing
 * the 120 Hz simulation, music director, level data, or keyboard/touch handlers. */
const GumflowGamepad = (() => {
  let previous=GFPadCore.empty(),controls=GFPadCore.empty(),key=null;
  let focused=true,gate=false,used=false,lastScreen=state,lastPanel=null;
  let repeatDirection='',repeatAt=0,webError=null,source='none',deviceName='';
  let lastStatus=0,lastLanguage=I18N.language;
  const settings=profile.settings;
  if(typeof settings.gamepadEnabled!=='boolean') settings.gamepadEnabled=true;
  if(!Number.isFinite(settings.gamepadDeadzone)) settings.gamepadDeadzone=.24;
  if(!['auto','web','native'].includes(settings.gamepadBackend)||(!GumflowDesktop.available&&settings.gamepadBackend==='native')) settings.gamepadBackend='auto';
  const label=(es,en)=>I18N.language==='es'?es:en;
  function reset(waitForRelease=true) {
    controls=GFPadCore.empty();previous=GFPadCore.empty();gate=waitForRelease;
    repeatDirection='';repeatAt=0;
  }
  function currentPad(now) {
    let browser=[];
    try { browser=typeof navigator.getGamepads==='function'?Array.from(navigator.getGamepads()):[];webError=null; }
    catch(e) {webError=String(e);}
    const native=GumflowDesktop.pads(now),pref=settings.gamepadBackend;
    const web=GFPadCore.choose(browser,key,'web'),nat=GFPadCore.choose(native,key,'native');
    const p=pref==='native'?nat:pref==='web'?web:web||nat;
    source=p?(p===web?'web':'native'):'none';
    deviceName=p?.id||'';
    return p;
  }
  function focusables() {
    return [...$('panel').querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href]')]
      .filter(e=>e.tabIndex>=0&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden');
  }
  function select(element) {
    element?.focus({preventScroll:true});element?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
    document.body.classList.add('gamepad-navigation');
  }
  function navigate(direction) {
    const items=focusables();if(!items.length)return;
    const current=items.indexOf(document.activeElement),el=items[current];
    const horizontal=direction==='left'||direction==='right',sign=direction==='left'?-1:1;
    if(horizontal&&el?.matches('input[type=range]')) {
      const min=Number(el.min||0),max=Number(el.max||100),step=Number(el.step)||1;
      el.value=String(Math.max(min,Math.min(max,Number(el.value)+sign*step)));
      el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));return;
    }
    if(horizontal&&el?.tagName==='SELECT') {
      el.selectedIndex=Math.max(0,Math.min(el.options.length-1,el.selectedIndex+sign));
      el.dispatchEvent(new Event('change',{bubbles:true}));return;
    }
    const next=GFPadCore.neighbor(items.map(e=>e.getBoundingClientRect()),current,direction);
    select(items[next]);
  }
  function back() {
    if(state==='paused'){pause();return;}
    const specific={efhelp:'efHelpBack',efresults:'efResultMenu',bossclear:'trialBack',story:'storyBack',gameover:'backMenu',levelclear:'worldGame',victory:'backMenu'};
    if(specific[state]&&$(specific[state])){$(specific[state]).click();return;}
    // Let the existing menu router choose the parent page, including pause context.
    window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',bubbles:true,cancelable:true}));
  }
  function confirm() {
    const items=focusables();const el=items.includes(document.activeElement)?document.activeElement:items[0];
    if(!el)return;select(el);
    if(el.tagName==='BUTTON'||el.tagName==='A')el.click();
    else if(el.matches('input[type=checkbox]')){el.click();}
    // Text/seed fields retain keyboard editing. No simulated keystrokes in them.
  }
  function tab(sign) {
    const tabs=[...$('panel').querySelectorAll('.gf5-tabbar button')].filter(e=>!e.disabled);
    if(!tabs.length)return;
    const i=tabs.findIndex(e=>e.classList.contains('active'));tabs[(Math.max(0,i)+sign+tabs.length)%tabs.length].click();
  }
  function update(now) {
    GumflowDesktop.poll(now);
    if(!settings.gamepadEnabled||!focused||document.hidden){reset();return;}
    const p=currentPad(now),newKey=p?`${source}:${p.index}`:null;
    if(key&&!newKey&&used&&state==='playing'){reset();pause();toast(label('Mando desconectado · partida pausada','Controller disconnected · game paused'));}
    if(newKey!==key){reset(!!key);key=newKey;used=false;}
    if(!p){reset(false);updateStatus(now);return;}
    const screenChanged=state!==lastScreen||$('panel').firstElementChild!==lastPanel;
    if(screenChanged){reset(true);lastScreen=state;lastPanel=$('panel').firstElementChild;}
    const sample=GFPadCore.read(p,settings.gamepadDeadzone,previous);
    if(gate){if(!GFPadCore.active(sample))gate=false;previous=sample;controls=GFPadCore.empty();updateStatus(now);return;}
    const edge=k=>sample[k]&&!previous[k];
    if(GFPadCore.active(sample))used=true;
    controls=state==='playing'?sample:GFPadCore.empty();
    if(edge('fullscreen')){hdFullscreen();}
    if(edge('pause')&&(state==='playing'||state==='paused')){pause();reset(true);}
    else if(state!=='playing'&&state!=='dying'&&state!=='finishing'&&$('overlay').style.display!=='none') {
      if(edge('back')){back();reset(true);}
      else if(edge('accept')){confirm();reset(true);}
      else if(edge('previous')){tab(-1);reset(true);}
      else if(edge('next')){tab(1);reset(true);}
      else {
        const d=['up','down','left','right'].find(k=>sample[k])||'';
        if(d&&(d!==repeatDirection||now>=repeatAt)){navigate(d);repeatAt=now+(d===repeatDirection?125:340);}
        repeatDirection=d;
      }
    }
    if(state!==lastScreen||$('panel').firstElementChild!==lastPanel){reset(true);lastScreen=state;lastPanel=$('panel').firstElementChild;}
    previous=sample;updateStatus(now);
  }
  function summary() {return {enabled:settings.gamepadEnabled,backend:source,id:deviceName,
    deadzone:settings.gamepadDeadzone,held:{...controls},blocked:gate,webError,native:GumflowDesktop.status()};}
  function statusText() {
    if(!settings.gamepadEnabled)return label('Mando desactivado','Controller disabled');
    if(key)return `${label('Conectado','Connected')}: ${deviceName} (${source==='native'?'gilrs':'Gamepad API'})`;
    return webError?label('API del navegador bloqueada; probando respaldo nativo.','Browser API blocked; trying the native backend.'):
      label('Conecta un mando y pulsa un botón para detectarlo.','Connect a controller and press a button to detect it.');
  }
  function updateStatus(now,force=false) {
    if(!force&&now-lastStatus<400)return;lastStatus=now;
    const out=$('gfPadStatus');if(out&&out.textContent!==statusText())out.textContent=statusText();
    if(lastLanguage!==I18N.language){lastLanguage=I18N.language;if($('gfPadOptions'))installOptions();}
  }
  function installOptions() {
    if(state!=='options'||!$('panel').querySelector('.gf5-legend'))return;
    const oldFocus=document.activeElement?.id;
    $('gfPadOptions')?.remove();
    const box=document.createElement('section');box.id='gfPadOptions';box.className='gf5-option-card';box.dataset.noTranslate='true';
    box.innerHTML=`<h3>${label('Mando','Gamepad')}</h3>
      <p>A / ✕: ${label('salto · confirmar','jump · confirm')} &nbsp; B / ○: ${label('chicle · volver','gum · back')}<br>
      X / □, RB / R1, RT / R2: ${label('chicle (alternativas)','gum (alternatives)')}<br>
      Start / Menu: ${label('pausa','pause')} · Y / △: ${label('pantalla completa','fullscreen')}<br>
      ${label('Cruceta o stick izquierdo: mover / navegar. LB y RB: pestañas.','D-pad or left stick: move / navigate. LB and RB: tabs.')}</p>
      <div class="gf5-option-row"><b>${label('Activar mando','Enable gamepad')}</b><button id="gfPadEnabled" class="setting">${settings.gamepadEnabled?label('SÍ','ON'):label('NO','OFF')}</button></div>
      <div class="gf5-option-row"><label for="gfPadDeadzone">${label('Zona muerta','Dead zone')} <span id="gfPadDeadzoneValue">${Math.round(settings.gamepadDeadzone*100)}%</span></label><input id="gfPadDeadzone" type="range" min="12" max="45" step="1" value="${Math.round(settings.gamepadDeadzone*100)}"></div>
      <div class="gf5-option-row"><label for="gfPadBackend">${label('Entrada','Backend')}</label><select id="gfPadBackend"><option value="auto">Auto</option><option value="web">Gamepad API</option>${GumflowDesktop.available?'<option value="native">Native · gilrs</option>':''}</select></div>
      <p id="gfPadStatus" role="status"></p>
      <small>${label('Un jugador. Disposición estándar Xbox/PlayStation. Sin vibración. Si un navegador bloquea el audio, pulsa «Activar audio» con ratón o teclado.','Single player. Standard Xbox/PlayStation layout. No vibration. If your browser blocks audio, click “Enable audio” with a mouse or keyboard.')}</small>`;
    const anchor=$('panel').querySelector('.gf5-backline');if(anchor)anchor.before(box);else $('panel').append(box);
    $('gfPadEnabled').onclick=()=>{settings.gamepadEnabled=!settings.gamepadEnabled;persist();reset(true);installOptions();};
    $('gfPadDeadzone').oninput=e=>{settings.gamepadDeadzone=Number(e.target.value)/100;$('gfPadDeadzoneValue').textContent=e.target.value+'%';persist();};
    $('gfPadBackend').value=GumflowDesktop.available?settings.gamepadBackend:(settings.gamepadBackend==='native'?'auto':settings.gamepadBackend);
    $('gfPadBackend').onchange=e=>{settings.gamepadBackend=e.target.value;persist();reset(true);};
    updateStatus(performance.now(),true);if(oldFocus&&$(oldFocus))select($(oldFocus));
  }
  const overlay=showOverlay;
  showOverlay=function(...args){const result=overlay(...args);installOptions();return result;};
  const originalRead=readInput;
  readInput=function(){return GFPadCore.merge(originalRead(),controls);};
  const originalFrame=frame;
  frame=function(time){update(time);originalFrame(time);};
  addEventListener('blur',()=>{focused=false;reset(true);});
  addEventListener('focus',()=>{focused=true;reset(true);});
  document.addEventListener('visibilitychange',()=>reset(true));
  addEventListener('pointerdown',()=>document.body.classList.remove('gamepad-navigation'),true);
  const style=document.createElement('style');style.textContent=`
    .gamepad-navigation #panel :focus {outline:3px solid #d9ff84!important;outline-offset:4px;}
    #gfPadOptions p,#gfPadOptions small {line-height:1.65;overflow-wrap:anywhere;}
    #gfPadOptions select {max-width:180px;background:#211f3e;color:#fff4db;padding:10px;border-radius:10px;}
    #gfPadOptions input {max-width:190px;}`;document.head.append(style);
  return {update,reset,summary,read:()=>readInput(),installOptions};
})();
// Diagnostic hooks, consistent with the existing __gumTest utilities. They do
// not invent or register devices: tests must supply their own navigator fixture.
window.__gumTest.gamepad={tick:GumflowGamepad.update,reset:GumflowGamepad.reset,
  info:GumflowGamepad.summary,read:GumflowGamepad.read};
