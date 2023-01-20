import { useEffect, useMemo, useState } from 'react'
import { Button, Modal } from '@pluralsh/design-system'
import { Flex, Span } from 'honorable'

import { DEFAULT_THEME_NAME, getTheme, setTheme } from './themes'
import { TerminalThemeContext } from './context'

function ReloadModal({ open, setOpen }) {
  return (
    <Modal
      open={open}
      size="large"
      style={{ padding: 0 }}
    >
      <Flex
        direction="column"
        gap="large"
      >
        <Span
          body2
          color="text-xlight"
        >Terminal theme
        </Span>
        <Span body2>
          The new terminal theme has been saved, but it requires a full page reload to apply.
          All unsaved changes and installer progress will be lost.
        </Span>
        <Span body2>Do you want to reload the page now?</Span>
        <Flex justify="space-between">
          <Button
            secondary
            onClick={() => setOpen(false)}
          >Cancel
          </Button>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </Flex>
      </Flex>
    </Modal>
  )
}

function TerminalThemeProvider({ children }: any) {
  const [terminalTheme, setTerminalTheme] = useState(getTheme() || DEFAULT_THEME_NAME)
  const [open, setOpen] = useState(false)
  const context = useMemo(() => ({ theme: terminalTheme, setTheme: setTerminalTheme }), [terminalTheme])

  // If the theme change, persist in localstorage
  useEffect(() => {
    const previousTerminalTheme = getTheme()

    if (previousTerminalTheme !== terminalTheme) {
      setTheme(terminalTheme)
      setOpen(true)
    }
  }, [terminalTheme])

  return (
    <>
      <ReloadModal
        open={open}
        setOpen={setOpen}
      />
      <TerminalThemeContext.Provider value={context}>
        {children}
      </TerminalThemeContext.Provider>
    </>
  )
}

export default TerminalThemeProvider
