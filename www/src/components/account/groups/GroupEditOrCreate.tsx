import {
  Button,
  Callout,
  Flex,
  ReturnIcon,
  Switch,
  ValidatedInput,
} from '@pluralsh/design-system'
import { useApolloClient, useFragment } from '@apollo/client'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  CreateGroupMemberDocument,
  CreateGroupMemberMutation,
  CreateGroupMemberMutationVariables,
  GroupAttributes,
  GroupFragment,
  GroupFragmentDoc,
  UserFragment,
  useCreateGroupMemberMutation,
  useCreateGroupMutation,
  useGroupsQuery,
  useUpdateGroupMutation,
} from '../../../generated/graphql'
import { useCurrentUser } from '../../../contexts/CurrentUserContext'
import { useUpdateState } from '../../../hooks/useUpdateState'
import { extendConnection, mapExistingNodes } from '../../../utils/graphql'
import { GqlError } from '../../utils/Alert'
import LoadingIndicator from '../../utils/LoadingIndicator'
import { SubpageHeader } from '../../utils/layout/SubpageLayout'
import { useCanEditGroups } from '../Groups'
import { BindingInput } from '../Typeaheads'

import { GroupMembers, PendingGroupMembers } from './GroupMembers'
import { groupPath } from './GroupsColumns'

const GROUPS_PATH = '/account/groups'

const BLANK_GROUP_ATTRIBUTES: GroupAttributes = {
  name: '',
  description: '',
  global: false,
}

type GroupEditLocationState = { failedUsers?: UserFragment[] }

const groupToAttrs = (group: GroupFragment): GroupAttributes => ({
  name: group.name,
  description: group.description || '',
  global: !!group.global,
})

export function GroupEdit() {
  const { groupId } = useParams()
  const editable = useCanEditGroups()
  const cached = useFragment({
    fragment: GroupFragmentDoc,
    from: { __typename: 'Group', id: groupId ?? '' },
  })
  // Falls back to paging through the groups list when the group isn't cached yet (e.g. a direct page load).
  const { data, loading, error, fetchMore } = useGroupsQuery({
    variables: { first: 100 },
    skip: cached.complete,
    notifyOnNetworkStatusChange: true,
  })
  const group = cached.complete
    ? (cached.data as GroupFragment)
    : mapExistingNodes(data?.groups).find(({ id }) => id === groupId)
  const pageInfo = data?.groups?.pageInfo
  const searching = !group && !!pageInfo?.hasNextPage

  useEffect(() => {
    if (!searching || loading) return

    fetchMore({
      variables: { after: pageInfo?.endCursor },
      updateQuery: (prev, { fetchMoreResult }) =>
        extendConnection(prev, fetchMoreResult.groups, 'groups'),
    })
  }, [searching, loading, fetchMore, pageInfo?.endCursor])

  if (!editable) return <Navigate to={GROUPS_PATH} />
  if (error) return <GqlError error={error} />
  if (!group) {
    return loading || !data || searching ? (
      <LoadingIndicator />
    ) : (
      <Navigate to={GROUPS_PATH} />
    )
  }

  return (
    <GroupEditOrCreate
      key={group.id}
      group={group}
    />
  )
}

export function GroupCreate() {
  const editable = useCanEditGroups()

  if (!editable) return <Navigate to={GROUPS_PATH} />

  return <GroupEditOrCreate />
}

