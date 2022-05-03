// DEPRECATED
// In favor of plural-design-system/theme
import { normalizeColor } from 'grommet/utils'
import { css } from 'styled-components'

import { alpha, shadeColor } from './utils/color'

const boxStyle = css`
  outline: none;
`

export const PLURAL_THEME = {
  'plural-blk': '#000b11',
  'plrl-black': '#000b11',
  'tone-dark': '#01131a',
  'tone-dark-2': '#1a2b31',
  'tone-dark-3': '#2f3b41',
  'tone-medium': '#c9d1d3',
  'tone-light': '#edf1f2',
  'plrl-white': '#fff',
  'key-dark': '#001b8c',
  'key-light': '#0022b2',
  blue: '#0022b2',
  'blue-light': '#3351f2',
  'blue-light-2': '#e1ebff',
  'blue-dark': '#001b8c',
  'blue-dark-2': '#002068',
  'alt-dark': '#006e96',
  'alt-light': '#0090c4',
  'plrl-red': '#dd2c39',
  'red-dark': '#b52d31',
  'red-dark-2': '#7f0009',
  'red-light': '#ff2756',
  'red-light-2': '#ffd9df',
  'status-warning': 'orange',
  green: '#008e47',
  'green-dark': '#23422b',
  'green-dark-2': '#004422',
  'green-light': '#00ed76',
  'green-light-2': '#ccffe5',
  teal: '#00e5a3',
  'teal-dark': '#00b57d',
  'teal-dark-2': '#009362',
  'teal-light': '#00ffb0',
  'teal-light-2': '#ccffee',
  orange: '#ef9300',
  'orange-dark': '#e88900',
  'orange-dark-2': '#b76800',
  'orange-light': '#ff9d00',
  'orange-light-2': '#ffeacc',
  purple: '#960ea5',
  'purple-dark': '#830096',
  'purple-dark-2': '#650077',
  'purple-light': '#df00ff',
  'purple-light-2': '#f7ccff',
}

export const DEFAULT_COLOR_THEME = {
  brand: 'key-light',
  // action: '#007a5a',
  action: 'key-light',
  sidebar: 'plural-blk',
  card: '#222732',
  sidebarHover: shadeColor('#222732', 2),
  cardHover: shadeColor('#222732', -5),
  hover: { dark: 'cardHover', light: 'tone-light' },
  sidebarActive: 'tone-dark-3',
  focus: 'key-light',
  progress: '#007bff',
  tagMedium: 'key-light',
  tagLight: 'key-light',
  backgroundColor: 'sidebarBackground',
  sidebarBorder: alpha('#363840', 0.4),
  sidebarBackground: '#0d1215',
  orange: '#d7722c',
  presence: '#39E500',
  link: '#3366BB',
  notif: 'error',
  good: '#00ac46',
  low: 'orange-light',
  medium: 'orange',
  high: 'red-dark',
  critical: 'red-dark-2',
  label: 'light-2',
  'input-border': 'border',
  primary: '#0639FF',
  background: {
    light: 'white',
    dark: '#111525',
  },
  'background-light': {
    light: '#f5f7f9',
    dark: '#22293b',
  },
  text: {
    light: '#3b454e',
    dark: 'white',
  },
  'text-light': {
    light: 'lighten(text, 15)',
    dark: 'darken(text, 15)',
  },
  border: {
    light: '#CCCCCC',
    dark: '#303340',
  },
  shadow: {
    light: 'rgba(0, 0, 0, 0.2)',
    dark: 'rgba(64, 64, 64, 0.2)',
  },
  success: '#07E5A7',
  error: '#E03E43',
  warning: '#EF931D',
  secondary: '#222534',
  'background-middle': {
    light: '#EEEEEE',
    dark: '#222534',
  },
  'background-top': {
    light: 'white',
    dark: '#323643',
  },
  'text-strong': {
    light: '#000000',
    dark: 'white',
  },
  'text-weak': {
    light: '#444444',
    dark: '#CCCCCC',
  },
  'text-xweak': {
    light: '#666666',
    dark: '#999999',
  },
  'background-success': '#07E5A733',
  'background-warning': '#EF931D66',
  'background-error': '#E03E4366',
  'background-info': '#0190C266',
  'accent-blue': {
    dark: '#0190C2',
    light: '#0190C2',
  },
  'accent-purple': {
    dark: '#9510A1',
    light: '#9510A1',
  },
  'accent-green': {
    dark: '#058E4B',
    light: '#058E4B',
  },
  ...PLURAL_THEME,
}

export const DEFAULT_THEME = {
  anchor: {
    color: 'text',
    hover: {
      textDecoration: 'underline',
    },
    fontWeight: 400,
  },
  button: {
    padding: {
      horizontal: '6px',
      vertical: '2px',
    },
  },
  checkBox: {
    size: '20px',
    toggle: { radius: '20px', size: '40px' },
  },
  box: {
    extend: boxStyle,
  },
  tab: {
    // active: { color: 'focus' },
    // border: { active: { color: 'focus' }, hover: { color: 'border' } },
  },
  textArea: {
    extend: {
      fontWeight: 400,
    },
  },
  textInput: {
    extend: {
      fontWeight: 400,
    },
  },
  calendar: {
    day: {
      extend: {
        borderRadius: '5px',
        fontWeight: 'normal',
      },
    },
  },
  textField: { extend: { fontWeight: 400 } },
  select: {
    options: {
      text: { size: 'small' },
    },
  },
  drop: { border: { radius: '4px' } },
  layer: {
    background: 'background',
  },
  global: {
    colors: DEFAULT_COLOR_THEME,
    focus: { shadow: null, border: { color: 'brand' } },
    control: { border: { radius: '2px' } },
    drop: {
      background: 'background-top',
      border: { radius: '4px' },
      extend: css`
        box-shadow: 0px 0px 4px 4px rgba(0, 0, 0, 0.2);
      `,
    },
    box: { extend: boxStyle },
    checkBox: { toggle: { color: 'brand' } },
    elevation: {
      light: {
        medium: '0px 3px 8px rgba(100, 100, 100, 0.50)',
      },
      dark: {
        medium: `0px 6px 8px ${alpha('#363840', 0.4)}`,
      },
    },
    font: {
      family: 'Monument',
      size: '14px',
      height: '20px',
    },
  },
}
