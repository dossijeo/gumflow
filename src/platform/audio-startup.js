/** Start the existing audio engine, without changing the score or director.
 * A saved mute choice is authoritative. Desktop's trusted local WebView permits
 * autoplay; a browser that blocks it keeps the existing first-gesture fallback.
 * Queueing is important: bootstrap assigns soundEnabled and creates the title.
 */
const GumflowAudioStartup = (() => {
  profile.settings.sound ??= true;
  profile.settings.musicOn ??= true;
  function start() {
    if(document.hidden || profile.settings.sound === false || profile.settings.musicOn === false) return;
    soundEnabled = true;
    // hdUnlock is idempotent and reuses AudioContext/buses. A blocked resume does
    // not set the preference to false and never overwrites the user's settings.
    if(!HD.unlocked || audioCtx?.state === 'suspended') audioStart();
  }
  queueMicrotask(start);
  addEventListener('pageshow', start);
  addEventListener('visibilitychange', start);
  return {start};
})();
