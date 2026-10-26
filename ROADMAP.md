# ROADMAP.md — where the vision lives

Everything past V1 is deliberately **not** built yet. It's written down so the
code can stay small while the vision stays whole. Stages run from "next" to
"horizon"; each stage has a short **why**, then the pieces. Research that
informs each stage is collected in [RESEARCH.md](RESEARCH.md) as it arrives.

---

## V1 — the two-track recorder ✓ (live, beta)

A soundscape plays in your headphones; any mic records your voice; the two
stay separate tracks to balance, tidy and share afterwards. Live at
soundscapes.beingsound.studio since 2026-10-21.

Built: field-recording, shruti-box and 12-keys layers with a shared Key;
editable presets; Input/Output rows, Auto level, the "space" spectrum;
headphones prompt; takes with faders, Auto-balance, Low cut, MP3/WAV export
and the share sheet; recording tips (phone, laptop, iPad, USB, room,
outdoors, the T-shirt pop filter); a session timer with bells; plays through
the iPhone's silent switch (2026-10-26). Terry's number pads are built and
hidden (`SHOW_PADS`).

### V1.x — finishing the recorder

- **More of the 12 keys.** The app ships 3-minute excerpts because the full
  56-minute files are 134 MB each, over GitHub's 100 MB file limit. Host the
  full files elsewhere (Cloudflare R2, the website's hosting) and stream them,
  or pick longer excerpts.
- **Stu's own shruti box**, recorded in all 12 keys, to replace Alex Xander
  Jacobs's (in use with permission since 2026-10-21). Drop-in: same file names
  in `public/audio/shruti/`. A recorded tanpura could come back the same way.
- **More field recordings:** wind, fire, a temple, a forest at night…
- **Upload straight to Google Drive** (a Google Cloud OAuth client + the
  Drive API). V1 already shares to Drive through the phone's share sheet.
- **Clean up, properly.** V1's Low cut is the start. Next: a noise gate,
  de-noise learned from room tone, a gentle de-esser and compressor. Later,
  iZotope-class repair (de-reverb, de-click, voice isolation) with an ML model
  on the device.
- **Trim and rename a take; a count-in or settling breath** before recording.
- **Install it:** a home-screen app (PWA), then Capacitor for the App Store as
  Becoming does. A native wrapper also brings true background audio (keeps
  playing with the screen locked) and lock-screen controls.
- **Latency check:** a one-tap loopback test to measure the round trip.

---

## V1.5 — modules and practices

**Why:** the panels (Soundscape, Record, Takes) are already self-contained.
Make each a **module** you can add, remove and combine, like instruments in a
rack, so the same app can be a recorder, a breathing companion, a sleep
soundscape or a teaching tool depending on which modules are in it.

- **The module rack.** Each module declares what it needs (the key, the
  soundscape bus, the mic, a clock) and what it offers. Presets become
  *rigs*: a set of modules plus their settings. Teenage Engineering's OP-1 and
  the modular-app instruments (Chassis, The Phono Loop) are the reference.
- **Breath module.** A pacer that guides the breath, visually and in sound:
  4 in → 8 out, 5 in → 10 out, or custom; the soundscape can swell and fall
  with it.
- **Cardiac coherence.** Slow, even breathing around six breaths a minute
  (the "365" practice: 3 times a day, 6 breaths a minute, 5 minutes), as a
  module of its own. Guy Desbiolles' teaching on cardiac coherence and the
  CyberSangha community to be studied and, where invited, integrated.
- **Binaural beats.** Two tones a few hertz apart, one per ear, under the
  soundscape; tuned to the Key. Needs headphones (the app already asks).
  What the evidence does and doesn't support goes in RESEARCH.md before any
  claim goes on screen.
- **Sleep.** A sleep timer that fades the soundscape out over a long arc
  (as Endel does), and a "stays on all night" mode.
- **Five Elements: rhythm and tempo.** Each element (earth, water, fire,
  air, space) as a set of qualities the soundscape can take on: density,
  tempo, register, brightness, movement. Possibly beat-matched pulses.
- **MIDI play-along** (Terry's pads, grown up): play a MIDI keyboard or pad
  controller along with the soundscape, in the Key, and record it as a third
  track. Web MIDI works in Chrome and Edge; Safari would need the native app.

---

## V2 — living soundscapes (the bridge with Archive)

**Why:** move from playing back recordings to a soundscape that composes
itself, gently, from your material, and that you can also play.

Combine Archive's Multi-Track (several tape loops, each with its own region,
speed, direction and level) with:

- **Steve Reich: phasing.** Two copies of a loop at very slightly different
  speeds, drifting apart and back (*It's Gonna Rain*, *Piano Phase*,
  *Clapping Music*).
- **Brian Eno: *Music for Airports*, *Discreet Music*.** Loops of different,
  unrelated lengths that never line up the same way twice; tape delay with
  long feedback; a system that plays itself. Eno and Peter Chilvers'
  generative apps (Bloom, Scape, Reflection, Trope, Air) as the bar.
- **Bernie Krause: the spectrograph.** See the whole soundscape's spectrogram;
  select regions of time and frequency to keep or remove in each loop; see
  where there's space left: *did you leave room for the voice?* (Krause's
  niche hypothesis: in a healthy habitat each creature sings in its own band.)
  V1's "space" picture is the first step.
