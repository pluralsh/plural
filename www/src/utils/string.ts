export const obfuscate = str => `${str.substring(0, 5)}${'*'.repeat(str.length - 5)}`

export function isValidUrl(url) {
  return !/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/.test(url)
}

export function generateString(len: number): string {
  const dictionary = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const dictionaryLen = dictionary.length

  return new Array(len).join().split(',').map(_ => dictionary[Math.floor(Math.random() * dictionaryLen)])
    .join('')
}
