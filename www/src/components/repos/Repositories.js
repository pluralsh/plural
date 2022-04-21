import { useContext } from 'react'
import { Box, Text, ThemeContext } from 'grommet'
import { HoveredBackground, Password, Scroller, Trash } from 'forge-core'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate } from 'react-router-dom'

import { chunk } from '../../utils/array'

import { extendConnection } from '../../utils/graphql'

import { DELETE_REPO, REPOS_Q } from './queries'
import { Container } from './Integrations'

function DeleteRepository({ repo, publisherId }) {
  const [mutation] = useMutation(DELETE_REPO, {
    variables: { id: repo.id },
    update: (cache, { data: { deleteRepository } }) => {
      const { repositories, ...prev } = cache.readQuery({ query: REPOS_Q, variables: { publisherId } })
      cache.writeQuery({ query: REPOS_Q,
        variables: { publisherId },
        data: {
          ...prev,
          repositories: {
            ...repositories, edges: repositories.edges.filter(({ node }) => node.id !== deleteRepository.id),
          },
        } })
    },
  })

  return (
    <HoveredBackground>
      <Box
        accentable
        focusIndicator={false}
        background="white"
        pad="xsmall"
        round="xsmall"
        margin={{ top: 'xsmall', right: 'xsmall' }}
      >
        <Trash
          size="15px"
          onClick={mutation}
        />
      </Box>
    </HoveredBackground>
  )
}

export function RepoIcon({ repo: { icon, darkIcon }, round, size }) {
  const { dark } = useContext(ThemeContext)
  const dim = size || '50px'

  return (
    <Box
      flex={false}
      align="center"
      justify="center"
      width={dim}
      round={round}
    >
      <img
        alt=""
        width={dim}
        height={dim}
        src={dark ? darkIcon || icon : icon}
      />
    </Box>
  )
}

export function RepoName({ repo: { name, private: priv } }) {
  return (
    <Box
      direction="row"
      gap="xsmall"
      align="center"
    >
      <Text
        size="small"
        weight="bold"
      >
        {name}
      </Text>
      {priv && <Password size="small" />}
    </Box>
  )
}

export function RepositoryInner({ repo }) {
  return (
    <Box
      direction="row"
      gap="medium"
      fill="horizontal"
    >
      <RepoIcon repo={repo} />
      <Box
        gap="xxsmall"
        justify="center"
        width="100%"
      >
        <RepoName repo={repo} />
        <Text size="small">
          {repo.description}
        </Text>
      </Box>
    </Box>
  )
}

function RepositoryCell({ repo, deletable, publisherId, width }) {
  const navigate = useNavigate()

  return (
    <Container
      pad="medium"
      width={width}
      modifier={deletable && (
        <DeleteRepository
          repo={repo}
          publisherId={publisherId}
        />
      )}
      onClick={() => navigate(`/repositories/${repo.id}`)}
    >
      <RepositoryInner repo={repo} />
    </Container>
  )
}

export function Repository({ repo, hasNext, deletable, publisherId }) {
  return (
    <Box
      pad="small"
      direction="row"
      gap="small"
      border={hasNext ? 'bottom' : null}
    >
      <Box
        width="50px"
        margin={{ right: 'small' }}
      >
        <img
          alt=""
          width="50px"
          height="50px"
          src={repo.icon}
        />
      </Box>
      <Box
        gap="xxsmall"
        justify="center"
        width="100%"
      >
        <Box
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Text
            size="small"
            weight="bold"
          >{repo.name}
          </Text>
          {repo.private && <Password size="small" />}
        </Box>
        <Text size="small">
          {repo.description}
        </Text>
      </Box>
      {deletable && (
        <DeleteRepository
          repo={repo}
          publisherId={publisherId}
        />
      )}
    </Box>
  )
}

export function RepositoryList({ repositores: { edges, pageInfo }, fetchMore, publisher, deletable, columns, emptyState }) {
  const width = Math.floor((100 - 10) / columns)

  return (
    <Scroller
      id="repositories"
      edges={Array.from(chunk(edges, columns))}
      style={{ overflow: 'auto', height: '100%', width: '100%' }}
      emptyState={emptyState}
      mapper={chunk => (
        <Box
          key={chunk[0].node.id}
          direction="row"
          gap="small"
          fill="horizontal"
          margin={{ bottom: 'small' }}
        >
          {chunk.map(({ node }) => (
            <RepositoryCell
              key={node.id}
              repo={node}
              publisherId={publisher && publisher.id}
              deletable={deletable}
              width={`${width}%`}
            />
          ))}
        </Box>
      )}
      onLoadMore={() => pageInfo.hasNextPage && fetchMore({
        variables: { cursor: pageInfo.endCursor },
        updateQuery: (prev, { fetchMoreResult: { repositories } }) => extendConnection(prev, repositories, 'repositories'),
      })}
    />
  )
}

export default function Repositories({ publisher, deletable, columns }) {
  const { loading, data, fetchMore } = useQuery(REPOS_Q, { variables: { publisherId: publisher.id } })
  if (loading || !data) return null

  return (
    <Box
      fill
      pad="small"
    >
      <RepositoryList
        repositores={data.repositories}
        fetchMore={fetchMore}
        deletable={deletable}
        publisher={publisher}
        columns={columns}
      />
    </Box>
  )
}
