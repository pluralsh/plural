import React from 'react'
import {Box, Text, Anchor} from 'grommet'
import {useQuery} from 'react-apollo'
import {useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {REPOS_Q} from './queries'

function Repository({repo, hasNext}) {
  let history = useHistory()
  return (
    <Box pad='small' direction='row' gap='small' border={hasNext ? 'bottom' : null}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={repo.icon} />
      </Box>
      <Box gap='xxsmall' justify='center'>
        <Anchor size='small' weight='bold' onClick={() => history.push(`/repositories/${repo.id}`)}>
          {repo.name}
        </Anchor>
        <Text size='small'>
          {repo.description}
        </Text>
      </Box>
    </Box>
  )
}

function Repositories({publisher}) {
  const {loading, data, fetchMore} = useQuery(REPOS_Q, {variables: {publisherId: publisher.id}})
  if (loading || !data) return null

  const {edges, pageInfo} = data.repositories
  return (
    <Box pad='small'>
      <Scroller id='publishers'
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}, next) => <Repository key={node.id} repo={node} hasNext={!!next} />}
        onLoadMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.repositories
              return edges.length ? {
                ...prev,
                repositories: {
                  ...prev.repositories,
                  pageInfo,
                  edges: [...prev.repositories.edges, ...edges]
                }
              } : prev
            }
          })
        }}
      />
    </Box>
  )
}

export default Repositories