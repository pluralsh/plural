import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Div, Flex, Img, P } from 'honorable'
import moment from 'moment'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { PluralConfigurationContext } from '../login/CurrentUser'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { DOCKER_QUERY } from './queries'

const defaultDockerIcon = `${process.env.PUBLIC_URL}/docker.png`

function DockerRepository({ dockerRepository }) {
  const { registry } = useContext(PluralConfigurationContext)
  const { name } = useContext(RepositoryContext)

  return (
    <Flex
      px={1}
      py={0.5}
      mb={0.5}
      as={Link}
      to={`/dkr/img/${dockerRepository.id}`}
      color="text"
      textDecoration="none"
      align="center"
      hoverIndicator="fill-one"
      borderRadius={4}
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
          docker pull {registry}/{name}/{dockerRepository.name} - created {moment(dockerRepository.insertedAt).fromNow()}
        </P>
      </Div>
    </Flex>
  )
}

function RepositoryPackagesDocker() {
  const { id } = useContext(RepositoryContext)
  const [dockerRepositories, loadingCharts, hasMoreCharts, fetchMoreCharts] = usePaginatedQuery(
    DOCKER_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.dockerRepositories
  )

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
      {dockerRepositories.map(dockerRepository => (
        <DockerRepository
          key={dockerRepository.id}
          dockerRepository={dockerRepository}
        />
      ))}
    </InfiniteScroller>
  )
}

export default RepositoryPackagesDocker
