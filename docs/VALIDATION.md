# Validation of the source extraction

## Exact preservation

The original `gumflow_v6_1_ambient.html` is 11,224,996 bytes. Reassembling this
checkout produces this exact fingerprint:

```text
611f9687f455360eb0f97e9e46f76f93446aea14d94ed24ade3b38f1254bb6f5
```

The 24 extracted WebP/MP3 resources were decoded from their original base64 and
verified individually. None were resized, re-encoded, normalized or recut.
The hash manifest is in `tests/fixtures/baseline-v6.1.json`.

The identical standalone bytes imply that this commit introduces no change to
the original runtime, physics, music timing, rendering, text or game state
formats. They do **not** imply that all pre-existing bugs have been fixed.

## Build tests actually executed

`npm test`: **10/10 passed** using Node.js 22.16.0.

Checks cover byte identity, deterministic assembly, syntax of both runtime
targets, exact assets, JSON lexical preservation, include/path validation,
existing localization/musical metadata, the web transport adapter, and the ZIP
writer's byte determinism and CRCs.

`npm run build:release`: both generated ZIPs opened successfully in Python's
standard `zipfile` reader. CRC validation found no corrupt entries. The
self-contained ZIP contains exactly one `index.html`; its SHA-256 is the same
as above. The external web ZIP contains 27 files (HTML, JS, CSS, 24 assets).

## Browser tests actually executed

`tests/browser_smoke.py` ran four combinations in headless Chromium:
standalone / web, each with `es-ES` / `en-US`.

All combinations successfully:

- initialized the 6.1 title and selected the expected browser language;
- navigated to seven Free Play cards with level and boss actions;
- entered and advanced each of the seven worlds and entered seven boss arenas;
- started both Endless variants and recorded completed trial-run statistics;
- switched language manually and back to automatic;
- decoded all four HD cuts, started Everyday and switched to/from classic audio.

The deterministic movement snapshots from the two targets matched in both
languages. No JavaScript page errors or missing requested assets occurred.
These were entry/smoke tests, not a full natural-input playthrough of every
level or boss.

The browser environment disallows ordinary page navigation, so the test harness
uses `set_content` and local Playwright request fulfillment, not external
networking. It also freezes requestAnimationFrame, seeds Math.random, fixes
Date.now and supplies a Map-backed localStorage fixture for deterministic
comparison. Those are test-only changes and are not written into the builds.
Persistent storage on a real site, native fullscreen, a physical phone and an
actual itch.io upload have **not** been certified by these tests.

## Git patch

The patch is generated against a local reference tree whose README and LICENSE
blob hashes match `dossijeo/gumflow` at
`8f8cb5ef607718d65a0f57a7ee0578b428d26c2f`. The upstream history is not rewritten.
The LICENSE blob remains `f288702d2fa16d3cdf0035b15a9fcbc552cd88e7`.

The delivery process checks `git apply --check`, applies the complete binary
patch to a clean copy of that reference tree, rebuilds from the patched copy,
and verifies the standalone fingerprint again. Nothing is pushed remotely.
