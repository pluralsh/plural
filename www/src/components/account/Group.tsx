import { Box } from 'grommet'
import { Switch } from '@pluralsh/design-system'
import { useState } from 'react'
import { Div, Flex } from 'honorable'

import { Placeholder } from '../utils/Placeholder'

import { extendConnection, removeConnection, updateCache } from '../../utils/graphql'

import { DeleteIconButton } from '../utils/IconButtons'

import { StandardScroller } from '../utils/SmoothScroller'

import { List, ListItem } from '../utils/List'

import {
  GroupMembersDocument,
  Group as GroupT,
  useDeleteGroupMemberMutation,
  useGroupMembersQuery,
} from '../../generated/graphql'

import { UserInfo } from './User'

function GroupMember({
  user, group, first, last, edit,
}: any) {
  const [mutation] = useDeleteGroupMemberMutation({
    variables: { groupId: group.id, userId: user.id },
    update: (cache, { data }) => updateCache(cache, {
      query: GroupMembersDocument,
      variables: { id: group.id },
      update: prev => removeConnection(prev, data?.deleteGroupMember, 'groupMembers'),
    }),
  })

  return (
    <ListItem
      flex={false}
      background="fill-two"
      first={first}
      last={last}
    >
      <Box
        flex={false}
        fill="horizontal"
        direction="row"
        align="center"
      >
        <UserInfo
          user={user}
          fill="horizontal"
          hue="lightest"
        />
        {edit && (
          <DeleteIconButton
            onClick={() => mutation()}
          />
        )}
      </Box>
    </ListItem>
  )
}

export function GroupMembers({
  group,
  edit,
}: {
  group: GroupT
  edit?: boolean
}) {
  const [listRef, setListRef] = useState<any>(null)
  const { data, loading, fetchMore } = useGroupMembersQuery({
    variables: { id: group.id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data?.groupMembers) return null

  const {
    groupMembers: { pageInfo, edges },
  } = data

  return (
    <List
      minHeight="230px"
      position="relative"
      hue="lighter"
    >
      <Div flexGrow="1">
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          items={edges}
          loading={loading}
          placeholder={Placeholder}
          hasNextPage={pageInfo.hasNextPage}
          mapper={({ node }, { prev, next }) => (
            <GroupMember
              key={node.user.id}
              user={node.user}
              group={group}
              first={!prev.node}
              last={!next.node}
              edit={edit}
            />
          )}
          loadNextPage={() => pageInfo.hasNextPage
            && fetchMore({
              variables: { cursor: pageInfo.endCursor },
              updateQuery: (prev, { fetchMoreResult: { groupMembers } }) => extendConnection(prev, groupMembers, 'groupMembers'),
            })}
        />
      </Div>
    </List>
  )
}

export function ViewGroup({ group }: any) {
  return (
    <Flex
      direction="column"
      gap="medium"
    >
      <Switch
        checked={group.global}
        disabled
      >
        Apply globally
      </Switch>
      <GroupMembers group={group} />
    </Flex>
  )
}
