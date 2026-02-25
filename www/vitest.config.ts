import { defineConfig } from 'vitest/config'

// https://vitest.dev/config/
export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['@pluralsh/design-system'],
      },
    },
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
  },
})
