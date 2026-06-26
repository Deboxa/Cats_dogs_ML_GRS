import {defineConfig} from 'vite'
import react, {reactCompilerPreset} from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 8000,
    host: '0.0.0.0',
    https: {
      cert: await Bun.file('./certs/fullchain.pem').text(),
      key: await Bun.file('./certs/server-key.pem').text()
    },
  },
  base: process.env.NODE_ENV === 'production' ? '/Cats_dogs_ML_GRS/' : '/',
  plugins: [
    react(),
    babel({presets: [reactCompilerPreset()]})
  ],
})
