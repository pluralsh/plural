import { useContext, useState } from 'react'
import { Div, DropdownButton, ExtendTheme, Flex, Input, MenuItem } from 'honorable'
import Fuse from 'fuse.js'

import { MagnifyingGlassIcon } from 'pluralsh-design-system'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import { normalizedThemes, themeNames } from './themes'

const extendedHonorableTheme = {
  DropdownButton: {
    Root: [
      {
        width: 'auto',
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

const fuse = new Fuse(themeNames)

function TerminalThemeSelector() {
  const [, setTerminalTheme] = useContext(TerminalThemeContext)
  const [search, setSearch] = useState('')
  const results = fuse.search(search).map(x => x.item)
  const displayedThemes = results.length ? results : themeNames

  console.log('search', search)
  function handleThemeChange(event) {
    setTerminalTheme(event.target.value)
  }

  return (
    <ExtendTheme theme={extendedHonorableTheme}>
      <DropdownButton
        label="Change theme"
        onChange={handleThemeChange}
      >
        <Div
          paddingHorizontal="small"
          paddingVertical="xxsmall"
          marginTop={-8}
          marginBottom={2}
        >
          <Input
            small
            startIcon={(
              <MagnifyingGlassIcon />
            )}
            placeholder="Search themes"
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </Div>
        {displayedThemes.map(themeName => (
          <MenuItem
            key={themeName}
            value={themeName}
          >
            <TerminalThemePreview
              theme={normalizedThemes[themeName]}
              marginRight="small"
            />
            {themeName}
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
