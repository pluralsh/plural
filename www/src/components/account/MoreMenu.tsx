import { Button, MoreIcon, Select } from '@pluralsh/design-system'
import { useState } from 'react'

export function MoreMenu({
  children,
  onSelectionChange,
  disabled = false,
  primary = false,
  secondary = false,
  tertiary = false,
  floating = false,
  buttonProps,
  ...props
}: any) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Select
      isOpen={isOpen}
      label="Pick something"
      placement="right"
      width="max-content"
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      onSelectionChange={(selectedKey) => {
        setIsOpen(false)
        onSelectionChange(selectedKey)
      }}
      selectedKey={null}
      triggerButton={
        <Button
          disabled={disabled}
          primary={primary}
          secondary={secondary}
          tertiary={tertiary || !(primary || secondary || floating)}
          floating={floating}
          small
          paddingHorizontal="xsmall"
          {...buttonProps}
        >
          <MoreIcon color={disabled ? 'icon-disabled' : undefined} />
        </Button>
      }
      {...props}
    >
      {children}
    </Select>
  )
}
