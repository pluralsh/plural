function IsObjectEmpty(obj: Record<string, unknown>) {
  return !obj || Object.values(obj).every(val => !val)
}

export { IsObjectEmpty }
