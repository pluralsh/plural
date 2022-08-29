import { MoreIcon, Select } from 'pluralsh-design-system'
import { useState } from 'react'

import { IconFrame } from '../utils/IconFrame'

export function MoreMenu({ children, onSelectionChange, ...props }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Select
      isOpen={isOpen}
      label="Pick something"
      placement="right"
      width={200}
      onOpenChange={isOpen => setIsOpen(isOpen)}
      onSelectionChange={selectedKey => {
        setIsOpen(false)
        onSelectionChange(selectedKey)
      }}
      selectedKey={null}
      triggerButton={(
        <IconFrame
          textValue="Menu"
          clickable
          size="medium"
          icon={<MoreIcon />}
        />
      )}
      {...props}
    >
      {children}
    </Select>
  )
}
