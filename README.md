# GUMFLOW

**100% gum. 0% obedience.**

A fast 2D momentum platformer about a piece of gum that refuses to be chewed.
Seven campaign worlds, bosses, Free Play, Endless Flow, Spanish/English menus,
and an adaptive soundtrack with Everyday, Claustrophobic and Epic arrangements.

This checkout preserves **GUMFLOW 6.1**. The original single-file release has been
extracted into source files and binary assets. Rebuilding the standalone target
produces **exactly the same HTML bytes**, not a remake of the game.

[Instrucciones en español](docs/LEEME.md) · [Architecture](docs/ARCHITECTURE.md) ·
[Validation](docs/VALIDATION.md) · [Asset inventory](docs/ASSETS.md)

## Run and build

Use **Node.js 22 or newer**. There are no npm dependencies and no dependency
installation is required. Commands work from the repository root.

```sh
npm run dev                  # local server; refresh the browser after editing
npm run build                # dist/gumflow.html — standalone and fully offline
npm run build:web            # dist/web/ — HTML, JS, CSS and external assets
npm run build:release        # both targets + two ZIP packages + SHA256SUMS
npm test                     # 10 structural/reproducibility tests
npm run verify:baseline      # compare against the frozen 6.1 release
```

`dev` serves `http://127.0.0.1:5173` and rebuilds source changes on page refresh.
Stop it with Ctrl+C. `HOST` and `PORT` can be set explicitly. Restart the server
when changing the build configuration itself.

The release command writes:

```text
dist/
  gumflow.html          # byte-identical to the original 6.1 at this commit
  gumflow-itch.zip      # one index.html at the archive root; fully embedded
  gumflow-web.zip       # external-file web build, with index.html at root
  SHA256SUMS
  web/
    index.html
    game.js
    styles.css
    assets/
```

The generated `dist/` directory is intentionally not versioned. All inputs
needed to rebuild it are versioned, including the music clips and images.
Opening `web/index.template.html` or `src/index.js` directly is **not** a way to
run the game: use the development server or a generated distribution.

## Source layout

```text
src/
  index.js               # ordered build-time include manifest
  core/                  # state, initialization, events, save, frame loop
  game/
    campaign/            # worlds, generation, session and progression
    physics/             # geometry, momentum, jumps, loops and tubes
    mechanics/           # flavors, anchors, bubbles, wrappers and interactions
    bosses/              # catalog, arenas, attacks, practice and integration
    endless/             # seeded modules, biomes, recycling and records
    data/                # materials, achievements and gags
  rendering/             # Gum, terrain, NPCs, bosses, parallax and effects
  audio/
    classic/             # existing procedural chiptune score and synthesizer
    hd/                  # audio clips manifest, musical timing, crossfades
    director/            # danger detection and Everyday/Epic/tension decisions
    ambient/             # seven world accompaniment patterns and scheduling
  ui/                    # title, menus, HUD, museum, options and notifications
  i18n/                  # existing display-localization engine + English catalog
  styles/                # initial styles and dynamically installed menu styles
  debug/                 # original testing hooks, preserved unchanged
assets/
  images/campaign/       # seven painted world backgrounds
  images/endless/        # six transparent parallax layers
  images/thumbnails/     # seven actual in-game scene thumbnails
  audio/hd/              # four existing MP3 cuts; no re-encoding
web/                     # page template + fixed canvas/HUD/overlay markup
scripts/                 # dependency-free builds, ZIP writer and dev server
config/                  # project paths and asset inventory
tests/                  # baseline fingerprint + regression tests
docs/                   # architecture, editing and validation notes
```

## Why not ES modules yet?

This is a **source-preserving extraction**, not an architectural rewrite. The
original game contains ordered extension layers and shared lexical state.
Build-time includes retain that exact scope, declaration order and function
replacement order. They are not browser `<script>` tags or ES module imports.

Each subsystem can now be edited separately, and assets are real MP3/WebP files
rather than enormous base64 strings. The standalone builder reinserts those
assets and JSON tables without changing a single gameplay instruction. See
[the architecture notes](docs/ARCHITECTURE.md) before reordering source files.

For the external-file web target only, the audio loader reads the same MP3 bytes
with `fetch` instead of `atob`. All transition logic, decoding, scheduling,
volumes and danger triggers are unchanged. The tests explicitly reverse this
transport adapter and compare the resulting runtime with the original.

## Verification

Frozen release fingerprint:

```text
11,224,996 bytes
SHA-256 611f9687f455360eb0f97e9e46f76f93446aea14d94ed24ade3b38f1254bb6f5
```

`verify:baseline` is deliberately strict. It will fail after intentional game
changes; that is expected. `build` still works for edited versions. Do not update
the frozen baseline merely to hide an unexpected regression.

Optional browser tests require Python 3.10+ and Playwright with Chromium:

```sh
npm run build:release
python tests/browser_smoke.py
# Or use an installed Chromium:
python tests/browser_smoke.py --browser /path/to/chromium
```

They exercise both distribution targets in Spanish and English, compare
simulation snapshots, enter all seven levels and boss arenas, run both Endless
modes, change language, and decode/play the adaptive clips. They use local
request interception and a clearly labeled in-memory storage fixture; they do
not claim to test persistent browser storage or a real itch.io deployment.

## License and provenance

The repository's existing **LICENSE is retained without modification**. This
extraction introduces no new third-party music, art or runtime libraries. The
four music assets are the cuts already embedded in version 6.1, not the original
full-length uploads. Their origins are recorded in [ASSETS.md](docs/ASSETS.md).
No new ownership or licensing assertions about upstream melodies are made here.

A Windows wrapper and a Godot port are **not** part of this extraction. The
external-file web build is available as an input for a future desktop package;
there is no second implementation of the game to maintain.
