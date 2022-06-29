import { Div, DropdownButton, ExtendTheme, Flex, MenuItem } from 'honorable'
import { useContext } from 'react'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import { normalizedThemes } from './themes'

const extendedHonorableTheme = {
  DropdownButton: {
    Root: [
      {
        width: 176,
      },
    ],
    Button: [
      {
        small: true,
        tertiary: true,
        borderRadius: 'medium',
        // backgroundColor: 'transparent',
      },
    ],
    Menu: [
      {
        top: 'calc(100% + 8px)',
        left: -(128 + 64 + 32),
        maxHeight: 256,
        overflowY: 'auto',
      },
    ],
  },
}

function TerminalThemeSelector() {
  const [terminalTheme, setTerminalTheme] = useContext(TerminalThemeContext)

  function handleThemeChange(event) {
    setTerminalTheme(event.target.value)
  }

  return (
    <ExtendTheme theme={extendedHonorableTheme}>
      <DropdownButton
        label="Change theme"
        onChange={handleThemeChange}
      >
        <Div>
          input here
        </Div>
        {Object.entries(normalizedThemes).map(([key, theme]) => (
          <MenuItem
            key={key}
            value={key}
          >
            <TerminalThemePreview
              theme={theme}
              marginRight="small"
            />
            {key}
          </MenuItem>
        ))}
      </DropdownButton>
    </ExtendTheme>
  )
}

function TerminalThemePreview({ theme, ...props }) {
  return (
    <Flex {...props}>
      {Object.entries(theme).map(([key, hex]) => (
        <Div
          key={key}
          width={10}
          height={10}
          backgroundColor={hex}
        />
      ))}
    </Flex>
  )
}

export default TerminalThemeSelector
