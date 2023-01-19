import { useEffect, useMemo, useState } from 'react'

import { DEFAULT_THEME_NAME, getTheme, setTheme } from './themes'
import { TerminalThemeContext } from './context'

function TerminalThemeProvider({ children }: any) {
  const [terminalTheme, setTerminalTheme] = useState(getTheme() || DEFAULT_THEME_NAME)
  const context = useMemo(() => ({ theme: terminalTheme, setTheme: setTerminalTheme }), [terminalTheme])

  // If the theme change, persist in localstorage
  useEffect(() => {
    const previousTerminalTheme = getTheme()

    if (previousTerminalTheme !== terminalTheme) {
      setTheme(terminalTheme)
      window.location.reload()
    }
  }, [terminalTheme])

  return (
    <TerminalThemeContext.Provider value={context}>
      {children}
    </TerminalThemeContext.Provider>
  )
}

export default TerminalThemeProvider
