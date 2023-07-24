import { Switch } from 'honorable'
import { ReactElement, useEffect, useState } from 'react'
import styled from 'styled-components'

import { useUpdateUserMutation } from '../../../generated/graphql'
import { UserInfo } from '../../account/User'
import { GqlError } from '../../utils/Alert'
import GroupBindingsComboBox from '../../utils/combobox/GroupBindingsComboBox'

import { UserSettingsProps } from './types'
import UserSettingsActions from './UserSettingsActions'

const UserSettings = styled(UserSettingsUnstyled)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xlarge,

  '.user-container': {
    display: 'flex',
    justifyContent: 'space-between',
  },
}))

function UserSettingsUnstyled({
  onCancel,
  onDelete,
  onUpdate,
  user,
  ...props
}: UserSettingsProps): ReactElement {
  const [isAdmin, setAdmin] = useState(user?.roles?.admin)
  const [changed, setChanged] = useState(false)

  const [updateUser, { loading, error }] = useUpdateUserMutation({
    variables: { id: user.id, attributes: { roles: { admin: isAdmin } } },
    onCompleted: onUpdate,
  })

  useEffect(() => {
    setChanged(isAdmin !== user?.roles?.admin)
  }, [isAdmin, user?.roles?.admin])

  return (
    <div {...props}>
      {error && (
        <GqlError
          error={error}
          header="Failed to update user"
        />
      )}
      <div className="user-container">
        <div className="user-info">
          <UserInfo
            fill="horizontal"
            user={user}
          />
        </div>
        <Switch
          alignSelf="flex-start"
          padding={0}
          checked={isAdmin}
          onChange={({ target: { checked } }) => setAdmin(checked)}
        >
          Admin
        </Switch>
      </div>
      <GroupBindingsComboBox
        groups={[]}
        isDisabled
      />
      <UserSettingsActions
        onCancel={onCancel}
        onDelete={onDelete}
        onUpdate={updateUser}
        changed={changed}
        loading={loading}
      />
    </div>
  )
}

export default UserSettings
