import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Trash} from 'grommet-icons'
import {useQuery, useMutation} from 'react-apollo'
import {INSTALLATIONS_Q, DELETE_INSTALLATION} from './queries'
import {Repository} from './Repositories'
import Scroller from '../utils/Scroller'

function NoInstallations() {
  return (
    <Box>
      <Text size='small'>
        It looks like you have not installed anything.  Try searching for repositories,
      or browsing the available publishers.
      </Text>
    </Box>
  )
}

function EditableInstallation({installation, hasNext}) {
  const [hover, setHover] = useState(false)
  const [mutation] = useMutation(DELETE_INSTALLATION, {
    variables: {id: installation.id},
    update: (cache, {data: {deleteInstallation}}) => {
      const prev = cache.readQuery({query: INSTALLATIONS_Q})
      cache.writeQuery({query: INSTALLATIONS_Q, data: {
        ...prev,
        installations: {
          ...prev.installations,
          edges: prev.installations.edges.filter(({node}) => node.id !== deleteInstallation.id)
        }
      }})
    }
  })
  return (
    <Box direction='row' align='center'>
      <Box width='100%'>
        <Repository repo={installation.repository} hasNext={hasNext} />
      </Box>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        width='20px'
        style={{cursor: 'pointer'}}>
        <Trash color={hover ? 'focus' : null} size='15px' onClick={mutation} />
      </Box>
    </Box>
  )
}

export default function Installations({edit}) {
  const {data, loading, fetchMore} = useQuery(INSTALLATIONS_Q)

  if (!data || loading) return null
  const {edges, pageInfo} = data.installations

  return (
    <Box gap='small' fill='horizontal'>
      <Scroller
        id='installations'
        edges={edges}
        style={{overflow: 'auto', width: '100%'}}
        emptyState={<NoInstallations />}
        mapper={({node}, next) => (edit ?
          <EditableInstallation key={node.id} installation={node} hasNext={!!next.node} /> :
          <Repository key={node.id} repo={node.repository} hasNext={!!next.node} />
        )}
        onLoadMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {chartCursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.installations
              return edges.length ? {
                ...prev,
                installations: {
                  ...prev.installations,
                  pageInfo,
                  edges: [...prev.installations.edges, ...edges]
                }
              } : prev
            }
          })
        }} />
    </Box>
  )
}