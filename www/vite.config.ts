import { defineConfig, mergeConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tsconfigPaths from 'vite-tsconfig-paths'
import pluginRewriteAll from 'vite-plugin-rewrite-all'
import { VitePWA } from 'vite-plugin-pwa'

import vitestConfig from './vitest.config'

// https://vitejs.dev/config/
export default mergeConfig(
  vitestConfig,
  defineConfig({
    plugins: [
      basicSsl(),
      react({
        babel: {
          plugins: ['styled-components'],
          babelrc: false,
          configFile: false,
        },
      }),
      VitePWA({
        injectRegister: null,
        filename: 'service-worker.ts',
        srcDir: 'src',
        strategies: 'injectManifest',
        showMaximumFileSizeToCacheInBytesWarning: true,
      }),
      tsconfigPaths(),
      pluginRewriteAll(), // Fix 404 error for urls with dots in their path
    ],
    server: {
      port: 3001,
      https: true,
    },
    define: {
      'process.env': {}, // Needed otherwise production build will fail with Uncaught ReferenceError: process is not defined. See https://github.com/vitejs/vite/issues/1973
    },
    build: {
      outDir: 'build',
      sourcemap: process.env.NODE_ENV !== 'production', // Seems to cause JavaScript heap out of memory errors on build
    },
  })
)
