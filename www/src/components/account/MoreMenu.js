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
        icon={<MoreIcon size={25} />}
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
