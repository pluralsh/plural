import { Modal } from '@pluralsh/design-system'
import { ReactElement, useMemo, useState } from 'react'

import CreateGroup from '../../account/invite/CreateGroup'

import DeleteUser from './DeleteUser'
import { UserSettingsModalProps } from './types'
import UserSettings from './UserSettings'

enum View {
  UserSettings,
  DeleteUser,
  CreateGroup,
}

function UserSettingsModal({
  user,
  update,
  onClose,
}: UserSettingsModalProps): ReactElement {
  const [view, setView] = useState(View.UserSettings)

  const header = useMemo(() => {
    switch (view) {
      case View.UserSettings:
        return 'user settings'
      case View.CreateGroup:
        return 'create group'
      case View.DeleteUser:
        return 'confirm deletion'
    }
  }, [view])

  return (
    <Modal
      size="large"
      open
      portal
      style={{ padding: 0 }}
      header={header}
      onClose={onClose}
    >
      {view === View.UserSettings && (
        <UserSettings
          user={user}
          onCancel={onClose}
          onDelete={() => setView(View.DeleteUser)}
          onUpdate={onClose}
        />
      )}
      {view === View.DeleteUser && (
        <DeleteUser
          onBack={() => setView(View.UserSettings)}
          onDelete={onClose}
          user={user}
          update={update}
        />
      )}
      {view === View.CreateGroup && <CreateGroup />}
    </Modal>
  )
}

export default UserSettingsModal
