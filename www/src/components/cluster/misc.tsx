import { cloneElement } from 'react'
import { Button, IconFrame } from '@pluralsh/design-system'

export function CollapsibleButton({ label, icon: i, onClick }) {
  const icon = cloneElement(i, { width: 16 })

  return (
    <>
      <Button
        secondary
        startIcon={icon}
        onClick={onClick}
        display-desktopSmall-down="none"
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
        minWidth={40}
        display-desktopSmall-up="none"
      />
    </>
  )
}
