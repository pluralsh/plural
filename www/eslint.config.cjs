module.exports = {
  parserOptions: { project: './tsconfig.eslint.json' },
  extends: ['@pluralsh/eslint-config-typescript', 'prettier'],
  globals: { JSX: true },
  files: ['src/**/*'],
  rules: {
    '@typescript-eslint/consistent-type-exports': 'error',
    'import-newlines/enforce': 'off',
    'react/no-unknown-property': ['error', { ignore: ['css'] }], // Allows css prop for styled-components
  },
}
