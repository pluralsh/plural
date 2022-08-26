import { Drop } from 'grommet'
import { Menu, MoreIcon } from 'pluralsh-design-system'
import { useRef, useState } from 'react'

import { Icon } from '../profile/Icon'

export function MoreMenu({ children }) {
  const ref = useRef()
  const [open, setOpen] = useState(false)

  return (
    <>
      <Icon
        ref={ref}
        textValue="More"
        clickable
        size="medium"
        icon={<MoreIcon />}
        onClick={() => setOpen(true)}
      />
      {open && (
        <Drop
          target={ref.current}
          align={{ top: 'bottom' }}
          onClickOutside={() => setOpen(false)}
        >
          <Menu>
            {children}
          </Menu>
        </Drop>
      )}
    </>
  )
}
