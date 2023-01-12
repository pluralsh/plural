import { forwardRef, useContext } from 'react'
import { Button, Flex } from 'honorable'
import { ListBoxItem, Select, SprayIcon } from '@pluralsh/design-system'

import TerminalThemeContext from '../../../../contexts/TerminalThemeContext'
import { normalizedThemes, themeNames } from '../../themes'

const ThemeSelectButton = forwardRef<any, any>((props, ref) => (
  <Button
    ref={ref}
    secondary
    small
    width={32}
    height={32}
    {...props}
  >
    <SprayIcon alignSelf="center" />
  </Button>
))

function TerminalThemeSelector() {
  const [terminalTheme, setTerminalTheme] = useContext(TerminalThemeContext)

  return (
    <Select
      aria-label="theme-selector"
      placement="right"
      width="460px"
      selectedKey={terminalTheme}
      onSelectionChange={t => setTerminalTheme(t)}
      triggerButton={<ThemeSelectButton />}
    >
      {themeNames.map(t => (
        <ListBoxItem
          key={t}
          label={t}
          textValue={t}
          leftContent={(
            <TerminalThemePreview
              theme={normalizedThemes[t]}
              marginRight="small"
            />
          )}
        />
      ))}
    </Select>
  )
}

function TerminalThemePreview({ theme, ...props }: any) {
  return (
    <Flex {...props}>
      {Object.entries(theme).map(([key, hex]) => (
        <div
          key={key}
          style={{
            width: 10,
            height: 10,
            backgroundColor: hex as any,
          }}
        />
      ))}
    </Flex>
  )
}

export default TerminalThemeSelector
