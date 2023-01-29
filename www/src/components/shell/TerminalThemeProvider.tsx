import { useEffect, useMemo, useState } from 'react'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import { DEFAULT_THEME_NAME, getTheme, setTheme } from './themes'

function TerminalThemeProvider({ children }: any) {
  const [terminalTheme, setTerminalTheme] = useState(getTheme() || DEFAULT_THEME_NAME)
  const terminalThemeValue = useMemo(() => [terminalTheme, setTerminalTheme], [terminalTheme])

  // If the theme change, persist in localstorage
  useEffect(() => {
    const previousTerminalTheme = getTheme()

    if (previousTerminalTheme !== terminalTheme) {
      setTheme(terminalTheme)
      window.location.reload()
    }
  }, [terminalTheme])

  return (
    <TerminalThemeContext.Provider value={terminalThemeValue}>
      {children}
    </TerminalThemeContext.Provider>
  )
}

export default TerminalThemeProvider
