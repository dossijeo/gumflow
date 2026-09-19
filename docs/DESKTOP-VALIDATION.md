# Validation of the desktop/gamepad patch

Prepared against repository commit
`f811343191c9082d8a3c5b25851b04fc1b95c5cb`, whose source tree is
`655971cfc98a175c9be922937eb76e7e9fbcace3`.

## Executed during preparation

- Node.js 22.16.0: **29 tests passed** with `npm test`.
- `npm run verify:core`: removing only the new marked platform block restores
  the original 6.1 HTML: 11,224,996 bytes and SHA-256
  `611f9687f455360eb0f97e9e46f76f93446aea14d94ed24ade3b38f1254bb6f5`.
- All 20 original images and 4 original MP3 files match their frozen hashes.
- `npm run release:check`: the five version metadata locations agree on 6.1.1.
- `npm run build:release`: standalone, itch.io ZIP and external web ZIP generated.
- Chromium browser smoke tests: standalone/external-file builds in es-ES/en-US;
  each covers seven world entries/movement, seven boss entries, both Endless
  modes, menu/language navigation and HD audio. Simulation snapshots agree
  between the two build formats. No page errors in those tests.
- Chromium controller fixture tests: standard mapping, menu confirmation/back,
  slider adjustment, jump/charge, pause edge handling, disconnect auto-pause,
  blocked API and non-standard mapping. A second case tests native snapshots
  and native fullscreen using a **mock** `window.__TAURI__`.
- Mocked GitHub release-lookup tests cover public releases, existing drafts,
  pagination, permission errors and duplicate tags; no requests are sent.
- YAML parsing/structural checks for all workflows; TOML parsing, config paths,
  capabilities, icon formats and expected artifact names inspected.
- The final Git binary patch is checked and applied against a clean copy of the
  baseline before delivery; web tests/build/core preservation are repeated there.

The original `tests/browser_smoke.py` documents its local resource interception
and in-memory storage fixture. These tests do not assert persistence in a live
itch.io iframe or real native WebView.

## Explicitly NOT executed during preparation

The local environment has no Rust toolchain or native dependency-download access.
No Windows/Linux Tauri binary was compiled, installed, signed or launched locally.
The GitHub Actions jobs were authored but not run against the user's account.
No physical controller, Bluetooth connection, Linux input-device permission,
Windows WebView2 or WebKitGTK rendering/audio was tested here.

The workflow's first actual run is the compilation check; a successful build is
then a release candidate, not a substitute for manual desktop testing. Follow
`DESKTOP.md` before publishing. No Android/iOS builds or hardware support are
claimed. The unchanged old strict `verify:baseline` is expected to reject the
new full HTML, because the controller layer was intentionally added.
