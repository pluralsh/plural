import { fileURLToPath } from 'node:url'

import plural from '@pluralsh/eslint-config-pluralsh'

export default plural({
  ignores: [
    'src/generated/**/*',
    'build/**/*',
    '.yarn/**/*',
    'node_modules/**/*',
  ],
  tsconfigRootDir: fileURLToPath(new URL('.', import.meta.url)),
})
