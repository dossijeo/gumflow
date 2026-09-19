 const UI_THUMBS=[__GUM_DATA_URI__("assets/images/thumbnails/01-gum-works.webp"),__GUM_DATA_URI__("assets/images/thumbnails/02-soda-sewers.webp"),__GUM_DATA_URI__("assets/images/thumbnails/03-candy-city.webp"),__GUM_DATA_URI__("assets/images/thumbnails/04-freezer-district.webp"),__GUM_DATA_URI__("assets/images/thumbnails/05-chocolate-foundry.webp"),__GUM_DATA_URI__("assets/images/thumbnails/06-the-wrapper.webp"),__GUM_DATA_URI__("assets/images/thumbnails/07-the-mouth.webp")];
 let uiFreeRun=false, uiNextFree=false, uiPauseContext=false, uiArtIndex=0;
 function uiEsc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
 function uiNum(n){return Number(n||0).toLocaleString(document.documentElement.lang==='en'?'en-US':'es-ES')}
 function uiTotalStars(){return WORLDS.reduce((sum,_w,i)=>sum+((profile.records?.[i]?.starFlags||[]).filter(Boolean).length),0)}
 function uiWorldDone(){return WORLDS.reduce((sum,_w,i)=>sum+(profile.records?.[i]?1:0),0)}
 function uiBestGrades(g='S'){return WORLDS.reduce((sum,_w,i)=>sum+((profile.records?.[i]?.grade===g)?1:0),0)}
 function uiWorldRecord(i){
   const r=profile.records?.[i];
   if(!r) return 'Sin completar · ☆☆☆';
   const stars=(r.starFlags||[]).filter(Boolean).length;
   return `${formatTime(r.time)} · ${r.grade||'—'} · ${'★'.repeat(stars)}${'☆'.repeat(Math.max(0,3-stars))}`;
 }
 function uiThumb(i){return `background-image:linear-gradient(180deg,rgba(255,255,255,.02),rgba(13,10,29,.18)), url('${UI_THUMBS[i]}');border-color:${WORLDS[i].color}55;`}
 function uiReturnToMenu(){menu()}
 function uiSetSound(on){soundEnabled=!!on;profile.settings.sound=soundEnabled;if(soundEnabled)audioStart();chipPreview=null;persist()}
 function uiToggleAssist(){profile.settings.assist=!profile.settings.assist;persist()}
 function uiTogglePainted(){profile.settings.painted=profile.settings.painted===false;persist()}
 function uiCampaignSessionText(){
   const s=profile.session;
   if(!s||s.level==null||s.level<0||s.level>=WORLDS.length) return 'Sin partida en pausa. Puedes empezar desde el principio o escoger un mundo.';
   return `Continuar disponible · Mundo 0${s.level+1} / 07 · ${WORLDS[s.level].name}`;
 }
