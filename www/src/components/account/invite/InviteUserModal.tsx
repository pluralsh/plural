import { Modal } from '@pluralsh/design-system'
import { Dispatch, ReactElement, useMemo, useState } from 'react'
import styled from 'styled-components'

import CreateGroup from './CreateGroup'
import InviteUser from './InviteUser'

enum View {
  InviteUser,
  CreateGroup,
}

const InviteUserModal = styled(InviteUserModalUnstyled)((_) => ({}))

function InviteUserModalUnstyled({
  onInvite,
  onClose,
  ...props
}): ReactElement {
  const [view, setView] = useState(View.InviteUser)
  const [refetch, setRefetch] = useState<Dispatch<void>>()
  const header = useMemo(() => {
    switch (view) {
      case View.CreateGroup:
        return 'create group'
      case View.InviteUser:
      default:
        return 'invite user'
    }
  }, [view])

  return (
    <Modal
      open
      onClose={onClose}
      style={{ padding: 0 }}
      size="large"
      header={header}
    >
      <div {...props}>
        {view === View.InviteUser && (
          <InviteUser
            onGroupCreate={() => setView(View.CreateGroup)}
            onInvite={onInvite}
            onCancel={onClose}
            refetch={setRefetch}
          />
        )}
        {view === View.CreateGroup && (
          <CreateGroup
            onBack={() => setView(View.InviteUser)}
            onCreate={refetch}
          />
        )}
      </div>
    </Modal>
  )
}

export default InviteUserModal
