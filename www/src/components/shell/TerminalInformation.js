import { useState } from 'react'
import { CircleInformation } from 'grommet-icons'

import { Button, Modal } from 'honorable'
import { ModalHeader } from 'pluralsh-design-system'

function TerminalInformation({ shell }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        small
        tertiary
        startIcon={(
          <CircleInformation />
        )}
        onClick={() => setOpen(true)}
      >
        Cloud shell info
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
      >
        <ModalHeader onClose={() => setOpen(false)}>
          Cloud shell info
        </ModalHeader>
        Foo
      </Modal>
    </>
  )
}

export default TerminalInformation
