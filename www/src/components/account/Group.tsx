import { useMutation, useQuery } from '@apollo/client'
import { Box } from 'grommet'
import { Switch } from 'pluralsh-design-system'
import { useState } from 'react'
import { Div } from 'honorable'

import { Placeholder } from 'components/utils/Placeholder'

import {
  extendConnection,
  removeConnection,
  updateCache,
} from '../../utils/graphql'

import { DeleteIconButton } from '../utils/IconButtons'

import { StandardScroller } from '../utils/SmoothScroller'

import { List, ListItem } from '../utils/List'

import { DELETE_GROUP_MEMBER, GROUP_MEMBERS } from './queries'

import { UserInfo } from './User'

function GroupMember({
  user, group, first, last, edit,
}) {
  const [mutation] = useMutation(DELETE_GROUP_MEMBER, {
    variables: { groupId: group.id, userId: user.id },
    update: (cache, { data: { deleteGroupMember } }) => updateCache(cache, {
      query: GROUP_MEMBERS,
      variables: { id: group.id },
      update: prev => removeConnection(prev, deleteGroupMember, 'groupMembers'),
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
            onClick={mutation}
            hue="lighter"
          />
        )}
      </Box>
    </ListItem>
  )
}

export function GroupMembers({ group, edit }) {
  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(GROUP_MEMBERS, {
    variables: { id: group.id },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return null
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

export function ViewGroup({ group }) {
  return (
    <Box
      fill
      pad={{ bottom: 'small' }}
      gap="small"
    >
      <Switch
        checked={group.global}
        disabled
      >
        apply group globally
      </Switch>
      <GroupMembers group={group} />
    </Box>
  )
}