function GroupEditOrCreate({ group }: { group?: GroupFragment }) {
  const navigate = useNavigate()
  const location = useLocation()
  const client = useApolloClient()
  const me = useCurrentUser()
  const isCreating = !group
  const initialState = useMemo(
    () => (group ? groupToAttrs(group) : BLANK_GROUP_ATTRIBUTES),
    [group]
  )
  const { state, update, hasUpdates } = useUpdateState(initialState)
  const { name, description, global } = state
  const [newGroupUsers, setNewGroupUsers] = useState<UserFragment[]>([])
  const [addingPendingMembers, setAddingPendingMembers] = useState(false)
  const [failedUsers, setFailedUsers] = useState<UserFragment[]>(
    () => (location.state as GroupEditLocationState)?.failedUsers ?? []
  )

  const [createGroup, { loading: createLoading, error: createError }] =
    useCreateGroupMutation({ refetchQueries: ['Groups'] })
  const [updateGroup, { loading: updateLoading, error: updateError }] =
    useUpdateGroupMutation({ refetchQueries: ['Groups'] })
  const [addGroupMember, { error: addMemberError }] =
    useCreateGroupMemberMutation({
      refetchQueries: ['GroupMembers', 'Groups'],
      awaitRefetchQueries: true,
    })

  const addMember = (user: UserFragment) => {
    if (group) {
      addGroupMember({
        variables: { groupId: group.id, userId: user.id },
      }).catch(() => {})
    } else if (!newGroupUsers.some((u) => u.id === user.id)) {
      setNewGroupUsers([...newGroupUsers, user])
    }
  }

  const addMembers = async (groupId: string, users: UserFragment[]) => {
    setAddingPendingMembers(true)
    const results = await Promise.allSettled(
      users.map((user) =>
        client.mutate<
          CreateGroupMemberMutation,
          CreateGroupMemberMutationVariables
        >({
          mutation: CreateGroupMemberDocument,
          variables: { groupId, userId: user.id },
        })
      )
    )

    setAddingPendingMembers(false)

    return users.filter((_, i) => results[i].status === 'rejected')
  }

  const retryFailedUsers = async () => {
    if (!group) return

    setFailedUsers(await addMembers(group.id, failedUsers))
    client.refetchQueries({ include: ['GroupMembers', 'Groups'] })
  }

  const removePendingMember = (user: UserFragment) =>
    setNewGroupUsers(newGroupUsers.filter((u) => u.id !== user.id))

  const submit = async () => {
    if (group) {
      await updateGroup({
        variables: { id: group.id, attributes: state },
      }).catch(() => {})

      return
    }

    const created = await createGroup({ variables: { attributes: state } })
      .then(({ data }) => data?.createGroup)
      .catch(() => undefined)

    if (!created) return

    // createGroup already adds the creator as a member.
    const usersToAdd = newGroupUsers.filter(({ id }) => id !== me.id)
    const failed =
      !global && usersToAdd.length > 0
        ? await addMembers(created.id, usersToAdd)
        : []
    const navState: GroupEditLocationState = { failedUsers: failed }

    navigate(groupPath(created.id), { replace: true, state: navState })
  }

  const error = createError || updateError || addMemberError

  return (
    <Flex
      direction="column"
      flexGrow={1}
      maxHeight="100%"
    >
      <SubpageHeader title={isCreating ? 'Create group' : 'Edit group'} />
      <Flex
        direction="column"
        gap="medium"
        flexGrow={1}
        minHeight={0}
      >
        {error && <GqlError error={error} />}
        {failedUsers.length > 0 && (
          <Callout
            severity="danger"
            title="Some users could not be added to this group"
            buttonProps={{
              children: 'Retry',
              loading: addingPendingMembers,
              onClick: retryFailedUsers,
            }}
          >
            {failedUsers.map((user) => user.name || user.email).join(', ')}
          </Callout>
        )}
        <ValidatedInput
          label="Group name"
          value={name}
          onChange={({ target: { value } }) => update({ name: value })}
          placeholder="Enter group name"
        />
        <ValidatedInput
          label="Group description"
          value={description ?? ''}
          onChange={({ target: { value } }) => update({ description: value })}
          placeholder="Enter group description"
        />
        <Switch
          checked={!!global}
          onChange={(checked) => update({ global: checked })}
        >
          Add all users to this group (also adds future users on account
          creation)
        </Switch>
        {!(isCreating && global) && (
          <>
            <BindingInput
              type="user"
              bindings={[]}
              add={addMember}
              placeholder="Add a user to group"
            />
            {group ? (
              <GroupMembers groupId={group.id} />
            ) : (
              <PendingGroupMembers
                users={newGroupUsers}
                removeMember={removePendingMember}
              />
            )}
          </>
        )}
        <Flex
          gap="medium"
          alignSelf="flex-end"
          paddingBottom="large"
        >
          <Button
            secondary
            startIcon={<ReturnIcon />}
            onClick={() => navigate(GROUPS_PATH)}
          >
            Back to all groups
          </Button>
          <Button
            disabled={!hasUpdates || !name}
            loading={createLoading || updateLoading || addingPendingMembers}
            onClick={submit}
          >
            {isCreating ? 'Create group' : 'Save'}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  )
}
