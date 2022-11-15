import { useContext } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  Div,
  Flex,
  Img,
  P,
} from 'honorable'
import moment from 'moment'

import Fuse from 'fuse.js'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import PluralConfigurationContext from '../../contexts/PluralConfigurationContext'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { DOCKER_QUERY } from './queries'
import { packageCardStyle } from './RepositoryPackages'

const defaultDockerIcon = `/docker.png`

const searchOptions = {
  keys: ['name'],
  threshold: 0.25,
}

function DockerRepository({ dockerRepository, first, last }: any) {
  const { registry } = useContext(PluralConfigurationContext)
  const { name } = useContext(RepositoryContext)

  return (
    <Flex
      as={Link}
      to={`/dkr/repo/${dockerRepository.id}`}
      {...packageCardStyle(first, last)}
    >
      <Img
        alt={dockerRepository.name}
        width={64}
        height={64}
        src={defaultDockerIcon}
      />
      <Div ml={1}>
        <P
          body1
          fontWeight={500}
        >
          {dockerRepository.name}
        </P>
        <P mt={0.5}>
          docker pull {registry}/{name}/{dockerRepository.name}
        </P>
      </Div>
      <Flex
        flexGrow={1}
        justifyContent="flex-end"
        color="text-xlight"
        caption
      >
        Created {moment(dockerRepository.insertedAt).fromNow()}
      </Flex>
    </Flex>
  )
}

function RepositoryPackagesDocker() {
  const { id } = useContext(RepositoryContext)
  const [q] = useOutletContext() as any
  const [dockerRepositories, loadingCharts, hasMoreCharts, fetchMoreCharts] = usePaginatedQuery(DOCKER_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.dockerRepositories)

  const fuse = new Fuse(dockerRepositories, searchOptions)
  const filteredDockerRepositories = q ? fuse.search(q).map(({ item }) => item) : dockerRepositories

  if (dockerRepositories.length === 0 && loadingCharts) {
    return (
      <Flex
        pt={2}
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  return (
    <InfiniteScroller
      loading={loadingCharts}
      hasMore={hasMoreCharts}
      loadMore={fetchMoreCharts}
      // Allow for scrolling in a flexbox layout
      flexGrow={1}
      height={0}
    >
      {filteredDockerRepositories.sort((a, b) => a.name.localeCompare(b.name)).map((dockerRepository, i) => (
        <DockerRepository
          key={dockerRepository.id}
          dockerRepository={dockerRepository}
          first={i === 0}
          last={i === filteredDockerRepositories.length - 1}
        />
      ))}
      {!filteredDockerRepositories?.length && (
        <Flex
          width="100%"
          padding="medium"
          backgroundColor="fill-one"
          border="1px solid border-fill-two"
          borderTop="none"
          borderBottomLeftRadius="4px"
          borderBottomRightRadius="4px"
        >
          No repositories found.
        </Flex>
      )}
    </InfiniteScroller>
  )
}

export default RepositoryPackagesDocker
