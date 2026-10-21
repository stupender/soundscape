# Soundscape

**Sing over a living soundscape, and keep both tracks.**
A Being Sound Studio app.

Turn on a few layers (birds, evening crickets, ocean, river, rain, wind, a
shruti box, a tanpura, or Stu's own *Soundscape in 12 Keys*), put your
headphones on, and record your voice over them with whatever mic you have:
the phone's own, a laptop's, a USB mic, or an audio interface. The voice and
the soundscape are recorded as **two separate tracks**, so afterwards you can
balance them, tidy the voice, and export a mix as MP3 or WAV, or share it
straight to Google Drive, Files, AirDrop or Messages.

It runs in the browser on a phone, an iPad or a laptop. Takes stay on the
device; nothing is uploaded.

## What's in it

| | |
|---|---|
| **01 Soundscape** | Nine layers as tiles, each with its own level. Presets (Dawn, Dusk, Shore, Rain room, Practice). *Add your own*: any audio file from the device, looped with a crossfade. |
| **Sa** | One key for the whole room. The shruti box, the tanpura, the bell and the *Soundscape in 12 Keys* all follow it. |
| **Session** | A bell to open, the soundscape rising beneath it, three bells to close (from Becoming's session timer). 5, 10, 20 or 30 minutes. |
| **02 Voice** | Any mic, and on a two-input interface, Input 1 or 2. A level meter with a sweet spot, a trim with **Auto** (sing your loudest phrase for five seconds and the trim is set so it peaks around −10 dB), "hear yourself", and the browser's call processing switched **off** by default (it harms singing). The **space** picture shows where the soundscape sits and where your voice sits, so you can leave room for it. Record with the button or the space bar; the app asks about headphones first. |
| **Pads** *(built, hidden for now)* | After Uncle Terry's Max/MSP patch: ten pads laid out like a number pad. **Hold** an empty pad (or its number key) to record; **press** it again to hear it back. Shift + number erases. Pads play into the soundscape track. Turn on with `SHOW_PADS` in `src/App.tsx`. |
| **03 Takes** | Play back. Voice and Soundscape faders. **Auto-balance** (sets the voice to a healthy level and the soundscape a step under it). **Tidy voice** (an 80 Hz low-cut). **Export** the mix as MP3 or WAV, **Share…**, or download the two tracks separately. |
| **Tips** | Best practices for a phone, a laptop, an iPad, a USB mic or interface, the room, outdoors, and headphones. |

## Run it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5173/soundscape/. Run, build and deploy details are in
[MAINTENANCE.md](MAINTENANCE.md).

## Where it's going

V1 is the recorder. V2 bridges with Archive's Multi-Track: generative
soundscapes after Eno and Reich, a spectrograph after Bernie Krause, and on
toward immersive rooms. See [ROADMAP.md](ROADMAP.md).

## Credits

- Type: Ortica Linear, Ronzino and Necto Mono by [Collletttivo](https://www.collletttivo.it/typefaces) (SIL Open Font License; licences in `public/fonts/`).
- The *Soundscape in 12 Keys* excerpts are Stu Pender's (Walking Distance Residency). All rights reserved.
- The tanpura and bell voices come from the Raga Practice Library and Becoming.
- MP3 encoding: [@breezystack/lamejs](https://www.npmjs.com/package/@breezystack/lamejs) (LGPL).
