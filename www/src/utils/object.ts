/**
 * Checks if any object key is empty.
 * @param obj
 * @returns {boolean} - returns true if any object key is empty, false otherwise.
 */
function IsObjectPartiallyEmpty<
  K extends keyof any = string | number,
  T = unknown,
>(obj: { [P in K]?: T } | undefined) {
  return !obj || Object.values(obj).some((val) => !val)
}

/**
 * Checks if all object keys are empty
 * @param obj
 * @returns {boolean} - returns true if all object keys are empty, false otherwise.
 */
function IsObjectEmpty<K extends keyof any = string | number, T = unknown>(
  obj: { [P in K]?: T } | undefined
) {
  return !obj || Object.values(obj).every((val) => !val)
}

export { IsObjectPartiallyEmpty, IsObjectEmpty }
