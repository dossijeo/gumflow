/* Only this distribution loads the remote SDK. It must finish init() before
 * the game's saved settings, language, UI or AudioContext can start. */
(function () {
  'use strict';
  const portal = window.GumflowCG.createPortal({ log: message => console.warn('GUMFLOW / CrazyGames:', message) });
  window.GumflowCrazyGames = portal;
  // Register BEFORE the game's auto-pause listeners, including at-target blur.
  window.addEventListener('blur', () => portal.noteFocusLoss(), true);
  window.addEventListener('visibilitychange', () => { if(document.hidden) portal.noteFocusLoss(); }, true);
  const screen = document.getElementById('cgLoading');
  const status = document.getElementById('cgLoadingStatus');
  const retry = document.getElementById('cgRetry');
  retry.onclick = () => window.location.reload();
  function loadScript(src, timeoutMs = 15000) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => { script.remove(); reject(new Error('Script load timed out: ' + src)); }, timeoutMs);
      script.onload = () => { clearTimeout(timer); resolve(); };
      script.onerror = () => { clearTimeout(timer); reject(new Error('Script load failed: ' + src)); };
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    });
  }
  async function deadline(promise, message, ms = 20000) {
    let timer;
    try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), ms); })]); }
    finally { clearTimeout(timer); }
  }
  // A loading overlay also blocks keyboard/gamepad shortcuts, not just clicks.
  // A failed SDK displays a retry screen rather than launching an untracked game.
  window.addEventListener('keydown', event => {
    if (!screen.hidden && event.code !== 'Tab') { event.stopImmediatePropagation(); }
  }, true);
  async function start() {
    try {
      await loadScript('https://sdk.crazygames.com/crazygames-sdk-v3.js');
      await deadline(portal.initialize(window.CrazyGames?.SDK), 'SDK initialization timed out');
      status.textContent = portal.language === 'es' ? 'Preparando el chicle…' : 'Preparing the gum…';
      await loadScript('./game.js');
      await deadline(portal.whenReady(), 'Game assets did not finish loading', 30000);
      screen.hidden = true;
      document.documentElement.classList.remove('cg-loading');
    } catch (error) {
      portal.dispose();
      console.error('GUMFLOW / CrazyGames startup:', error);
      status.textContent = 'Could not load the game. Check your connection and retry. / No se pudo cargar el juego. Comprueba la conexión y reintenta.';
      retry.hidden = false;
      retry.focus();
      screen.dataset.error = String(error?.message || error);
    }
  }
  start();
})();
