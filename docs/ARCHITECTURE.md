# Source architecture and editing guide

## Constraint: preserve the shipped 6.1 product

The original release is one HTML document containing one initial stylesheet,
one runtime script, 20 embedded pictures and four embedded MP3 cuts. The runtime
has a private outer closure and an additional menu closure. Later feature
layers capture earlier functions, then wrap/replace them (bosses, Endless,
menus and adaptive audio).

Those details are observable. Converting each file into a separately executed
script, or automatically moving declarations into ES modules, would change
hoisting, initialization timing, references captured by wrappers and potentially
saved-session behavior. This patch does neither.

## Assembly

`web/index.template.html` is the HTML entry point. It includes:

- `src/styles/index.css`: the original initial styles in their cascade order.
- `web/markup.html`: the original canvas, HUD, controls and overlay markup.
- `src/index.js`: the ordered runtime fragments, inside the original closure.

`src/ui/index.js` assembles the menu files inside their original nested closure.
The two menu CSS files are injected at the same runtime moments as before, not
moved ahead of the main cascade.

All include paths are relative to the repository root, **not** the current file.

```js
/* @include "src/game/physics/movement.js" */
```

An include on its own line replaces that entire line, including its newline.
An inline include replaces only the marker. Each referenced fragment retains
its own original whitespace. The builder adds no separators, wrappers, banners,
semicolons, timestamps or source-map comments to the standalone output.

Three build-time expressions keep large resources out of JavaScript source:

```js
__GUM_DATA_URI__("assets/images/campaign/01-gum-works.webp")
__GUM_BASE64__("assets/audio/hd/everyday.mp3")
__GUM_JSON__("src/audio/hd/segments.json")
```

They are expanded during the build; they are not runtime APIs. JSON expansion
removes only whitespace outside strings, preserving numeric lexemes (`0.0`)
and Unicode/escaping. Images and audio are base64-encoded from the exact raw
bytes without transcoding. Paths, unknown assets and include cycles are checked.

The source fragments are not standalone ES modules. Check syntax on the
assembled runtime with `npm test`, not by executing a fragment on its own.
Opening `web/index.template.html` directly skips the builder and will not work.

## Two delivery targets, one game

**Standalone** reassembles the entire document, including all resources. At this
commit its SHA-256 equals the original 6.1 release. It requires no server.

**Web** externalizes the initial CSS, the runtime JS and all 24 assets. It does
not move dynamically installed menu styles into an earlier stylesheet. The
only code adapter replaces the HD loader's base64-to-bytes expression with an
HTTP fetch-to-bytes expression. The existing `decodeAudioData`, buffer cache,
error handling, musical timing and selection logic follow unchanged. Failed
HD loading retains the game's existing fallback.

`tests/build.test.mjs` reverses the known asset substitutions and this exact
transport adapter, then compares the runtime with the standalone script. If
the HD loader changes, the build fails with an explicit adapter-review error
rather than silently altering unrelated code.

## Where to edit

| Work | Files |
| --- | --- |
| Momentum, jump, loop/tube mechanics | `src/game/physics/movement.js`, `geometry.js` |
| Character drawing and deformations | `src/rendering/gum.js`, `player.js` |
| Hand-authored campaign geometry | `src/game/campaign/generator.js` |
| World names, mechanics, flavor descriptions and lore | `src/game/campaign/worlds.js`, `src/game/data/` |
| Boss timings and attacks | `src/game/bosses/combat.js`, `catalog.js` |
| Boss appearance | `src/rendering/bosses.js` |
| Endless piece selection and recipes | `src/game/endless/generator.js`, `modules.js`, `catalog.js` |
| Endless bounded memory and rebasing | `src/game/endless/recycling.js` |
| HD crossfades and buffer handling | `src/audio/hd/engine.js`, `scheduler.js` |
| Risk prediction and Epic bursts | `src/audio/director/danger.js`, `events.js`, `transitions.js` |
| World musical accompaniment | `src/audio/ambient/world-patterns.js`, `scheduler.js` |
| Original chiptune | `src/audio/classic/` |
| Audio cuts, beats and harmonic metadata | `assets/audio/hd/`, `src/audio/hd/segments.json` |
| Title / modes / options / museum | `src/ui/menus/` |
| Title fullscreen and audio unlock | `src/ui/title-controls.js` |
| HD and ambient controls | `src/ui/audio/` |
| English translations | `src/i18n/en.json` |
| Display localization and browser-language selection | `src/i18n/localization.js` |
| Layout | `src/styles/`, including the two runtime menu styles |
| Campaign storage | `src/core/save.js` plus the preserved integration wrappers |
| Endless records | `src/game/endless/records.js` |

The Spanish display strings remain in their original code/templates; the
English catalog maps those strings. There is no new ID-based localization
system in this patch. UI and mode identifiers, localStorage keys and record
formats are unchanged.

The original `window.__gumTest` hooks are preserved under `src/debug/`, including
existing test overrides. Moving/renaming them or hiding legacy UI functions
would be a separate change, not a harmless part of this extraction.

## Deliberate limits

This is a maintainability and source-control step, not a claim that the game is
now fully decoupled. Shared state, original compact formatting and integration
layers remain. They have named homes instead of living in one large HTML.

Avoid a formatting pass, scope rewrite, dead-code cleanup or engine migration
in the same commit. Those can be validated as later independent changes. Keep
`tests/fixtures/baseline-v6.1.json` as the immutable shipped-product fingerprint;
use a new fixture for a later intentional release.

No full original MP3 uploads are included: only the four production cuts
embedded in 6.1. No generated builds are committed. No GitHub permissions,
credentials, publishing commands, telemetry or runtime dependencies are added.
