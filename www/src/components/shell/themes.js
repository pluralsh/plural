import * as themes from 'xterm-theme'

const THEME_KEY = 'plural-shell-theme'

export const normalizedThemes = Object.entries(themes)
  .filter(([key]) => key !== 'default')
  .sort(([a], [b]) => a.localeCompare(b))
  .reduce((acc, [key, theme]) => ({ ...acc, [key.toLowerCase()]: theme }), {})
export const themeNames = Object.keys(normalizedThemes)

export const getTheme = () => localStorage.getItem(THEME_KEY)
export const setTheme = name => localStorage.setItem(THEME_KEY, name)
