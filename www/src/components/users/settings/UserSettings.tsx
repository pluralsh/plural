import { Switch } from '@pluralsh/design-system'
import { ReactElement, useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import {
  Group,
  GroupConnection,
  useGroupsQuery,
  useUpdateUserMutation,
} from '../../../generated/graphql'
import { extendConnection } from '../../../utils/graphql'
import { UserInfo } from '../../account/User'
import { GqlError } from '../../utils/Alert'
import GroupBindingsComboBox from '../../utils/combobox/GroupBindingsComboBox'
import { toGroups } from '../../utils/combobox/helpers'
import { GroupBase } from '../../utils/combobox/types'

import { UserSettingsProps } from './types'
import UserSettingsActions from './UserSettingsActions'
import { Div } from 'honorable'

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
  onCreateGroup,
  onCancel,
  onDelete,
  onUpdate,
  user,
  bindings,
  ...props
}: UserSettingsProps): ReactElement {
  const [isAdmin, setAdmin] = useState(user?.roles?.admin)
  const [changed, setChanged] = useState(false)
  const [query, setQuery] = useState('')

  const preselected = useMemo(
    () => [...(bindings ?? []), ...((user.groups as Array<Group>) ?? [])],
    [bindings, user.groups]
  )

  const [groupBindings, setGroupBindings] =
    useState<Array<GroupBase>>(preselected)

  const diffBindings = useMemo(
    () =>
      groupBindings.filter((gb) => !user.groups?.find((g) => g!.id === gb.id)),
    [groupBindings, user.groups]
  )

  const {
    data: groupsQuery,
    fetchMore,
    refetch: refetchGroups,
  } = useGroupsQuery({
    variables: { q: query },
  })

  const [updateUser, { loading, error }] = useUpdateUserMutation({
    variables: {
      id: user.id,
      attributes: {
        roles: { admin: isAdmin },
        groupIds: groupBindings.map((gb) => gb.id),
      },
    },
    onCompleted: onUpdate,
  })

  const onCreate = useCallback(
    () => refetchGroups({ q: query }).then(onCreateGroup),
    [onCreateGroup, query, refetchGroups]
  )

  useEffect(() => {
    const changed =
      isAdmin !== user?.roles?.admin ||
      diffBindings?.length > 0 ||
      (user.groups?.length ?? 0) > groupBindings.length

    setChanged(changed)
  }, [diffBindings?.length, groupBindings.length, isAdmin, user])

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
        <Div alignSelf="flex-start">
          <Switch
            checked={!!isAdmin}
            onChange={(checked) => setAdmin(checked)}
          >
            Admin
          </Switch>
        </Div>
      </div>
      <GroupBindingsComboBox
        onViewMore={() =>
          fetchMore({
            variables: { cursor: groupsQuery?.groups?.pageInfo?.endCursor },
            updateQuery: (prev, { fetchMoreResult: { groups } }) =>
              extendConnection(prev, groups, 'groups'),
          })
        }
        onInputChange={setQuery}
        onCreate={onCreate}
        onSelect={(group) => setGroupBindings((groups) => [...groups, group])}
        onRemove={(group) =>
          setGroupBindings((groups) => groups.filter((g) => g.id !== group.id))
        }
        groups={toGroups(groupsQuery?.groups as GroupConnection)}
        preselected={preselected}
        hasMore={groupsQuery?.groups?.pageInfo.hasNextPage}
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
