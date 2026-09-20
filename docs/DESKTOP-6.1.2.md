# Desktop packaging 6.1.2 — default music and audio-focused AppImage

This patch is based on `b9a88a31f9adaeccac1ec45e04961456b34ea779`.
It leaves the approved 6.1 game, soundtrack triggers, MP3 bytes, pictures,
physics, levels, save format, keyboard/touch and gamepad mappings unchanged.
The version in the installers is 6.1.2; the game's on-screen content version
remains 6.1. `npm run verify:core` still restores the exact original 6.1 HTML
when the explicitly marked platform additions are removed.

## Audio

Sound was already enabled in the fresh-profile defaults, but the title did not
attempt to initialize the audio engine. `src/platform/audio-startup.js` now starts
the existing engine after bootstrap, on pageshow, or when a hidden page returns.
The Windows WebView uses `--autoplay-policy=no-user-gesture-required` for this
application only. It does not alter Windows settings, disable web security or
change the navigation whitelist/CSP.

Saved `sound: false`, `musicOn: false`, and chosen volumes are preserved. Existing
users who deliberately muted the previous build must enable audio once through
the existing button or Options. No destructive migration or clearing of saves.
On a normal browser, autoplay remains subject to the browser policy; the
existing first-click/touch/key fallback remains available. No web workaround
claims to bypass the browser's user-gesture policy.

## AppImage

`bundleMediaFramework` remains **true**. Removing it simply to make a smaller
file can leave players without MP3 playback. Instead, the build stages only
modules needed for MP3, GIO streams and Web Audio, plus audio outputs. The
supported `GSTREAMER_PLUGINS_DIR` variable tells linuxdeploy which modules to
copy; linuxdeploy resolves their dependencies normally. The SDK is not modified.

`config/linux-audio-plugins.json` contains the explicit required list (18
plugins, with optional ALSA). A missing required decoder causes an error, not a
silent fallback to a release without music. Ubuntu CI installs ALSA, so its
profile normally contains 19 plugins. Video encoders, FFmpeg video/audio
collections, camera/streaming plugins and unrelated codecs are not selected.
WebKitGTK and JavaScriptCore remain bundled. This is not a promise of a 20 MB
fully portable AppImage.

`Build desktop packages` has a manual **linux_media_profile** input:

- `audio-only` (default): the focused payload.
- `full`: original multimedia deployment for compatibility comparisons.

The full setting is a manual test-build fallback. Tag-based Draft release uses
the default audio-only profile. No changes were made to which web ZIPs are
produced, signing, the Windows installer format or the DEB media dependencies.

## Actual Linux runtime test in Actions

After building, CI extracts the produced AppImage and runs **its real Tauri
executable** under Xvfb. A test-only LD_PRELOAD library reads the WebKit state
through the game's existing test hooks. Neither the probe nor a modified game
is included in a published artifact.

The test checks: a fresh profile plays title music without a click; all four
MP3 clips decode and produce nonzero PCM; all seven worlds move; all seven
arenas activate; both Endless modes start; the classic synthesizer works;
pause and resume work. It also checks the audio-only package does not contain
unexpected plugins. This is a smoke test, not a complete playthrough or a test
of physical speakers, GPU drivers or controllers.

A failure blocks uploading the normal release package and therefore the draft
release. `linux-runtime-tests` preserves the report and logs even on failure.
The Actions job summary lists actual **MB and MiB per final file**, separately
from the ZIP wrapping the Actions artifact.

## Local validation (20 September 2026)

The environment here was Debian 13 x64, without Rust, an audio device or a
physical controller. The original 6.1.1 AppImage could be extracted and run using
its bundled Ubuntu-built WebKit/GTK libraries and a virtual X11 display.
A real GLES library already installed with Chromium supplied a missing host
GLES soname; software rendering was used. The isolated root test container
required an explicit WebKit sandbox exception. **None of those host workarounds
is configured in the distributed application.**

An experimental AppDir was derived from the original artifact by retaining the
selected plugins and their ELF dependency closure. The executable was unchanged.
This is a measurement/proof-of-concept, not the production optimization script:
CI builds a fresh payload through linuxdeploy instead of deleting libraries
from a previously completed bundle.

Measured file bytes, excluding symbolic links:

| Measurement | Bytes |
|---|---:|
| Existing 6.1.1 AppImage download | 156,187,128 |
| Original extracted payload | 439,148,424 |
| Experimental reduced AppDir | 240,926,648 |

The experimental extracted payload is 45.1% smaller. These are **not** the
compressed bytes of a new 6.1.2 AppImage. No Rust toolchain / AppImage compression
utility was available here. The final download size must be measured by Actions.

The full and reduced runtimes both decoded all four original MP3 clips with
nonzero signal. For testing 6.1.2 startup locally, the already compiled Tauri
shell loaded the newly assembled standalone frontend via an explicitly marked
test-only HTML override. Its report records `frontendOverride: true`. CI does
**not** use that override: it checks the new executable's actual embedded files.
The local reduced-runtime test passed title autoplay, four tracks, seven worlds,
seven arenas, both Endless modes, classic audio and pause/resume.

The 38 Node tests pass. Chromium smoke tests pass for standalone/web in ES/EN,
plus synthetic gamepad tests and eight audio-startup/preference cases. The web
first-gesture case models autoplay denial explicitly because loading an HTML
fixture through browser automation can itself activate the document. The audio
decoder and AudioContext remain real in that test.

## Apply and build

From a clean main checkout:

```sh
git switch main
git pull --ff-only
git apply --check /storage/emulated/0/Download/gumflow-6.1.2-audio-linux.patch
git apply --index /storage/emulated/0/Download/gumflow-6.1.2-audio-linux.patch
git diff --cached --stat
git commit -m "Start default audio and reduce Linux multimedia payload"
git push origin main
```

Run **Actions → Build desktop packages → Run workflow → main → audio-only**.
There is no need to install Rust on the phone. Do not re-run the old commit.
Inspect `linux-runtime-tests` and the per-file size table before publishing.

After checking Windows again, create the new version tag:

```sh
git tag -a v6.1.2 -m "GUMFLOW 6.1.2 — default audio and focused Linux media"
git push origin v6.1.2
```

The existing Draft release workflow builds the new tag, runs the tests and
prepares a draft. Old releases are not overwritten. Signing remains unchanged;
being an installer does not in itself guarantee the absence of SmartScreen.

## Primary references

- https://v2.tauri.app/distribute/appimage/
- https://v2.tauri.app/reference/config/#additionalbrowserargs
- https://raw.githubusercontent.com/tauri-apps/linuxdeploy-plugin-gstreamer/master/linuxdeploy-plugin-gstreamer.sh
- https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay
- https://learn.microsoft.com/en-us/windows/apps/package-and-deploy/smartscreen-reputation
