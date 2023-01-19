function isAlphanumeric(value): boolean {
  return (/^[a-zA-Z0-9-]+$/.test(value))
}

export { isAlphanumeric }
