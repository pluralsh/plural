import { useContext, useState } from 'react'
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
} from 'pluralsh-design-system'

import TerminalThemeContext from '../../../contexts/TerminalThemeContext'

import { normalizedThemes, themeNames } from './themes'

const fuse = new Fuse(themeNames, { threshold: 0.25 })

function TerminalThemeSelector() {
  const [, setTerminalTheme] = useContext(TerminalThemeContext)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const results = fuse.search(search).map(x => x.item)
  const displayedThemes = results.length ? results : themeNames

  return (
    <Select
      aria-label="theme-selector"
      placement="right"
      width="460px"
      onSelectionChange={t => setTerminalTheme(t as string)}
      onOpenChange={o => setOpen(o)}
      triggerButton={(
        <Button
          tertiary
          small
          startIcon={<SprayIcon />}
          endIcon={(
            <DropdownArrowIcon
              marginLeft="8px"
              size={12}
              style={open ? {
                transform: 'rotate(180deg)',
                transitionDuration: '.2s',
                transitionProperty: 'transform',
              } : {
                transform: 'rotate(0)',
                transitionDuration: '.2s',
                transitionProperty: 'transform',
              }}
            />
          )}
        >
          Change theme
        </Button>
      )}
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

function TerminalThemePreview({ theme, ...props }) {
  return (
    <Flex {...props}>
      {Object.entries(theme).map(([key, hex]) => (
        <div
          key={key}
          style={{
            width: 10,
            height: 10,
            backgroundColor: hex as string,
          }}
        />
      ))}
    </Flex>
  )
}

export default TerminalThemeSelector
