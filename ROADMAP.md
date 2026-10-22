# ROADMAP.md — where the vision lives

Everything here is deliberately **not** in V1. It's written down so the code
can stay small while the vision stays whole. Ordered loosely from "next" to
"long-term".

---

## V1.x — finishing the recorder

- ~~**Real field recordings.**~~ Done 2026-10-21: birds, crickets, ocean,
  river and thunderstorm are Stu's own; the synthesised sketches are gone.
  More to come (wind, fire, a temple, a forest at night…).
- **More of the 12 keys.** The app ships 3-minute excerpts (crossfade-looped)
  because the full 56-minute files are 134 MB each, over GitHub's 100 MB file
  limit. Options: host the full files elsewhere (Cloudflare R2, a Drive
  folder, the website's own hosting) and stream them, or pick longer excerpts.
- **Upload straight to Google Drive.** V1 shares through the device's share
  sheet, which already offers Drive on a phone. A direct "Save to Drive"
  button needs a Google Cloud project and OAuth client ID, then the Drive
  API's upload. Worth it once students use this together (a shared class
  folder).
- **Clean up, properly.** V1's Tidy is a low-cut. Next: a noise gate,
  de-noise learned from the first seconds of room tone (spectral subtraction),
  a gentle de-esser and compressor. Later, iZotope-class repair (de-reverb,
  de-click, voice isolation) through an ML model running on the device.
- **Trim a take** (start and end handles), and **rename** it.
- **A count-in** or "settle" breath before recording starts.
- **Pads, saved.** Keep pad recordings across reloads (IndexedDB, like takes),
  and let a pad loop instead of playing once.
- **Stu's own shruti box**, recorded in all 12 keys, to replace Alex Xander
  Jacobs's (in use for now, with permission, since 2026-10-21). Drop-in: same
  file names in `public/audio/shruti/`. (The synthesised tanpura was removed the same day: not good
  enough. A recorded one could come back as a `keyedSound` layer.)
- **Install it** as a home-screen app (a PWA manifest + service worker), and
  later wrap it with Capacitor for the App Store as Becoming does.
- **Latency check.** A one-tap loopback test (play a click, hear it back) to
  measure the round trip exactly on each device.

## V2 — the bridge with Archive

Combine Archive's Multi-Track (several "tape loops" layered, each with its
own region, speed, direction and level) with:

- **Steve Reich: phasing.** Two copies of the same loop at very slightly
  different speeds, drifting apart and back (*It's Gonna Rain*, *Piano Phase*).
- **Brian Eno: *Music for Airports*, *Discreet Music*.** Loops of different,
  unrelated lengths so they never line up the same way twice; tape delay with
  long feedback; a system that plays itself.
- **Bernie Krause: the spectrograph.** See the whole soundscape's
  spectrogram, select regions of time and frequency to keep or remove in each
  loop, and see where there's space left. *Did you leave room for the voice?*
  V1's "space" picture is the first step.
- **It has to be fun and effortless.** A generative system you can also play,
  between an instrument (FFOSSO) and a contemplative generator (Wavepaths,
  Endel).

Bridges between the apps:

- **Archive ↔ Becoming:** recordings archive ↔ projects.
- **Archive ↔ Soundscape:** generative multi-track soundscapes ↔ the
  embodied voice.
- All of them into **Being Sound: A Body of Inquiry**, the curriculum and
  teaching archive, alongside Fretboard Constellations and the Raga Practice
  Library.
- In step with the needs of Stu's faculty position at Silvia Nakkach's
  **Vox Mundi School of Music**, and tested through her school.
- A quieter, non-musician "client" presentation of the same material (as
  Wavepaths and Endel do), perhaps as the differentiator.
- **Ableton Sound Station → app:** bring the live rig's generative patches
  into the browser.

First client to propose this to: **Creative Living**. For now, the proof of
concept: sound environments that can stand on their own or be performed with.

## Toward immersive rooms

**Immersive Art Spaces for Soul Retrieval.**

- Rooms shaped by the **Five Elements** of the Tibetan Bön tradition, each
  with its own colour, shape, sound and aroma.
- Retrieving the elemental essences through guided group practice: yoga,
  meditation and seed-syllable practice from the Zen, Bön and Dhrupad
  traditions. Sound especially for the space after the **Tsalung** movements.
- As treatment rooms for bodywork such as shiatsu or acupuncture.
- Organic materials instead of screens and artificial light: the herbs and
  plants of Tibetan medicine, the materials of the element itself. Rooted in
  the biophysics of Dr. Jack Kruse.
- **Biofeedback** (Whoop, Oura, HeartMath, Muse) as a complement to
  intuitive, relational presence and deep listening: soundscapes that respond
  to the room, sounding *with* rather than at. This is where to ask for
  funding.

### References

- [k.odk](https://www.instagram.com/k_odk_/)
- [mur mur by oto](https://murmur.living)
- [FFOSSO](https://www.ffosso.com)
- [Kind of Studio](https://kindofstudio.co/lab): custom hardware and software
- [Teenage Engineering](https://teenage.engineering)
- [Emergence Magazine](https://emergencemagazine.org/about/)
- [Wavepaths](https://guide.wavepaths.com), [Endel](https://app.endel.io)
