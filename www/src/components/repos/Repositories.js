import React from 'react'
import { Box, Text, Anchor } from 'grommet'
import { Scroller, HoveredBackground } from 'forge-core'
import { Lock, Trash } from 'grommet-icons'
import { useQuery, useMutation } from 'react-apollo'
import { useHistory } from 'react-router-dom'
import { REPOS_Q, DELETE_REPO } from './queries'
import { Container } from './Integrations'
import { chunk } from '../../utils/array'

function DeleteRepository({repo, publisherId}) {
  const [mutation] = useMutation(DELETE_REPO, {
    variables: {id: repo.id},
    update: (cache, { data: { deleteRepository } }) => {
      const {repositories, ...prev} = cache.readQuery({query: REPOS_Q, variables: {publisherId}})
      cache.writeQuery({query: REPOS_Q, variables: {publisherId}, data: {
        ...prev, repositories: {
          ...repositories, edges: repositories.edges.filter(({node}) => node.id !== deleteRepository.id)
        }
      }})
    }
  })

  return (
    <HoveredBackground>
      <Box
        accentable
        focusIndicator={false}
        background='white'
        pad='xsmall'
        round='xsmall'
        margin={{top: 'xsmall', right: 'xsmall'}}>
        <Trash size='15px' onClick={mutation} />
      </Box>
    </HoveredBackground>
  )
}

const ICON_WIDTH = '50px'

export function RepositoryInner({repo}) {
  return (
    <Box direction='row' gap='medium' fill='horizontal'>
      <Box align='center' justify='center' width={ICON_WIDTH}>
        <img alt='' width='50px' height='50px' src={repo.icon} />
      </Box>
      <Box gap='xxsmall' justify='center' width='100%'>
        <Box direction='row' gap='xsmall' align='center'>
          <Text size='small' weight='bold'>
            {repo.name}
          </Text>
          {repo.private && <Lock size='small' />}
        </Box>
        <Text size='small'>
          {repo.description}
        </Text>
      </Box>
    </Box>
  )
}

function RepositoryCell({repo, deletable, publisherId, width}) {
  let history = useHistory()
  return (
    <Container
      pad='medium'
      width={width}
      modifier={deletable && <DeleteRepository repo={repo} publisherId={publisherId} />}
      onClick={() => history.push(`/repositories/${repo.id}`)}>
      <RepositoryInner repo={repo} />
    </Container>
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
        <Box direction='row' gap='xsmall' align='center'>
          <Anchor size='small' weight='bold' onClick={() => history.push(`/repositories/${repo.id}`)}>
            {repo.name}
          </Anchor>
          {repo.private && <Lock size='small' />}
        </Box>
        <Text size='small'>
          {repo.description}
        </Text>
      </Box>
      {deletable && (<DeleteRepository repo={repo} publisherId={publisherId} />)}
    </Box>
  )
}

export function RepositoryList({repositores: {edges, pageInfo}, fetchMore, publisher, deletable, columns, emptyState}) {
  const width = Math.floor((100 - 10) / columns)
  return (
    <Scroller id='repositories'
      edges={Array.from(chunk(edges, columns))}
      style={{overflow: 'auto', height: '100%', width: '100%'}}
      emptyState={emptyState}
      mapper={(chunk) => (
        <Box key={chunk[0].node.id} direction='row' gap='small' fill='horizontal' margin={{bottom: 'small'}}>
          {chunk.map(({node}) => <RepositoryCell
                                    key={node.id}
                                    repo={node}
                                    publisherId={publisher && publisher.id}
                                    deletable={deletable}
                                    width={`${width}%`} />)}
        </Box>
      )}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: {cursor: pageInfo.endCursor},
        updateQuery: (prev, {repositores: {edges, pageInfo}}) => ({
          ...prev, repositories: {
            ...prev.repositories, pageInfo, edges: [...prev.repositories.edges, ...edges]
        }})
      })}
    />
  )
}

export default function Repositories({publisher, deletable, columns}) {
  const {loading, data, fetchMore} = useQuery(REPOS_Q, {variables: {publisherId: publisher.id}})
  if (loading || !data) return null

  return (
    <Box pad='small'>
      <RepositoryList
        repositores={data.repositories}
        fetchMore={fetchMore}
        deletable={deletable}
        publisher={publisher}
        columns={columns} />
    </Box>
  )
}