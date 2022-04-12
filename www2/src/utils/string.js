export const obfuscate = str => `${str.substring(0, 5)}${'*'.repeat(str.length - 5)}`
