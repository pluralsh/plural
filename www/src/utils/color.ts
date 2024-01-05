import { normalizeColor } from 'grommet/utils'
import { useMemo } from 'react'

export const COLORS = [
  '#99DAFF',
  '#D596F4',
  '#99F5D5',
  '#9FA3F9',
  '#F599A8',

  '#C2E9FF',
  '#E7C3F9',
  '#C7FAE8',
  '#CFD1FC',
  '#FAC7D0',

  '#4DBEFF',
  '#B747EB',
  '#3CECAF',
  '#3CECAF',
  '#E95374',

  '#C2F0FF',
  '#D1C3F9',
  '#C8FAC7',
  '#CFECFC',
  '#FAEFC7',

  '#FAEFC7',
  '#AE95F4',
  '#95F593',
  '#9FD9F9',
  '#F5E093',
]

export const alpha = (hex, alph) =>
  `${hex}${Math.floor(alph * 255)
    .toString(16)
    .padStart(2, '0')}`

const coerce = (color) => (color < 255 ? (color < 1 ? 0 : color) : 255)

export function shadeColor(color, percent) {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const B = ((num >> 8) & 0x00ff) + amt
  const G = (num & 0x0000ff) + amt

  return `#${(0x1000000 + coerce(R) * 0x10000 + coerce(B) * 0x100 + coerce(G))
    .toString(16)
    .slice(1)}`
}

export function useColorMap(theme, colors = COLORS) {
  return useMemo(
    () => colors.map((c) => normalizeColor(c, theme)),
    [theme, colors]
  )
}
