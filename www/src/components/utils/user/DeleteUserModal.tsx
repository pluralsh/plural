import { Modal } from '@pluralsh/design-system'
import { ReactElement } from 'react'

import DeleteUser from './DeleteUser'

function DeleteUserModal({ user, update, onClose }): ReactElement {
  return (
    <Modal
      size="large"
      open
      style={{ padding: 0 }}
      header="confirm deletion"
      onClose={onClose}
    >
      <DeleteUser
        onDelete={onClose}
        user={user}
        update={update}
      />
    </Modal>
  )
}

export default DeleteUserModal
