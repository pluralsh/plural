import { useEffect, useMemo, useState } from 'react'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import { getTheme, setTheme } from './themes'

function TerminalThemeProvider({ children }) {
  const [terminalTheme, setTerminalTheme] = useState(getTheme() || 'dark_pastel')
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
