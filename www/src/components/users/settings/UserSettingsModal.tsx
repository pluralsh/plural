import { Modal } from '@pluralsh/design-system'
import { ReactElement, useMemo, useState } from 'react'

import { Group } from '../../../generated/graphql'
import { GroupBase } from '../../utils/combobox/types'
import CreateGroup from '../../utils/group/CreateGroup'
import DeleteUser from '../../utils/user/DeleteUser'

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
  const [bindings, setBindings] = useState<Array<GroupBase>>([])

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
          onCreateGroup={() => setView(View.CreateGroup)}
          bindings={bindings}
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
      {view === View.CreateGroup && (
        <CreateGroup
          onBack={() => setView(View.UserSettings)}
          onCreate={(group: Group) => {
            setBindings((bindings) => [...bindings, group])
          }}
        />
      )}
    </Modal>
  )
}

export default UserSettingsModal
