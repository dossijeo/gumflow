# Gamepad input layer

This is additive input, not a physics rewrite. `src/platform/index.js` is a
build-time include just before the original bootstrap. Its explicitly marked
block is the only game-runtime delta from the original 6.1 assembly.

## Web path

`pad-core.js` contains pure validation/mapping functions. `gamepad.js` polls once
per rendered frame, then the existing 120 Hz update loop consumes the same
left/right/jump/elastic booleans as before. Keyboard/touch are merged, not replaced.
Mappings with no standard layout are rejected rather than guessed. The left stick
has configurable dead zone and release hysteresis to limit drift/chatter.

An edge is required for confirm/pause/back. After transitions the controller has
to return to neutral to prevent a held confirm from turning into a jump or pause.
The menu navigator uses button geometry, supports sliders and tabs, and preserves
existing back/paused-menu routing. Text fields still require keyboard input.

One controller is active for one player. Disconnecting an actively used controller
pauses gameplay, rather than leaving a direction stuck. Window blur clears input;
the existing game focus behavior is retained. Controller options are bilingual.

## Desktop fallback

`desktop-bridge.js` uses Tauri only when `window.__TAURI__` is present. No Tauri
module imports are required by the web build. `controller_snapshot` is a read-only
command returning connected pads in browser-standard layout.

The Rust thread owns `gilrs`, normalizes button order and inverts stick Y to match
the browser convention. JS polls asynchronously with at most one request pending;
stale snapshots expire. Auto prefers a standard web pad and otherwise the native
snapshot. Users can force the native backend in desktop Options.

Native support is intentionally configured only for Windows/Linux. No claims are
made here about Android/iOS binaries, arbitrary third-party controllers, vibration,
Steam Input integration, or console certification.

## Fullscreen and privileges

The existing fullscreen buttons call the native window API in Tauri and the
original browser implementation elsewhere. F11/Y are additional desktop/gamepad
shortcuts. Capabilities allow only reading and changing fullscreen. The app-owned
controller command exposes no arbitrary Rust operation. Remote navigation is
blocked and a local CSP is configured.

## Testing

`npm test` covers dead zones, hysteresis, standard layouts, null slots, unknown
mappings, safe merging and menu geometry. `tests/browser_gamepad.py` runs actual
Chromium with synthetic controllers and a mocked Tauri service. This exercises
JS integration, not USB/Bluetooth/OS drivers.

Manual requirements: Xbox/PlayStation-type hardware on Windows and Linux,
connection while running, removal during a jump, pause/resume, menu entry, held
confirm across transitions, audio activation, fullscreen and gamepad-only play.
Check browser permissions when embedding the game, and controller permissions
under a normal desktop session on Linux. Do not run as root to bypass a failure.
