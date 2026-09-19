# Asset inventory and provenance

All binary files in this patch are lossless extractions of resources already
embedded in the supplied GUMFLOW 6.1 HTML. The builder has no image or audio
processing dependencies: it only reads bytes and embeds/copies them.

## Pictures

- `images/campaign/`: seven generated painted world backgrounds.
- `images/endless/`: six generated transparent parallax layers.
- `images/thumbnails/`: seven existing captures of the assembled game scenes.

The original filenames are replaced with stable ASCII paths for portable builds.
File content, pixel dimensions, image compression and alpha channels are unchanged.
The 20 individual file sizes and hashes are listed in `config/assets.json`.

## Adaptive music

These are the four **edited production clips from 6.1**, not additional edits or
copies of the complete original MP3 uploads. The filenames below identify the
user-supplied source recordings. Cut ranges and intended loop durations come
from the existing HD metadata. Clips may contain the existing short transition
tails beyond the nominal loop duration; the scheduler metadata is unchanged.

| Runtime key | Original uploaded recording | Source range | Loop duration |
| --- | --- | --- | --- |
| everyday | Everyday Circuits in Motion.mp3 | 13.68–87.92 s | 74.24 s |
| epic | Epic Circuit Overture.mp3 | 17.47–92.74 s | 75.26 s |
| tension | Claustrophobic Circuits.mp3 | 43.34–119.52 s | 76.18 s |
| menu | Everyday Circuits in Motion.mp3 | 91.60–106.34 s | 14.74 s |

`src/audio/hd/segments.json` preserves all original beat/bar/entry/harmonic data,
not just the ranges above. `assets/audio/hd/claustrophobic.mp3` retains the
runtime key `tension`. `menu-interlude.mp3` retains the key `menu`.

Chiptune music, sound effects and the seven environmental layers are synthesized
by the source code; they do not require additional sample files.

## Existing license

The root LICENSE was already present in the repository and is not modified by
this patch. No new asset license or ownership statement is being added by the
extraction. In particular, the source recordings' relationship to the referenced
CR0 melody is not established by a binary extraction; this document only records
which existing materials were retained.
