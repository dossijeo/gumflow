# GUMFLOW __VERSION__

The 6.1 game, with additive gamepad controls and Windows/Linux desktop packaging.

- Windows x64: NSIS installer. Unsigned; SmartScreen may warn. On machines
  without Microsoft WebView2, the installer downloads the Microsoft runtime.
- Linux x64: AppImage and Debian package. Built on Ubuntu 22.04; this is not a
  guarantee of compatibility with every Linux distribution. MP3/GStreamer
  support is included in the AppImage configuration.
- Web: standalone HTML, an itch.io ZIP and an external-file web ZIP.
- Gamepad: standard browser mapping, plus native gilrs fallback on Windows/Linux.
  A / Cross: jump and confirm; B / Circle: gum and back; X / Square or RB/RT:
  alternate gum; Start: pause; Y / Triangle: fullscreen.

Keyboard, touch controls, seven worlds, bosses, Endless Flow, HD/classic audio,
English/Spanish and original assets are retained. Saves are local to each
installation/origin; browser progress is not automatically copied to desktop.

Controller detection, actual hardware and the native audio/rendering must be
checked on the release candidates before publication. No self-updater is
configured. This release does not contain Android/iOS packages.

## Code signing

GUMFLOW is applying to the SignPath Foundation open-source code signing program.
If approved, official Windows releases will be signed through SignPath.
Current release assets must not be described as SignPath-signed until approval.

SHA256SUMS covers the downloadable files. The two lockfiles record the exact
npm/Cargo dependency resolution shared by this workflow's platform builds.

Maintainer: test the installers, both music modes, fullscreen, a physical
controller, save/reopen and Endless before clicking **Publish release**.
