const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']

export function formatBytes(value: number) {
  const exponent = Math.min(
    Math.max(Math.floor(Math.log10(Math.max(value, 1)) / 3), 0),
    BYTE_UNITS.length - 1
  )
  const scaled = value / 1000 ** exponent

  return `${scaled.toLocaleString('en-US', {
    maximumFractionDigits: scaled >= 100 || exponent === 0 ? 0 : 1,
  })} ${BYTE_UNITS[exponent]}`
}

export const formatQuantity = (value: number) =>
  value.toLocaleString('en-US', {
    notation: value >= 10_000 ? 'compact' : 'standard',
    maximumFractionDigits: value >= 100 ? 0 : 1,
  })
