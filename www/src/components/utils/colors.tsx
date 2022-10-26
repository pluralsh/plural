import {
  blue, green, red, yellow,
} from 'pluralsh-design-system/dist/theme/colors'
import { randomColor } from 'randomcolor'

const COLORS = [
  blue[500],
  green[500],
  yellow[500],
  red[500],
  '#6290C8',
  '#ED217C',
  '#297373',
  '#182825',
  '#F21B3F',
  '#137547',
]

export function generateColor(i = -1) {
  return i >= 0 && i < COLORS.length ? COLORS[i] : randomColor()
}
