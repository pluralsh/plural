import * as themes from 'xterm-theme'

const THEME_KEY = 'saved-theme'

export const normalizedThemes = Object.entries(themes).reduce((acc, [key, theme]) => (
  {...acc, [key.toLowerCase()]: theme}
), {})

export const themeNames = Object.keys(normalizedThemes)

export const savedTheme = () => localStorage.getItem(THEME_KEY)
export const saveTheme = (name) => localStorage.setItem(THEME_KEY, name)