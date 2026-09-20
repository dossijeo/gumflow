# GUMFLOW

**100% gum. 0% obedience.**

A fast 2D momentum platformer about a piece of gum that refuses to be chewed.
Seven campaign worlds, bosses, Free Play, Endless Flow, Spanish/English menus,
and adaptive HD/classic music.

## 🎮 Play GUMFLOW

**[▶ PLAY FREE IN YOUR BROWSER ON ITCH.IO](https://dossijeo.itch.io/gumflow)**

No installation required.

**[Download Windows / Linux builds](https://github.com/dossijeo/gumflow/releases)**

This revision packages the approved **6.1 game as 6.1.1** and adds controller
input and a Tauri 2 desktop shell. The game's content/version label remains 6.1;
6.1.1 identifies the new packaging and input layer, not a rewritten game.

**[Code signing policy](CODE_SIGNING_POLICY.md)** ·
[Publicación y compilación, en español](docs/DESKTOP.md) ·
[Gamepad design and limitations](docs/GAMEPAD.md) ·
[Original source architecture](docs/ARCHITECTURE.md) ·
[Asset inventory](docs/ASSETS.md)

## Browser builds — still dependency-free

Use Node.js 22 or newer. No npm installation is needed for the web game.

```sh
npm run dev                  # http://127.0.0.1:5173; refresh after editing
npm run build                # dist/gumflow.html — self-contained HTML
npm run build:web            # dist/web — external JS/CSS/MP3/WebP files
npm run build:release        # HTML, itch.io ZIP, web ZIP and SHA256SUMS
npm test                     # build, controller and configuration tests
npm run verify:core          # original 6.1 bytes/assets preserved outside additions
```

The HTML and web ZIP now include the same optional gamepad support used by the
native shell. Keyboard/touch, physics, campaign, bosses, Endless and music
remain the original implementation. All assets stay offline.

## Desktop builds

The Tauri project is in `desktop/tauri/src-tauri/`. It consumes **the same**
`dist/web` output. It does not ship a development server or Node.js runtime.

GitHub Actions can build without a Windows/Linux development machine:

1. Push the sources and workflows to `main`.
2. Run **Actions → Build desktop packages → Run workflow** for test artifacts.
3. Download and test Windows/Linux packages. Save the generated dependency locks.
4. Push the new tag `v6.1.1` to run **Draft release**.
5. Test the draft's files, then manually **Publish release**.

An ordinary push does not publish a release. The existing `Release-web` is not
changed. Builds target **Windows x64** and **Linux x64**, not Android/iOS yet.

On a suitably configured Windows/Linux development machine:

```sh
npm run desktop:install      # desktop-only npm dependencies
npm run desktop:dev
npm run desktop:build -- --bundles nsis             # Windows
npm run desktop:build -- --bundles appimage,deb     # Linux
```

Rust and the native platform prerequisites are required for these commands.
See [the guide](docs/DESKTOP.md) for the first build, lockfiles, releases,
unsigned Windows executables, Linux dependencies and troubleshooting.

## Controls

| Action | Keyboard | Standard controller |
|---|---|---|
| Move / navigate | A D / arrows | Left stick / D-pad |
| Jump / confirm | Space / W / Up | A / Cross |
| Gum / back in menus | X / Shift | B / Circle |
| Alternate gum | X / Shift | X / Square, RB / R1, RT / R2 |
| Pause | P / Esc | Start / Menu |
| Fullscreen | title/HUD button; F11 in desktop | Y / Triangle |
| Change menu tab | select a tab | LB / RB |

**Options → Controls → Gamepad** has enable/disable, adjustable dead zone,
backend selection and connection diagnostics. Browser standard mappings are
preferred; desktop falls back to a small native `gilrs` bridge. Non-standard
browser mappings are not guessed. Single player; no vibration or remapping UI.
Physical controllers and native WebViews still require platform testing.

## Source and packaging layout

```text
src/                    # existing shared-scope game, organized by subsystem
  core/ game/ rendering/ audio/ ui/ i18n/ styles/ debug/
  platform/             # additive gamepad + optional desktop bridge
assets/                 # the original 20 WebP images and 4 MP3 cuts
web/                    # HTML templates / fixed UI elements
scripts/                # web builder, desktop launcher, release helpers
config/                 # build paths and asset inventory
tests/                  # original baseline + JS / Chromium regression tests
desktop/tauri/           # isolated npm tool dependency
  src-tauri/            # Rust app, native controllers, Tauri config, icons
.github/workflows/
  ci.yml                # web tests on pushes / pull requests
  desktop-build.yml     # manual/reusable build, artifacts only
  release.yml           # version tag → all builds → draft release
```

Original source files still use build-time includes, not ES module imports.
The platform extension is included immediately before the existing bootstrap.
The former byte-identical source extraction is documented in
[ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Preservation and tests

`verify:core` removes **only** the explicitly delimited new platform/input block
from the assembled HTML and checks that everything else still matches the
approved 6.1 fingerprint:

```text
11,224,996 bytes
SHA-256 611f9687f455360eb0f97e9e46f76f93446aea14d94ed24ade3b38f1254bb6f5
```

It also checks all 24 original assets. Their bytes have not been recompressed.
The generated HTML itself is now different because it includes controller
support. `verify:baseline` remains the old *strict* whole-file comparison and
is expected to fail after this intentional addition. Its fixture was not reset.

Optional browser tests need Python and Playwright with Chromium:

```sh
npm run build:release
python tests/browser_smoke.py
python tests/browser_gamepad.py
# Add --browser /path/to/chromium to use an installed browser.
```

The tests use a clearly marked in-memory storage harness. The gamepad tests use
synthetic standard controllers and a mocked native bridge, **not real USB or
Bluetooth hardware**. The workflow adds `cargo test` and the actual Tauri build;
no native binary is claimed to have been locally compiled during patch creation.

For the next packaging version:

```sh
npm run version:set -- 6.1.2
npm run release:check
```

Review and commit the changes before tagging. The helper updates package,
Tauri and Cargo metadata (including lockfile root versions when present), not
in-game text, music or dependency versions.

## License and provenance

The existing **LICENSE is unchanged**. Original asset provenance remains in
[ASSETS.md](docs/ASSETS.md). Tauri/gilrs are added desktop dependencies; no new
third-party songs or pictures are introduced. The app icon is rendered from
Gum's existing drawing function. Source is shipped under the repository's
existing terms; this patch makes no new claims about rights to upstream music.

## Desktop 6.1.2 packaging update

[Default audio, focused Linux multimedia payload and native CI smoke tests](docs/DESKTOP-6.1.2.md).
Fresh desktop installations start music on the title; explicit mute preferences
are preserved. AppImage still bundles its media framework, using an audio-only
plugin selection instead of the entire installed multimedia collection.

## CrazyGames edition — separate web distribution

[CrazyGames build, SDK integration and upload guide](docs/CRAZYGAMES.md)

```sh
npm run build:crazygames     # dist/gumflow-crazygames.zip; no npm dependencies
npm run dev:crazygames       # localhost preview; official SDK needs Internet
npm run test:crazygames      # Python/Playwright, explicit mocked SDK v3
```

**Actions → Build CrazyGames package** builds and tests this variant without
compiling Rust, Windows or Linux. Download `gumflow-release-crazygames`, extract
GitHub's outer artifact ZIP, and upload the enclosed `GUMFLOW-v…-crazygames.zip`
to the CrazyGames Developer Portal. `index.html` is at the upload ZIP's root.
Future **Draft release** runs also attach that ZIP to the draft, with its build
report and checksum. No existing published release is modified.

This variant initializes CrazyGames SDK v3 before the game starts, reports
actual gameplay start/stop, respects the portal's `muteAudio`, uses the portal
locale for automatic language selection, and removes in-game fullscreen.
The CrazyGames-only save provider uses SDK Data for cloud/guest progress.
Its lightweight menu loads first; world artwork and gameplay music are deferred.
Select **Yes, using the Data Module from the CrazyGames SDK** when uploading.
No advertising, account prompts or purchases are implemented.
Normal HTML/itch.io/desktop builds remain offline and do not load this SDK.
The CrazyGames variant contacts the SDK and reports lifecycle events to the
platform: do **not** describe it as fully offline or network-free.

The included browser tests use a **mock SDK** and real Canvas/Web Audio.
They are not a substitute for CrazyGames' live **Preview Tool** or QA approval.
