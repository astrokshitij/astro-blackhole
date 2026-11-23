# Home page: the light journey (v5, rows + pre-rendered 3D)

The owner rejected the full-screen live scene (v4): the 3D spread behind the
words and the hand-written renderer looked cheap. v5 follows his sketch:

```
| words + photo |    visual    |
|    visual     | words + photo|
| words + photo |    visual    |   ... six rows, then "Let's talk"
```

- Each row has two cells; the visual cell is wider (7/12 vs 5/12) and has an
  invisible, hard boundary: `overflow: hidden`, and the clip's own edges fade
  to black so it blends into the page with `mix-blend-mode: lighten`.
- On phones the cells stack: words, photo, then the visual. Nothing overlaps.
  This is measured in QA (copy rect vs visual rect per row).

## The light journey and how it maps to rows

| Row | Words + photo | Visual clip |
|---|---|---|
| 1 | Kshitij means horizon / Welcome to mine + portrait | Sunlight bounces off a mirror into the prism; the rainbow bursts out |
| 2 | Curious since class 2 + school exhibition | Camera follows the rainbow fanning toward the card |
| 3 | Then I picked one hard question + research poster | Spectrum lands on the card; green passes the pinhole and a lens |
| 4 | Ideas travel further when they’re shared + stage photo | Green light reaches two slits; waves spread and overlap |
| 5 | One claim at a time + writing photo | Detections arrive one by one on the screen |
| 6 | The bigger picture keeps growing + telescope | The pattern fills in, the probability curve draws, the camera pulls back over the whole bench |

The six clips are one continuous Blender shot cut at shared frames: each clip
ends exactly where the next begins. The opening clip plays once on arrival;
the others follow scroll (all-keyframe MP4s, so any frame is instant).

## Files

| File | Role |
|---|---|
| `lib/content.ts` → `LIGHT_JOURNEY` | All copy (house style: no full stops), photo crops (`focus`), captions (`label`) |
| `components/site/light-journey.tsx` | Rows, lazy loading, scroll scrubbing, reduced motion |
| `app/light-journey.css` | The grid and the invisible boundary |
| `lib/light-scene.ts` | Tested optics: prism pose, Snell refraction per colour, mirror, pinhole |
| `scripts/render/export-bench.mjs` | Writes `bench.json` (optics + 6000 sampled detections + curve) |
| `scripts/render/scene.py` | Blender scene and camera path; renders stills or clips |
| `scripts/render/render-all.sh` | Renders the six clips (CPU Cycles) |
| `scripts/render/encode.py` | Edge fade, MP4 encode, poster stills |
| `public/videos/journey/clip-*.mp4`, `public/images/light-journey/clip-*-{first,last}.jpg` | Output |

To re-render after changing the optics or the scene:

```
node scripts/render/export-bench.mjs
python3 -m venv bl && bl/bin/pip install bpy pillow
scripts/render/render-all.sh bl/bin/python /tmp/clips 800 700 20
python3 scripts/render/encode.py /tmp/clips .
```

## Physics, and what is deliberately not literal

- The prism floats, turned by half its minimum deviation, so green leaves
  level and the bench stays at one height. Sunlight reaches it via a flat
  mirror on the floor. Refraction is solved at both faces for 24 wavelengths;
  the colour spread is enlarged 7× so it is visible.
- A pinhole and a lens prepare the light for the slits (picking a colour alone
  does not make light coherent). Two vertical slits, vertical bands.
- Detector dots are sampled from the calculated two-slit distribution
  (530 nm, 35 µm slits 180 µm apart, 1 m, 36 mm field) including the
  single-slit envelope. The curve is the probability, drawn as a guide.
- Schematic: beam visibility (dust scattering), wave spacing on the sheet,
  sizes, and light being revealed along its path over time.

## Verification

See the latest commit message and `qa/light-journey/` for what was checked.
Renders are CPU Cycles at 800×700, 20 samples with denoising, 48 frames per
clip. Real-device (iPhone/Safari) checks of scroll scrubbing are still needed.

## History

v2–v4 (live WebGL scenes) are in git history; `docs/light-story-v2/` records
earlier studies. `components/ui/prism-hero.tsx` remains unmounted.
