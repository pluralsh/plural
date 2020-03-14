import React from 'react'
import { Box, Text } from 'grommet'
import { Trash} from 'grommet-icons'
import { useHistory } from 'react-router-dom'
import { useQuery, useMutation } from 'react-apollo'
import { INSTALLATIONS_Q, DELETE_INSTALLATION } from './queries'
import { Repository, RepositoryInner } from './Repositories'
import Scroller from '../utils/Scroller'
import { Container } from './Integrations'
import HoveredBackground from '../utils/HoveredBackground'
import { chunk } from '../../utils/array'

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

function DeleteInstallation({installation}) {
  const [mutation] = useMutation(DELETE_INSTALLATION, {
    variables: {id: installation.id},
    update: (cache, {data: {deleteInstallation}}) => {
      const {installations, ...prev} = cache.readQuery({query: INSTALLATIONS_Q})
      cache.writeQuery({query: INSTALLATIONS_Q, data: {
        ...prev, installations: {
          ...installations,
          edges: installations.edges.filter(({node}) => node.id !== deleteInstallation.id)
        }
      }})
    }
  })

  return (
    <HoveredBackground>
      <Box accentable width='20px' style={{cursor: 'pointer'}} margin={{top: 'xsmall'}}>
        <Trash size='15px' onClick={mutation} />
      </Box>
    </HoveredBackground>
  )
}

function EditableInstallation({installation}) {
  let history = useHistory()
  return (
    <Container
      width='48%'
      onClick={() => history.push(`/repositories/${installation.repository.id}`)}
      style={{cursor: 'pointer'}}
      modifier={<DeleteInstallation installation={installation} />}>
      <RepositoryInner repo={installation.repository} />
    </Container>
  )
}

export default function Installations({edit}) {
  const {data, loading, fetchMore} = useQuery(INSTALLATIONS_Q, {fetchPolicy: "cache-and-network"})

  if (!data || loading) return null
  const {edges, pageInfo} = data.installations

  return (
    <Box gap='small' fill='horizontal'>
      <Scroller
        id='installations'
        edges={Array.from(chunk(edges, 2))}
        style={{overflow: 'auto', width: '100%'}}
        emptyState={<NoInstallations />}
        mapper={(chunk) => (
          <Box key={chunk[0].id} direction='row' gap='small' margin={{bottom: 'small'}}>
            {chunk.map(({node}) => (
              edit ? <EditableInstallation key={node.id} installation={node} /> :
                     <Repository key={node.id} repo={node.repository} />
            ))}
          </Box>
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {chartCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {installations: {edges, pageInfo}}}) => {
            return {...prev, installations: {
              ...prev.installations, pageInfo, edges: [...prev.installations.edges, ...edges]
            }}
          }
        })
      } />
    </Box>
  )
}