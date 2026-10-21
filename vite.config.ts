import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration.
// `base` is the URL path the built app is served from once deployed.
// GitHub Pages serves a project repo at https://stupender.github.io/soundscape/
// so every asset link in the built site is prefixed with "/soundscape/".
// In local dev Vite serves from "/", so `npm run dev` is unaffected.
// If the repo is ever renamed, change this string to match.
export default defineConfig({
  plugins: [react()],
  base: '/soundscape/',
  // `host: true` lets a phone on the same Wi-Fi open the dev server.
  // (The microphone still needs HTTPS or localhost — see MAINTENANCE.md.)
  server: { host: true },
})
