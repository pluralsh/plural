/**
 * Checks if value is not equal to `null` or `undefined`
 * @param value
 * @returns boolean
 */
export function isNonNullable<TValue>(
  value: TValue
): value is NonNullable<TValue> {
  return value != null
}
