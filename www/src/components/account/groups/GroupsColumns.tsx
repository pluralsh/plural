import {
  EyeIcon,
  Flex,
  IconFrame,
  Modal,
  PencilIcon,
  Spinner,
} from '@pluralsh/design-system'
import { ApolloClient, useApolloClient } from '@apollo/client'
import { createColumnHelper, Row } from '@tanstack/react-table'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  GroupFragment,
  GroupMembersDocument,
  GroupMembersQuery,
  GroupMembersQueryVariables,
  UserFragment,
  useDeleteGroupMutation,
  useGroupMembersQuery,
} from '../../../generated/graphql'
import { extendConnection, mapExistingNodes } from '../../../utils/graphql'
import { isNonNullable } from '../../../utils/isNonNullable'
import { GqlError } from '../../utils/Alert'
import { Confirm } from '../../utils/Confirm'
import { DeleteIconButton } from '../../utils/IconButtons'
import { StackedText } from '../../utils/StackedText'
import { CaptionP } from '../../utils/Typography'

import {
  ColMembershipExpander,
  HoverActions,
  MembershipExpandPanel,
  MembershipListRowSC,
  MembershipListSC,
  MembershipUserRow,
  MEMBERSHIP_VISIBLE_ROWS,
} from './MembershipExpandPanel'

export type GroupsListMeta = { editable: boolean }

const MEMBERS_PAGE_SIZE = 50
const COPY_MEMBERS_PAGE_SIZE = 500

export const groupPath = (id: string) => `/account/groups/${id}`

const columnHelper = createColumnHelper<GroupFragment>()

const ColGroupInfo = columnHelper.accessor((group) => group, {
  id: 'info',
  header: 'Groups',
  meta: { gridTemplate: 'minmax(0, 1fr)' },
  cell: function Cell({ getValue }) {
    const group = getValue()

    return (
      <StackedText
        first={group?.name}
        second={group?.description || 'no description'}
        firstColor="text"
        gap="xxxsmall"
        truncate
      />
    )
  },
})

const ColActions = columnHelper.accessor((group) => group, {
  id: 'actions',
  header: '',
  meta: { gridTemplate: 'fit-content(72px)' },
  cell: function Cell({ getValue, table: { options } }) {
    const group = getValue()
    const { editable } = options.meta as GroupsListMeta
    const navigate = useNavigate()
    const [dialogKey, setDialogKey] = useState<
      'viewGroup' | 'confirmDelete' | ''
    >('')
    const [mutation, { loading, error }] = useDeleteGroupMutation({
      variables: { id: group.id },
      onCompleted: () => setDialogKey(''),
      refetchQueries: ['Groups'],
      awaitRefetchQueries: true,
    })

    return (
      <>
        <HoverActions>
          {editable ? (
            <>
              <IconFrame
                clickable
                size="small"
                tooltip="Edit group"
                icon={<PencilIcon />}
                onClick={() => navigate(groupPath(group.id))}
              />
              <DeleteIconButton
                size="small"
                tooltip="Delete group"
                onClick={() => setDialogKey('confirmDelete')}
              />
            </>
          ) : (
            <IconFrame
              clickable
              size="small"
              tooltip="View group"
              icon={<EyeIcon />}
              onClick={() => setDialogKey('viewGroup')}
            />
          )}
        </HoverActions>
        <ViewGroupMembersModal
          group={group}
          open={dialogKey === 'viewGroup'}
          onClose={() => setDialogKey('')}
        />
        <Confirm
          open={dialogKey === 'confirmDelete'}
          text={
            <>
              Are you sure you want to delete the <b>{group.name}</b> group?
              Permissions attached to this group will be removed for all of its
              members.
            </>
          }
          close={() => setDialogKey('')}
          label="Delete group"
          submit={() => mutation()}
          loading={loading}
          destructive
          error={error}
        />
      </>
    )
  },
})

