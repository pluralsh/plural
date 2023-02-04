export const obfuscate = str => `${str.substring(0, 5)}${'*'.repeat(str.length - 5)}`

export function isValidUrl(url) {
  return !/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(url)
}

export function isMinViableEmail(text) {
  return text.match(/^[^@]+@[^@]+\.[^@.]+$/)
}
