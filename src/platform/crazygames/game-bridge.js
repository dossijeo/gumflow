/* Inserted by build-crazygames.mjs inside the existing game scope, immediately
 * before bootstrap. The original standalone/itch.io/desktop code is untouched. */
const GumflowCGGame = (() => {
  const portal = window.GumflowCrazyGames;
  if (!portal?.snapshot().initialized) throw new Error('Initialize CrazyGames before bootstrapping GUMFLOW');
  let gameReady = false;
  const fullscreenIds = ['full', 'gf6TitleFull'];

  // Disable the actions as well as their UI, including the Y/Triangle binding.
  hdFullscreen = async function () {};
  hdTitleFullscreenState = function () {};
  $('full').onclick = hdFullscreen;

  function sync() {
    // The existing game automatically pauses on blur/backgrounding. Do not send
    // an SDK stop caused solely by losing focus (the platform already handles it).
    if (portal.focusLost && state === 'paused') return;
    portal.clearFocusLoss();
    portal.setGameplay(state === 'playing');
  }

  function decorate() {
    for (const id of fullscreenIds) {
      const button = $(id);
      if (button) { button.hidden = true; button.tabIndex = -1; button.setAttribute('aria-hidden', 'true'); }
    }
    let note = $('cgMuteNotice');
    if (portal.muted && $('panel')) {
      if (!note) {
        note = document.createElement('p');
        note.id = 'cgMuteNotice'; note.dataset.noTranslate = 'true'; note.setAttribute('role', 'status');
        $('panel').appendChild(note);
      }
      note.textContent = I18N.language === 'es'
        ? 'CrazyGames ha silenciado el audio. Puedes reactivarlo desde los controles del portal.'
        : 'Audio is muted by CrazyGames. Use the portal controls to unmute.';
    } else note?.remove();
  }
  portal.onMute(decorate);
  const oldLanguage = I18N.setLanguage;
  I18N.setLanguage = function (...args) { const out = oldLanguage.apply(this, args); decorate(); return out; };
  const oldOverlay = showOverlay;
  showOverlay = function (...args) { const out = oldOverlay(...args); decorate(); sync(); return out; };
  const oldHide = hideOverlay;
  hideOverlay = function (...args) { const out = oldHide(...args); sync(); return out; };
  const oldUpdate = update;
  update = function (dt, override) {
    if (!gameReady) return; // The loading screen is not gameplay, including pad input.
    oldUpdate(dt, override); sync();
  };
  const oldFrame = frame;
  frame = function (time) { sync(); oldFrame(time); sync(); };
  const oldReadInput = readInput;
  readInput = function () { return gameReady ? oldReadInput() : { left:false, right:false, jump:false, elastic:false }; };

  function imageReady(image) {
    if (image.complete) return image.naturalWidth > 0 ? Promise.resolve() : Promise.reject(new Error('Image could not be loaded: ' + image.src));
    return new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, {once:true});
      image.addEventListener('error', () => reject(new Error('Image could not be loaded: ' + image.src)), {once:true});
    });
  }
  queueMicrotask(async () => {
    try {
      // Canvas world images are not DOM <img> elements, so wait for them explicitly.
      await Promise.all([...BG_IMAGES, ...EF_LAYER_IMAGES].map(imageReady));
      gameReady = true; clearInput(); GumflowGamepad.reset(true); decorate();
      portal.markReady(); sync();
    } catch (e) { portal.failGame(e); }
  });
  return { sync, decorate, get focusPaused() { return portal.focusLost; } };
})();
window.__gumTest.crazygames = {
  sync: GumflowCGGame.sync,
  info: () => window.GumflowCrazyGames.snapshot(),
  audio: () => window.GumflowCrazyGames.audioSnapshot(),
  fullscreen: () => hdFullscreen()
};
