import { Button } from '@pluralsh/design-system'
import { ReactElement, useState } from 'react'

import CreateGroupModal from './CreateGroupModal'

function CreateGroupButton(): ReactElement {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        secondary
      >
        Create group
      </Button>
      {open && (
        <CreateGroupModal
          onClose={() => setOpen(false)}
          onCreate={() => setOpen(false)}
        />
      )}
    </>
  )
}

export default CreateGroupButton
