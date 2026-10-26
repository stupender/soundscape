# CLAUDE.md — working on Soundscape

Read README.md first, then ROADMAP.md for where this is heading.

## Who it's for

- **Users:** singers and students (Stu's own, and Silvia Nakkach's Vox Mundi
  school), recording on whatever they have: mostly phones.
- **Maintainer:** Stu, a musician and a novice coder. He has to understand the
  code well enough to explain it, and later maintain it with a small local
  model. The same rules as his other apps (Archive, Method, Becoming, Raga
  Practice Library) apply:
  - Write boring, conventional code: React + TypeScript + Vite + plain Web
    Audio + plain CSS. No Tone.js, no state library, no CSS framework.
  - Keep files small (under ~300 lines). Start every file with a plain-English
    header saying what it's for.
  - No clever abstractions, and no exotic dependencies.
  - Log new concepts in LEARNED.md, one line each.

## The shape of it

```
src/data/     WHAT the app offers: keys, layers + presets, tips. Plain data.
src/audio/    HOW it sounds: the engine, looping recordings, the recorder, mixdown.
src/store/    WHAT it remembers: takes (IndexedDB), small prefs (localStorage).
src/ui/       WHAT you see: one component per panel.
public/       recorder-worklet.js, fonts, audio (keys/, shruti/, field/), images.
```

- **Adding a soundscape layer is adding an entry to `src/data/layers.ts`.** A
  layer's `make` is `fileSound('audio/field/x.mp3')` for a recording, or
  `keyedSound(...)` for one recording per key (the 12-keys soundscape, the
  shruti box). Nature layers are Stu's own
  field recordings, never synthesised; level new ones to −18 LUFS (MAINTENANCE.md).
- Every sound is a `Sound` (`audio/sound.ts`): an `out`, `stop()`, and
  optionally `retune()` for the key.
- The engine's signal flow is drawn at the top of `audio/engine.ts`. Keep that
  diagram true when you change the wiring.

## Rules that protect the recordings

- **Two tracks, always.** The voice and the soundscape stay separate all the
  way into the saved take. Never mix them at record time.
- **The recorder is one worklet with two inputs** so the tracks are aligned to
  the sample. Don't split it into two recorders.
- **Call processing is off by default** (echo cancellation, noise suppression,
  auto-gain). They're for video calls and harm a singing voice.
- **Takes never leave the device** unless the person exports or shares one.
- **Credit every sound that isn't Stu's** on its card (the layer's `note`) and
  in the README, and only add one with the maker's permission: the repo and
  the site are public. The goal is all of Stu's own recordings.
- **Deleting a take takes two clicks.** No `window.confirm`.
- **No health or "brainwave" claims, ever.** Before writing any wording for
  breath, coherence, binaural beats or sleep, read "Claims the app must not
  make" at the end of RESEARCH.md and use its safe phrasing ("for relaxation
  and rest", not "reduces anxiety", "entrains your brain" or "healing
  frequencies"). No coherence or HRV score without a heart sensor.

## Look and feel

- The website's palette (`--ground`, `--ink`, `--accent` coral, plus the
  secondary tints) and its Collletttivo type. Tokens are in
  `src/styles/index.css`, defined for day and night. The app follows the
  device until the day/night switch (`ui/ThemeSwitch.tsx`) is pressed, then
  remembers the choice; `index.html` applies it before the first paint.
- An instrument, after Teenage Engineering and Kind of Studio: numbered
  panels, mono capitals for labels, LEDs for "on".
- Controls follow the Raga Practice Library's grammar (`.blk`, `.blk-line`,
  `Row` there): square corners, flat ink, no shadows or bevels; hover
  inverts; "on" = filled with ink. Buttons are spaced caps; selects are bare
  lines; lists are ruled rows; play is a ringed circle that fills with ink.
  Round only for real dots (LEDs, the record button, slider caps, play).
- The one glow allowed is light: a lit LED glows. Never add drop shadows.
- Record (panel 02) opens with two ruled rows, Input and Output, always visible.
- The app is in **Beta** (the tag beside the name in `Header.tsx`).
- The studio mark is the website's: the riso-blue ink disc with two orbs,
  orbiting while the soundscape sounds (`Header.tsx`, `.mark` in app.css).
- Layer tiles are the Raga Practice Library's cards: number and one fact
  over a rule, the name in bold caps, the mood, the picture rising from the
  bottom edge. Panel heads and take rows are numbered the same way.
- **Coral means sound happening**: recording, the sweet spot, your voice.
  Don't spend it on decoration.

## Checks

- `npx tsc -b` for types; `npm run build` for a full build.
- The mic needs https or localhost. The Claude browser pane blocks real mics;
  stub `getUserMedia` with an oscillator to test the record path there.