export function GroupMembersExpand({
  row,
  editable,
}: {
  row: Row<GroupFragment>
  editable: boolean
}) {
  const group = row.original
  const navigate = useNavigate()
  const [viewOpen, setViewOpen] = useState(false)
  const client = useApolloClient()
  const { data, loading, error } = useGroupMembersQuery({
    variables: { id: group.id, first: MEMBERSHIP_VISIBLE_ROWS },
    fetchPolicy: 'cache-and-network',
  })
  const users = membersFromQuery(data)

  return (
    <>
      {error && <GqlError error={error} />}
      <MembershipExpandPanel
        loading={!data && loading}
        emptyMessage="This group has no members."
        getCopyText={() => getGroupMembersCopyText(client, group)}
        viewAll={
          data?.groupMembers?.pageInfo.hasNextPage
            ? {
                onClick: () =>
                  editable ? navigate(groupPath(group.id)) : setViewOpen(true),
              }
            : undefined
        }
      >
        {users.map((user) => (
          <MembershipUserRow
            key={user.id}
            name={user.name}
            email={user.email}
            avatar={user.avatar}
          />
        ))}
      </MembershipExpandPanel>
      <ViewGroupMembersModal
        group={group}
        open={viewOpen}
        onClose={() => setViewOpen(false)}
      />
    </>
  )
}

function ViewGroupMembersModal({
  group,
  open,
  onClose,
}: {
  group: GroupFragment
  open: boolean
  onClose: () => void
}) {
  return (
    <Modal
      header={group.name}
      open={open}
      onClose={onClose}
      size="large"
    >
      {open && <AllGroupMembers group={group} />}
    </Modal>
  )
}

function AllGroupMembers({ group }: { group: GroupFragment }) {
  const { data, loading, error, fetchMore } = useGroupMembersQuery({
    variables: { id: group.id, first: MEMBERS_PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
  })
  const users = membersFromQuery(data)
  const pageInfo = data?.groupMembers?.pageInfo

  const loadMore = () =>
    !loading &&
    pageInfo?.hasNextPage &&
    fetchMore({
      variables: { after: pageInfo.endCursor },
      updateQuery: (prev, { fetchMoreResult }) =>
        extendConnection(prev, fetchMoreResult.groupMembers, 'groupMembers'),
    })

  return (
    <>
      {error && <GqlError error={error} />}
      <MembershipListSC
        css={{ maxHeight: 480, overflow: 'auto' }}
        onScroll={({ currentTarget: el }) => {
          if (el.scrollHeight - el.scrollTop - el.clientHeight < 200) loadMore()
        }}
      >
        {data && users.length === 0 && (
          <MembershipListRowSC>
            <CaptionP $color="text-xlight">This group has no members.</CaptionP>
          </MembershipListRowSC>
        )}
        {users.map((user) => (
          <MembershipUserRow
            key={user.id}
            name={user.name}
            email={user.email}
            avatar={user.avatar}
          />
        ))}
        {loading && (
          <Flex
            justify="center"
            padding="medium"
          >
            <Spinner />
          </Flex>
        )}
      </MembershipListSC>
    </>
  )
}

async function getGroupMembersCopyText(
  client: ApolloClient<unknown>,
  group: GroupFragment
) {
  const users: UserFragment[] = []
  let after: string | null | undefined

  do {
    const { data } = await client.query<
      GroupMembersQuery,
      GroupMembersQueryVariables
    >({
      query: GroupMembersDocument,
      variables: { id: group.id, first: COPY_MEMBERS_PAGE_SIZE, after },
      fetchPolicy: 'network-only',
    })

    users.push(...membersFromQuery(data))
    after = data.groupMembers?.pageInfo.hasNextPage
      ? data.groupMembers.pageInfo.endCursor
      : null
  } while (after)

  return [
    group.name,
    ...users.map(({ name, email }) =>
      name && email ? `${name} <${email}>` : name || email
    ),
  ]
    .filter(Boolean)
    .join('\n')
}

function membersFromQuery(data: GroupMembersQuery | undefined) {
  return mapExistingNodes(data?.groupMembers)
    .map((member) => member.user)
    .filter(isNonNullable)
}

export const groupsCols = [ColMembershipExpander, ColGroupInfo, ColActions]
