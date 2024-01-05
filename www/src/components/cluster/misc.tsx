import { cloneElement } from 'react'
import { Button, IconFrame } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

export function CollapsibleButton({ label, icon: i, onClick }) {
  const theme = useTheme()
  const icon = cloneElement(i, { width: 16 })
  const minMediaQuery = `@media (min-width: ${theme.breakpoints.desktopSmall}px)`
  const maxMediaQuery = `@media (max-width: ${
    theme.breakpoints.desktopSmall - 1
  }px)`

  return (
    <>
      <Button
        secondary
        startIcon={icon}
        onClick={onClick}
        css={{
          '&&': {
            [maxMediaQuery]: {
              display: 'none',
            },
          },
        }}
      >
        {label}
      </Button>
      <IconFrame
        clickable
        icon={icon}
        size="large"
        type="secondary"
        onClick={onClick}
        textValue={label}
        tooltip
        css={{
          '&&': {
            minWidth: 40,
            [minMediaQuery]: {
              display: 'none',
            },
          },
        }}
      />
    </>
  )
}
