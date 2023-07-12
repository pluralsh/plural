import { Button } from '@pluralsh/design-system'
import { ReactElement, useState } from 'react'

import CreateClusterModal from './CreateClusterModal'

function CreateClusterButton(): ReactElement {
  const [createClusterModalOpen, setCreateClusterModalOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setCreateClusterModalOpen(true)}>
        Create cluster
      </Button>
      {createClusterModalOpen && (
        <CreateClusterModal
          open={createClusterModalOpen}
          onClose={() => setCreateClusterModalOpen(false)}
        />
      )}
    </>
  )
}

export default CreateClusterButton
