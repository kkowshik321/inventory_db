import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite config: Tailwind is handled via PostCSS/Tailwind plugin, no special Vite package required
export default defineConfig({
  plugins: [react()],
  base: "/inventory_db/", //YourRepoName
})
