module.exports = {
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  extends: ['@pluralsh/eslint-config-typescript', 'prettier'],
  globals: {
    JSX: true,
  },
  rules: {
    '@typescript-eslint/consistent-type-exports': 'error',
    'import-newlines/enforce': 'off',
    // Allow css prop for styled-components
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
  },
}
