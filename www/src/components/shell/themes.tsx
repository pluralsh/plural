import * as themes from 'xterm-theme'

export const DEFAULT_THEME_NAME = 'plural'
const THEME_KEY = 'plural-shell-theme'
const THEMES = [
  DEFAULT_THEME_NAME,
  'Argonaut',
  'Atom',
  'Blazer',
  'OneHalfLight',
]

const DEFAULT_THEME = {
  foreground: '#C5C9D3',
  background: '#0E1015',
  cursor: '#C5C9D3',

  black: '#0E1015',
  brightBlack: '#747B8B',

  red: '#F2788D',
  brightRed: '#F599A8',

  green: '#3CECAF',
  brightGreen: '#99F5D5',

  yellow: '#FFF48F',
  brightYellow: '#FFF9C2',

  blue: '#8FD6FF',
  brightBlue: '#C2E9FF',

  magenta: '#BE5EEB',
  brightMagenta: '#D596F4',

  cyan: '#7075F5',
  brightCyan: '#969AF8',

  white: '#C5C9D3',
  brightWhite: '#EBEFF0',
}

export const normalizedThemes = Object.entries({ ...themes, [DEFAULT_THEME_NAME]: DEFAULT_THEME })
  .filter(([key]) => key !== 'default')
  .filter(([key]) => THEMES.includes(key))
  .sort(([a], [b]) => a.localeCompare(b))
  .reduce((acc, [key, theme]) => ({ ...acc, [key.toLowerCase()]: theme }), {})
export const themeNames = Object.keys(normalizedThemes)

export const getTheme = () => {
  const themeName = localStorage.getItem(THEME_KEY) || DEFAULT_THEME_NAME
  const theme = normalizedThemes[themeName]

  if (theme) return themeName

  setTheme(DEFAULT_THEME_NAME)

  return DEFAULT_THEME_NAME
}
export const setTheme = name => localStorage.setItem(THEME_KEY, name)
