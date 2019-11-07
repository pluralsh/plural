import React, {useState} from 'react'
import {Box, Text, Anchor} from 'grommet'
import {Trash} from 'grommet-icons'
import {useQuery, useMutation} from 'react-apollo'
import {useHistory} from 'react-router-dom'
import Scroller from '../utils/Scroller'
import {REPOS_Q, DELETE_REPO} from './queries'

function DeleteRepository({repo, publisherId}) {
  const [hover, setHover] = useState(false)
  const [mutation] = useMutation(DELETE_REPO, {
    variables: {id: repo.id},
    update: (cache, { data: { deleteRepository } }) => {
      const prev = cache.readQuery({query: REPOS_Q, variables: {publisherId}})
      cache.writeQuery({query: REPOS_Q, variables: {publisherId}, data: {
        ...prev,
        repositories: {
          ...prev.repositories,
          edges: prev.repositories.edges.filter(({node}) => node.id !== deleteRepository.id)
        }
      }})
    }
  })
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{cursor: 'pointer'}}
      width='25px'
      direction='row'
      justify='end'
      align='center'>
      <Trash color={hover ? 'focus' : null} size='15px' onClick={mutation} />
    </Box>
  )
}

export function Repository({repo, hasNext, deletable, publisherId}) {
  let history = useHistory()
  return (
    <Box pad='small' direction='row' gap='small' border={hasNext ? 'bottom' : null}>
      <Box width='50px' heigh='50px'>
        <img alt='' width='50px' height='50px' src={repo.icon} />
      </Box>
      <Box gap='xxsmall' justify='center' width='100%'>
        <Anchor size='small' weight='bold' onClick={() => history.push(`/repositories/${repo.id}`)}>
          {repo.name}
        </Anchor>
        <Text size='small'>
          {repo.description}
        </Text>
      </Box>
      {deletable && (<DeleteRepository repo={repo} publisherId={publisherId} />)}
    </Box>
  )
}

function Repositories({publisher, deletable}) {
  const {loading, data, fetchMore} = useQuery(REPOS_Q, {variables: {publisherId: publisher.id}})
  if (loading || !data) return null

  const {edges, pageInfo} = data.repositories
  return (
    <Box pad='small'>
      <Scroller id='repositories'
        edges={edges}
        style={{overflow: 'auto', height: '100%', width: '100%'}}
        mapper={({node}, next) => (
          <Repository
            key={node.id}
            repo={node}
            hasNext={!!next.node}
            publisherId={publisher.id}
            deletable={deletable} />
        )}
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