- **The session arc.** Like Wavepaths (and Endel's bedtime timer): set a
  length and a shape, and the soundscape moves through it, from daytime
  birdsong to evening crickets, with fades that feel natural and seamless.
  Still generative, but guided: which recordings, how busy, what processing.
- **Clean-up** (from V1.x) available inside the loop editor.
- **It has to be fun and effortless.** Between an instrument (FFOSSO) and a
  contemplative generator (Wavepaths, Endel).
- **Ableton Sound Station → app:** bring the live rig's generative patches
  into the browser.

### Bridges between the apps

- **Archive ↔ Becoming:** the recordings archive ↔ projects.
- **Archive ↔ Soundscape:** generative multi-track soundscapes ↔ the
  embodied voice.
- All of them into **Being Sound: A Body of Inquiry**, the curriculum and
  teaching archive, alongside Fretboard Constellations and the Raga Practice
  Library.
- In step with Stu's faculty work at Silvia Nakkach's **Vox Mundi School of
  Music**, and tested through her school (and her *Free Your Voice*).

---

## V3 — for rooms and clients

**Why:** the same material, presented for people who aren't making music:
a yoga class, a bodywork or therapy session, a waiting room. Perhaps this is
the differentiator.

- **Client mode.** A calm, one-screen player: choose a session arc and a
  length, press play. As Wavepaths does for care providers.
- **Biofeedback that listens.** Soundscapes that respond to the room, to
  complement intuitive, relational presence and deep listening ("sounding
  with", not at): HeartMath (coherence), Muse (EEG), Oura and Whoop (sleep,
  HRV). Which of these can talk to a web or native app, and how, is a research
  question. This is where to ask for funding.
- **First client to propose to: Creative Living.** For now, the proof of
  concept: sound environments that can stand on their own or be performed
  with.

---

## Horizon — Immersive Art Spaces for Soul Retrieval

- Rooms shaped by the **Five Elements** of the Tibetan Bön tradition, each
  with its own colour, shape, sound and aroma.
- Retrieving the elemental essences through guided group practice: yoga,
  meditation and seed-syllable practice from the Zen, Bön and Dhrupad
  traditions; sound especially for the space after the **Tsalung** movements.
- As treatment rooms for bodywork such as shiatsu or acupuncture.
- Organic materials instead of screens and artificial light: the herbs and
  plants of Tibetan medicine, the materials of the element itself, rooted in
  the biophysics of Dr. Jack Kruse.
- Bio-feedback soundscapes that complement relational presence, deep
  listening, sounding with.
- Instead of focusing on recorded music, the work becomes immersive,
  experiential art, in both art and teaching. Build the installation pieces
  before the work comes in.

---

## References

**Generative and phase music**
- [Brian Eno & Peter Chilvers, Generative Music](https://www.generativemusic.com/index.html): [Reflection](https://www.generativemusic.com/reflection.html), [Bloom](https://www.generativemusic.com/bloom.html), [Trope](https://www.generativemusic.com/trope.html), [Scape](https://www.generativemusic.com/scape.html), [Air](https://www.generativemusic.com/air.html), [Quarta](https://www.generativemusic.com/quarta.html)
- [How Brian Eno created *Ambient 1: Music for Airports*](https://reverbmachine.com/blog/deconstructing-brian-eno-music-for-airports/) · [How Brian Eno created *Discreet Music*](https://reverbmachine.com/blog/deconstructing-brian-enos-discreet-music/)
- [New Again: Brian Eno](https://www.interviewmagazine.com/music/new-again-brian-eno) · [Brian Eno on *Discreet Music*](https://web.archive.org/web/20160324015145/http://blog.barbican.org.uk/2015/09/1317brian-eno-on-discreet-music/) · [Energy Fails the Magician](http://music.hyperreal.org/artists/brian_eno/interviews/melma80b.html#Discreet)
- [The Infinity Machine](https://dominiccordisco.substack.com/p/the-infinity-machine)
- [Steve Reich's *Clapping Music* app](https://www.factmag.com/2015/07/09/steve-reich-clapping-music-app-ios/) · [Third Coast Percussion: the music of Steve Reich](https://cdm.link/play-with-steve-reichs-techniques-in-a-free-iphone-app/)

**Soundscape ecology**
- [*The Great Animal Orchestra*, Bernie Krause](https://www.exploratorium.edu/TGAO) (Exploratorium exhibit), and the audiobook transcripts in `Archive/Ecology/Bernie Krause/`

**Instruments, apps and studios**
- [FFOSSO](https://www.ffosso.com) · [The Phono Loop](https://thephonoloop.com) · [Chassis by Lux Cache](https://luxcache.com/shop) · [k.odk's music apps](https://keiodak.github.io/privacy/links.html) ([Instagram](https://www.instagram.com/k_odk_/))
- [Teenage Engineering](https://teenage.engineering) · [Kind of Studio](https://kindofstudio.co/lab) · [mur mur by oto](https://murmur.living)
- [Wavepaths](https://wavepaths.com/music-for-care-providers) ([guide](https://guide.wavepaths.com)) · [Endel](https://app.endel.io)

**Body, breath and biofeedback**
- [Muse](https://choosemuse.com) · [Oura](https://ouraring.com) · [HeartMath](https://www.heartmath.com)

**Practice and lineage**
- [Maitri Space Awareness Project](https://windhorselegacyproject.org/legacy-project-archives/2022-maitri-video)
- Silvia Nakkach, *Free Your Voice* (`Archive/Creativity/Free Your Voice - Silvia Nakkach.epub`)
- [Emergence Magazine](https://emergencemagazine.org/about/)
