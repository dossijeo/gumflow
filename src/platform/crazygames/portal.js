/* CrazyGames-only adapter. Loaded before game.js, never in the normal builds.
 * API contract: https://docs.crazygames.com/sdk/intro/ and /sdk/game/ (v3).
 * No account prompts, ads, analytics of our own, or save-data uploads.
 */
(function (root) {
  'use strict';
  const supported = new Set(['local', 'crazygames']);
  const languageFor = locale => /^es(?:[-_]|$)/i.test(String(locale || '')) ? 'es' : 'en';

  function createPortal({ log = () => {}, now = () => Date.now() } = {}) {
    let sdk = null, environment = 'uninitialized', initialized = false;
    let startedLoading = false, ready = false, desiredPlaying = false, reportedPlaying = false;
    let focusLost = false, nextPublishAt = 0;
    let muted = false, language = 'en', initPromise = null, disposed = false;
    const listeners = new Set(), gates = new Map(), errors = [];
    const counts = { loadingStart: 0, loadingStop: 0, gameplayStart: 0, gameplayStop: 0 };
    let resolveGame, rejectGame;
    const gameReady = new Promise((resolve, reject) => { resolveGame = resolve; rejectGame = reject; });
    // A failed image may arrive before the loader attaches its await handler.
    gameReady.catch(() => {});
    const enabled = () => initialized && supported.has(environment) && !disposed;
    function error(e) {
      const message = String(e?.message || e);
      if (errors.length < 20) errors.push(message);
      log(message);
    }
    function call(name) {
      if (!enabled()) return false;
      try {
        sdk.game[name]();
        counts[name]++;
        return true;
      } catch (e) { error(e); return false; }
    }
    function publishState() {
      // The title/intro/loading screens are not gameplay. No event queue replay:
      // if something changes before ready, publish only the current state.
      if (!ready || !enabled() || reportedPlaying === desiredPlaying || now() < nextPublishAt) return;
      if (call(desiredPlaying ? 'gameplayStart' : 'gameplayStop')) {
        reportedPlaying = desiredPlaying; nextPublishAt = 0;
      } else {
        // A temporarily unavailable portal must not get one failed call per frame.
        nextPublishAt = now() + 1000;
      }
    }
    function updateGates() {
      for (const [context, { gain }] of gates) {
        if (context.state === 'closed') { gates.delete(context); continue; }
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now);
        // A portal mute is immediate and includes already scheduled sounds.
        gain.gain.setValueAtTime(muted ? 0 : gain.gain.value, now);
        if (!muted) gain.gain.linearRampToValueAtTime(1, now + 0.025);
      }
    }
    function settingsChanged(settings) {
      if (!settings || typeof settings.muteAudio !== 'boolean') return;
      const changed = muted !== settings.muteAudio;
      muted = settings.muteAudio;
      updateGates();
      if (changed) for (const listener of listeners) { try { listener(muted); } catch (e) { error(e); } }
    }
    async function initialize(instance) {
      if (initPromise) return initPromise;
      initPromise = (async () => {
        if (!instance || typeof instance.init !== 'function') throw new Error('CrazyGames SDK v3 is unavailable');
        sdk = instance;
        await sdk.init();
        if (disposed) throw new Error('SDK initialization was cancelled');
        environment = sdk.environment;
        if (typeof environment !== 'string') throw new Error('SDK environment is missing');
        if (supported.has(environment)) {
          for (const name of ['gameplayStart', 'gameplayStop', 'loadingStart', 'loadingStop', 'addSettingsChangeListener', 'removeSettingsChangeListener']) {
            if (typeof sdk.game?.[name] !== 'function') throw new Error('SDK v3 method missing: game.' + name);
          }
          // Listen first, then read the current state. Both precede audio setup.
          sdk.game.addSettingsChangeListener(settingsChanged);
          settingsChanged(sdk.game.settings);
          language = languageFor(sdk.user?.systemInfo?.locale);
        }
        // 'disabled' and any future unknown environment: no game/user API calls.
        initialized = true;
        if (enabled()) startedLoading = call('loadingStart');
        return snapshot();
      })();
      return initPromise;
    }
    function audioDestination(context) {
      if (!context) throw new Error('AudioContext is required');
      if (!gates.has(context)) {
        const gain = context.createGain(), meter = context.createAnalyser();
        gain.gain.value = muted ? 0 : 1;
        meter.fftSize = 1024;
        gain.connect(meter);
        meter.connect(context.destination);
        gates.set(context, { gain, meter });
      }
      return gates.get(context).gain;
    }
    function audioSnapshot() {
      return [...gates.entries()].map(([context, { gain, meter }]) => {
        const values = new Float32Array(meter.fftSize);
        meter.getFloatTimeDomainData(values);
        return { state: context.state, gain: gain.gain.value,
          rms: Math.sqrt(values.reduce((sum, n) => sum + n*n, 0) / values.length) };
      });
    }
    function markReady() {
      if (ready || disposed) return;
      ready = true;
      if (startedLoading) call('loadingStop');
      publishState();
      resolveGame();
    }
    function failGame(e) { error(e); rejectGame(e); }
    function snapshot() {
      return { environment, enabled: enabled(), initialized, ready, muted, language,
        desiredPlaying, reportedPlaying, focusLost, counts: { ...counts }, errors: [...errors] };
    }
    function dispose() {
      if (disposed) return;
      if (enabled()) {
        try { sdk.game.removeSettingsChangeListener(settingsChanged); } catch (e) { error(e); }
      }
      // Do not emit gameplayStop for focus/pagehide. The portal handles leaving.
      disposed = true;
      listeners.clear();
      for (const { gain, meter } of gates.values()) { gain.disconnect(); meter.disconnect(); }
      gates.clear();
    }
    return { initialize, audioDestination, audioSnapshot, markReady, failGame,
      whenReady: () => gameReady, snapshot, dispose,
      noteFocusLoss() { if (desiredPlaying) focusLost = true; },
      clearFocusLoss() { focusLost = false; },
      get focusLost() { return focusLost; },
      setGameplay(value) { desiredPlaying = value === true; publishState(); },
      onMute(listener) { listeners.add(listener); return () => listeners.delete(listener); },
      get language() { return language; }, get muted() { return muted; }, get ready() { return ready; } };
  }
  root.GumflowCG = { createPortal, languageFor };
})(globalThis);
