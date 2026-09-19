async function hdFullscreen(){
 try{
  if(document.fullscreenElement)await document.exitFullscreen();
  else if(document.webkitFullscreenElement)document.webkitExitFullscreen();
  else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();
  else if(document.documentElement.webkitRequestFullscreen)document.documentElement.webkitRequestFullscreen();
  else throw new Error('Unavailable');
 }catch(_){const el=$('gf6TitleStatus');if(el){el.textContent='Pantalla completa no disponible en este visor';I18N.localize(el)}else toast('Pantalla completa no disponible en este visor')}
 hdTitleFullscreenState();
}
function hdTitleFullscreenState(){const b=$('gf6TitleFull');if(!b)return;const on=!!(document.fullscreenElement||document.webkitFullscreenElement);b.textContent=on?'⛶ SALIR DE PANTALLA COMPLETA':'⛶ PANTALLA COMPLETA';b.setAttribute('aria-pressed',String(on));I18N.localize(b)}
function hdInstallTitle(){
 const tools=document.createElement('div');tools.className='gf6-title-tools';tools.innerHTML='<button class="secondary" id="gf6TitleFull">⛶ PANTALLA COMPLETA</button><button class="secondary" id="gf6AudioUnlock">♪ ACTIVAR AUDIO</button><span id="gf6TitleStatus" role="status"></span>';
 $('panel').appendChild(tools);$('gf6TitleFull').onclick=hdFullscreen;$('gf6AudioUnlock').onclick=()=>{if(HD.unlocked&&soundEnabled&&profile.settings.musicOn!==false){soundEnabled=false;profile.settings.sound=false;hdHalt(true)}else{soundEnabled=true;profile.settings.sound=true;profile.settings.musicOn=true;hdUnlock()}persist();hdStatus()};
 hdStatus();hdTitleFullscreenState();
}
addEventListener('fullscreenchange',hdTitleFullscreenState);addEventListener('webkitfullscreenchange',hdTitleFullscreenState);
$('full').onclick=hdFullscreen;
