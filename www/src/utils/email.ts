const emailRegex = /^[^@]+@([^@.]+\.)+[^@.]+$/

export function isValidEmail(url: string): boolean {
  return emailRegex.test(url)
}
