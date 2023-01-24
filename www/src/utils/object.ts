function IsObjectEmpty<K extends keyof any = string | number, T = unknown>(obj: {[P in K]?: T} | undefined) {
  return !obj || Object.values(obj).some(val => !val)
}

export { IsObjectEmpty }
