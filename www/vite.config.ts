import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import GlobalPolyFill from "@esbuild-plugins/node-globals-polyfill";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    react()
  ],
  server: {
    port: 3001,
    https: true,
  },
  build: {
    outDir: 'build',
    // sourcemap: true, // Seems to cause JavaScript heap out of memory errors on build
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: "globalThis",
      },
      plugins: [
        // @ts-expect-error
        GlobalPolyFill.default({
          process: true,
          buffer: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: "util",
    },
  },
})
