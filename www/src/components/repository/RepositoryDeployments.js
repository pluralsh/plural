import { useContext } from 'react'
import moment from 'moment'
import { Flex, H2, P, Span } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { DEPLOYMENTS_QUERY } from './queries'

// eslint-disable-next-line
const MAX_UUID = 0xffffffffffffffffffffffffffffffff

const statusToColor = {
  QUEUED: 'fill-one',
  RUNNING: 'warning',
  FINISHED: 'success',
}

function progress(cursor) {
  const prog = cursor ? parseInt(cursor.replaceAll('-', ''), 16) : 0

  return Math.floor((prog / MAX_UUID) * 10000) / 100
}

function statusDescription({ status, cursor }) {
  switch (status) {
    case 'QUEUED':
      return 'queued'
    case 'FINISHED':
      return 'finished'
    case 'RUNNING':
      return `${progress(cursor)}% completed`
    default:
      return null
  }
}

function Status({ rollout }) {
  return (
    <Span
      backgroundColor={statusToColor[rollout.status]}
      borderRadius={4}
      px={0.5}
      py={0.25}
    >
      {statusDescription(rollout)}
    </Span>
  )
}

function Rollout({ rollout }) {
  return (
    <Flex borderBottom="1px solid border">
      <P
        py={1}
        px={1}
        width="calc(100% / 4)"
      >
        {rollout.event}
      </P>
      <P
        py={1}
        px={1}
        width="calc(100% / 4)"
      >
        {`${rollout.count} clusters`}
      </P>
      <P
        py={1}
        px={1}
        width="calc(100% / 4)"
      >
        {rollout.heartbeat ? moment(rollout.heartbeat).fromNow() : 'pending'}
      </P>
      <P
        py={1}
        px={1}
        width="calc(100% / 4)"
      >
        <Status rollout={rollout} />
      </P>
    </Flex>
  )
}

function RepositoryDeployments() {
  const { id } = useContext(RepositoryContext)
  const [rollouts, loadingRollouts, hasMoreRollouts, fetchMoreRollouts] = usePaginatedQuery(
    DEPLOYMENTS_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.rollouts
  )

  if (rollouts.length === 0 && loadingRollouts) {
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
    <Flex
      height="100%"
      maxHeight="100%"
      direction="column"
    >
      <H2 flexShrink={0}>
        Deployments
      </H2>
      <Flex
        mt={1.5}
        flexGrow={1}
        direction="column"
      >
        <Flex
          borderBottom="1px solid border"
          fontWeight={500}
        >
          <P
            py={0.5}
            px={1}
            width="calc(100% / 4)"
          >
            Event
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 4)"
          >
            Clusters Updated
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 4)"
          >
            Last Ping
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 4)"
          >
            Progress
          </P>
        </Flex>
        <InfiniteScroller
          pb={4}
          loading={loadingRollouts}
          hasMore={hasMoreRollouts}
          loadMore={fetchMoreRollouts}
          // Allow for scrolling in a flexbox layout
          flexGrow={1}
          height={0}
        >
          {rollouts.map(rollout => (
            <Rollout
              key={rollout.id}
              rollout={rollout}
            />
          ))}
        </InfiniteScroller>
      </Flex>
    </Flex>
  )
}

export default RepositoryDeployments
