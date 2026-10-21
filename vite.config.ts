import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration.
// `base: './'` makes every link in the built site RELATIVE, so the same
// files work wherever they're served: at soundscapes.beingsound.studio (the
// site's root) and at https://stupender.github.io/soundscape/ (a sub-folder).
// No need to change it if the repo or the domain is renamed.
export default defineConfig({
  plugins: [react()],
  base: './',
  // `host: true` lets a phone on the same Wi-Fi open the dev server.
  // (The microphone still needs HTTPS or localhost — see MAINTENANCE.md.)
  server: { host: true },
})
