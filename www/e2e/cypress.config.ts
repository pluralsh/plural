import webpack from '@cypress/webpack-preprocessor'
import { defineConfig } from 'cypress'

import { options } from './webpack.config'

export default defineConfig({
  fixturesFolder: false,
  video: true,
  videoUploadOnPasses: false,
  screenshotOnRunFailure: true,
  e2e: {
    baseUrl: 'https://localhost:3001',
    chromeWebSecurity: false,
    supportFile: 'cypress/support/index.ts',
    experimentalSessionAndOrigin: true,
    viewportWidth: 1920,
    viewportHeight: 1080,
    setupNodeEvents(on) {
      on('file:preprocessor', webpack(options))
    },
  },
})
