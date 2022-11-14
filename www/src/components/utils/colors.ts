import { normalizeColor } from 'grommet/utils'
// @ts-expect-error
import { randomColor } from 'randomcolor'
import { useMemo } from 'react'

// Colors used in graphs.
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

export function generateColor(i = -1) {
  return i >= 0 && i < COLORS.length ? COLORS[i] : randomColor()
}

export function useColorMap(theme, colors) {
  return useMemo(() => (colors || COLORS).map(c => normalizeColor(c, theme)), [theme, colors])
}
