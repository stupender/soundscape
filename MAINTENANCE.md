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

This builds, then pushes `dist/` to the `gh-pages` branch. In the repo's
**Settings › Pages**, set the source to the `gh-pages` branch once. The app
is then at `https://stupender.github.io/soundscape/`. GitHub Pages on a
**private** repo needs a paid GitHub plan; a public repo is free.

`base: '/soundscape/'` in `vite.config.ts` must match the repo name.

## The 12-keys audio

`public/audio/keys/` holds 3-minute excerpts (from 5:00 in) of each key,
160 kbps MP3, made from the masters with:

```bash
ffmpeg -ss 300 -t 180 -i "Soundscape in C.wav" -ac 2 -ar 44100 -b:a 160k soundscape-C.mp3
```

Masters: `Song Catalog/4 Projects/Walking Distance Residency/Soundscape In 12 Keys`.

## Adding a layer

1. Write a generator in `src/audio/` (copy one in `nature.ts`), **or** put an
   audio file in `public/audio/` and use `fileSound('audio/name.mp3')`.
2. Add an entry to `LAYERS` in `src/data/layers.ts`.
3. If it needs a new icon, add a drawing to `src/ui/Icons.tsx` and its id to
   `IconId`.
