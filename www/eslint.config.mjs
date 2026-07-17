import plural from '@pluralsh/eslint-config-pluralsh'

export default plural({
  ignores: ['src/generated/**/*', 'build/**/*'],
  tsconfigRootDir: import.meta.dirname,
})
