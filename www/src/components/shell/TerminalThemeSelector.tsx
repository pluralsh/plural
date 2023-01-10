import { forwardRef, useContext, useState } from 'react'
import { Flex } from 'honorable'
import Fuse from 'fuse.js'

import {
  Button,
  DropdownArrowIcon,
  Input,
  ListBoxItem,
  MagnifyingGlassIcon,
  Select,
  SprayIcon,
} from '@pluralsh/design-system'

import styled from 'styled-components'

import TerminalThemeContext from '../../contexts/TerminalThemeContext'

import { normalizedThemes, themeNames } from './themes'

const fuse = new Fuse(themeNames, { threshold: 0.25 })

const ThemeSelectButton = styled(forwardRef((props, ref) => (
  <Button
    ref={ref}
    tertiary
    small
    startIcon={<SprayIcon />}
    endIcon={(
      <DropdownArrowIcon
        className="dropdownIcon"
        marginLeft="8px"
        size={12}
      />
    )}
    {...props}
  >
    Change theme
  </Button>
)))<{ isOpen?: boolean }>(({ isOpen = false }) => ({
  '.dropdownIcon': {
    transform: isOpen ? 'scaleY(-1)' : 'scaleY(1)',
    transition: 'transform 0.2s ease',
  },
}))

function TerminalThemeSelector() {
  const [, setTerminalTheme] = useContext(TerminalThemeContext)
  const [search, setSearch] = useState('')
  const results = fuse.search(search).map(x => x.item)
  const displayedThemes = results.length ? results : themeNames

  return (
    <Select
      aria-label="theme-selector"
      placement="right"
      width="460px"
      onSelectionChange={t => setTerminalTheme(t)}
      triggerButton={<ThemeSelectButton />}
      dropdownFooterFixed={(
        <Flex
          width="458px"
          height="30px"
        >
          <Input
            small
            position="absolute"
            width="460px"
            margin="-1px"
            borderTopLeftRadius={0}
            borderTopRightRadius={0}
            startIcon={<MagnifyingGlassIcon />}
            placeholder="Filter themes"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </Flex>
      )}
    >
      {displayedThemes.map(t => (
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
