export function removeTypename<
  T extends Record<string, any> | undefined | null,
>(val: T) {
  if (!val) return val

  const { __typename, ...rest } = val

  return rest
}
