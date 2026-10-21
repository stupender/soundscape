# MAINTENANCE.md — run, build, deploy

## Run it on the Mac

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173/soundscape/. The mic works on `localhost`.

## Try it on a phone

Browsers only allow the mic on **https** (or localhost). A phone on your Wi-Fi
opening `http://192.168.x.x:5173` will play the soundscape, but the mic will
be refused. Two ways round it:

1. **Deploy** (below) and open the GitHub Pages address on the phone. Simplest.
2. Run the dev server over https (`npm i -D @vitejs/plugin-basic-ssl` and add
   it to `vite.config.ts`), then accept the certificate warning on the phone.

## Build

```bash
npm run build
```

This type-checks (`tsc -b`) and writes the site to `dist/`.

## Deploy to GitHub Pages

```bash
npm run deploy
```

This builds, then pushes `dist/` to the `gh-pages` branch, which GitHub
Pages serves. GitHub Pages on a **private** repo needs a paid GitHub plan; a
public repo is free.

`base: './'` in `vite.config.ts` makes every link relative, so the same build
works at `https://stupender.github.io/soundscape/` and at the custom domain.

## The address: soundscapes.beingsound.studio

Two halves, both needed:

1. **DNS** (at the domain's DNS host, Google Domains → now Squarespace
   Domains, where beingsound.studio's records live): a **CNAME** record,
   host `soundscapes`, pointing to `stupender.github.io.`
2. **GitHub:** `public/CNAME` contains `soundscapes.beingsound.studio`, so
   every deploy carries it, and the repo's Pages settings show the domain
   with **Enforce HTTPS** ticked (GitHub issues the certificate itself, a few
   minutes after the DNS record resolves).

Once the domain is set, `stupender.github.io/soundscape/` redirects to it.
Set up and live since 2026-10-21 (the CNAME record is in Squarespace Domains).

## The 12-keys audio

`public/audio/keys/` holds 3-minute excerpts (from 5:00 in) of each key,
160 kbps MP3, made from the masters with:

```bash
ffmpeg -ss 300 -t 180 -i "Soundscape in C.wav" -ac 2 -ar 44100 -b:a 160k soundscape-C.mp3
```

Masters: `Song Catalog/4 Projects/Walking Distance Residency/Soundscape In 12 Keys`.

## The field recordings

`public/audio/field/` holds excerpts of Stu's field recordings, each a few
minutes long, 160 kbps MP3, levelled to **−18 LUFS** (integrated) so they sit
together at the same slider position, with a limiter at −1 dBFS. The app loops
them with a crossfade.

| File | Source (Sound Collection/Field Recordings) | Excerpt |
|---|---|---|
| `birds-pennsylvania.mp3` | Favorites/PA Morning Birds 2.wav | 0:02, 89 s, plus a 100 Hz high-pass (the original is mostly low rumble) |
| `crickets-virginia.mp3` | 2026/Serenity Ridge, April 2026/04-18-26 Evening Crickets.wav | 35:50, 240 s (the steadiest stretch at the evening's usual level; minute 30 has a loud steady noise) |
| `ocean-monterey.mp3` | 2023/Carmel & Big Sur (Sep 2023)/Carmel, Pacific Ocean (Aug 31, 2023).wav | 0:15, 260 s |
| `waterfall-virginia.mp3` | 2026/Serenity Ridge, April 2026/04-17-26 Stone Waterfall at Creek.wav | 0:08, 235 s |
| `thunderstorm-illinois.mp3` | 2021/Illinois Thunderstorm (2021)/Illinois Thunderstorm (Memo Version).m4a | 1:00, 240 s (sits at −20 LUFS after limiting thunder; its layer gain is 1.25 to match) |

The recipe, for one file: measure, then set the gain to land on −18 LUFS.

```bash
ffmpeg -ss 15 -t 260 -i "source.wav" -af ebur128 -f null -
```

```bash
ffmpeg -ss 15 -t 260 -i "source.wav" -af "volume=GAINdB,alimiter=limit=0.89:level=false" -ac 2 -ar 44100 -b:a 160k ocean-monterey.mp3
```

## Adding a layer

1. Put an excerpt in `public/audio/field/` (levelled as above) and use
   `fileSound('audio/field/name.mp3')`, **or** write a generator in
   `src/audio/` (see `drones.ts`).
2. Add an entry to `LAYERS` in `src/data/layers.ts`.
3. If it needs a new icon, add a drawing to `src/ui/Icons.tsx` and its id to
   `IconId`.
