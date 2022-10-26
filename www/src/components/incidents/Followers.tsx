import { useContext } from 'react'
import { Box, Text } from 'grommet'
import { Scroller } from 'forge-core'

import { extendConnection } from '../../utils/graphql'
import Avatar from '../users/Avatar'

import { PresenceContext, PresenceIndicator } from './Presence'

function Follower({ follower: { user } }) {
  const { present } = useContext(PresenceContext)
  const isPresent = present[user.id]

  return (
    <Box
      direction="row"
      gap="small"
      align="center"
      onClick={() => null}
      hoverIndicator="light-3"
      pad="small"
    >
      <Avatar
        user={user}
        size="30px"
      />
      <Text
        size="small"
        weight={500}
      >{user.name}
      </Text>
      {isPresent && <PresenceIndicator />}
    </Box>
  )
}

export function Followers({ incident: { followers: { edges, pageInfo } }, fetchMore }) {
  return (
    <Box fill>
      <Scroller
        id="followers"
        style={{ width: '100%', height: '100%', overflow: 'auto' }}
        edges={edges}
        mapper={({ node }) => (
          <Follower
            key={node.id}
            follower={node}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { followerCursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { incident: { followers } } }) => ({
            ...prev, incident: extendConnection(prev.incident, followers, 'followers'),
          }),
        })}
      />
    </Box>
  )
}
