import { Modal } from '@pluralsh/design-system'
import { Dispatch, ReactElement, useMemo, useState } from 'react'
import styled from 'styled-components'

import CreateGroup from './CreateGroup'
import InviteUser from './InviteUser'

enum Action {
  InviteUser,
  CreateGroup,
}

const InviteUserModal = styled(InviteUserModalUnstyled)(({ theme }) => ({}))

function InviteUserModalUnstyled({
  onInvite,
  onClose,
  ...props
}): ReactElement {
  const [action, setAction] = useState(Action.InviteUser)
  const [refetch, setRefetch] = useState<Dispatch<void>>()
  const header = useMemo(() => {
    switch (action) {
      case Action.CreateGroup:
        return 'create group'
      case Action.InviteUser:
      default:
        return 'invite user'
    }
  }, [action])

  return (
    <Modal
      open
      onClose={onClose}
      style={{ padding: 0 }}
      size="large"
      header={header}
    >
      <div {...props}>
        {action === Action.InviteUser && (
          <InviteUser
            onGroupCreate={() => setAction(Action.CreateGroup)}
            onInvite={onInvite}
            onClose={onClose}
            refetch={setRefetch}
          />
        )}
        {action === Action.CreateGroup && (
          <CreateGroup
            onBack={() => setAction(Action.InviteUser)}
            onCreate={refetch}
          />
        )}
      </div>
    </Modal>
  )
}

export default InviteUserModal
