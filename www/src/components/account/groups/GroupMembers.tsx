import {
  GraphQLToast,
  IconFrame,
  Spinner,
  Table,
  TrashCanIcon,
} from '@pluralsh/design-system'
import { createColumnHelper } from '@tanstack/react-table'
import { useMemo } from 'react'

import {
  UserFragment,
  useDeleteGroupMemberMutation,
  useGroupMembersQuery,
} from '../../../generated/graphql'
import { mapExistingNodes } from '../../../utils/graphql'
import { isNonNullable } from '../../../utils/isNonNullable'
import { GqlError } from '../../utils/Alert'
import { useFetchPaginatedData } from '../../utils/useFetchPaginatedData'
import { UserInfo } from '../User'

type MemberRow = { user: UserFragment }
type GroupMembersMeta = {
  groupId?: string
  removeMember?: (user: UserFragment) => void
}

const EMPTY_STATE = { message: 'Add members to this group.' }

export function GroupMembers({ groupId }: { groupId: string }) {
  const { data, loading, error, pageInfo, fetchNextPage, setVirtualSlice } =
    useFetchPaginatedData(
      { queryHook: useGroupMembersQuery, keyPath: ['groupMembers'] },
      { id: groupId }
    )
  const members = useMemo(
    () =>
      mapExistingNodes(data?.groupMembers)
        .map(({ user }) => user && { user })
        .filter(isNonNullable),
    [data?.groupMembers]
  )
  const meta: GroupMembersMeta = { groupId }

  if (error) return <GqlError error={error} />

  return (
    <Table
      hideHeader
      fullHeightWrap
      virtualizeRows
      data={members}
      loading={!data && loading}
      loadingSkeletonRows={4}
      columns={cols}
      reactTableOptions={{ meta }}
      hasNextPage={pageInfo?.hasNextPage}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={loading}
      onVirtualSliceChange={setVirtualSlice}
      emptyStateProps={EMPTY_STATE}
    />
  )
}

export function PendingGroupMembers({
  users,
  removeMember,
}: {
  users: UserFragment[]
  removeMember: (user: UserFragment) => void
}) {
  const members = useMemo(() => users.map((user) => ({ user })), [users])
  const meta: GroupMembersMeta = { removeMember }

  return (
    <Table
      hideHeader
      data={members}
      columns={cols}
      reactTableOptions={{ meta }}
      emptyStateProps={EMPTY_STATE}
    />
  )
}

const columnHelper = createColumnHelper<MemberRow>()

const cols = [
  columnHelper.accessor(({ user }) => user, {
    id: 'user',
    meta: { gridTemplate: 'minmax(0, 1fr)' },
    cell: function Cell({ getValue }) {
      return (
        <UserInfo
          user={getValue()}
          hue="lightest"
        />
      )
    },
  }),
  columnHelper.accessor(({ user }) => user, {
    id: 'remove',
    meta: { gridTemplate: 'fit-content(40px)' },
    cell: function Cell({ getValue, table: { options } }) {
      const user = getValue()
      const { groupId, removeMember } = options.meta as GroupMembersMeta
      const [mutation, { loading, error }] = useDeleteGroupMemberMutation({
        refetchQueries: ['GroupMembers', 'Groups'],
        awaitRefetchQueries: true,
      })

      return (
        <>
          <IconFrame
            size="small"
            clickable
            icon={loading ? <Spinner /> : <TrashCanIcon color="icon-danger" />}
            tooltip={
              <span>
                Remove <b>{user.name}</b> from this group
              </span>
            }
            onClick={() =>
              removeMember
                ? removeMember(user)
                : groupId &&
                  mutation({ variables: { groupId, userId: user.id } })
            }
          />
          <GraphQLToast
            show={!!error}
            closeTimeout={6000}
            error={error}
            header="Error removing user from group"
            margin="xxlarge"
          />
        </>
      )
    },
  }),
]
