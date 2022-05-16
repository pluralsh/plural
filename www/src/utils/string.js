export const obfuscate = str => `${str.substring(0, 5)}${'*'.repeat(str.length - 5)}`

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}
