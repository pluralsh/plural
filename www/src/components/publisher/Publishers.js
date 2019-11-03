import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import {useQuery} from 'react-apollo'
import {useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {PUBLISHERS_Q} from './queries'
import Avatar from '../users/Avatar'


function Publisher({publisher}) {
  let history = useHistory()

  return (
    <Box direction='row' gap='small'>
      <Avatar size='75px' user={publisher.owner} />
      <Box gap='xsmall'>
        <Anchor
          onClick={() => history.push(`/publishers/${publisher.id}`)}
          size='small'
          weight='bold'>
          {publisher.name}
        </Anchor>
        <Box gap='xxsmall'>
          <Box>
            <Text size='small'><i>{publisher.description}</i></Text>
          </Box>
          <Box>
            <Text size='small'>Owned by {publisher.owner.name}</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function Publishers(props) {
  const {loading, data, fetchMore} = useQuery(PUBLISHERS_Q)
  if (loading || !data) return null

  const {edges, pageInfo} = data.publishers
  return (
    <Box pad='medium'>
      <Scroller
        id='publishers'
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}) => <Publisher publisher={node} />}
        onLoadMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.publishers
              return edges.length ? {
                ...prev,
                publishers: {
                  ...prev.publishers,
                  pageInfo,
                  edges: [...prev.publishers.edges, ...edges]
                }
              } : prev
            }
          })
        }}
      />
    </Box>
  )
}

export default Publishers