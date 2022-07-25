import { useContext, useEffect } from 'react'
import moment from 'moment'
import { Flex } from 'honorable'

import { Chip, StatusIpIcon, StatusOkIcon } from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { ROLLOUT_SUB } from '../clusters/queries'
import { appendConnection } from '../../utils/graphql'

import { Table, TableData, TableRow } from '../utils/Table'

import { DEPLOYMENTS_QUERY } from './queries'

// eslint-disable-next-line
const MAX_UUID = 0xffffffffffffffffffffffffffffffff

function progress(cursor) {
  const prog = cursor ? parseInt(cursor.replaceAll('-', ''), 16) : 0

  return Math.floor((prog / MAX_UUID) * 10000) / 100
}

function statusAttributes({ status, cursor }) {
  switch (status) {
  case 'QUEUED':
    return { icon: <StatusIpIcon />, text: 'queued', severity: 'neutral' }
  case 'FINISHED':
    return { icon: <StatusOkIcon />, text: 'finished', severity: 'success' }
  case 'RUNNING':
    return { loading: true, text: `${progress(cursor)}% completed`, severity: 'info' }
  default:
    return {}
  }
}

function Status({ rollout }) {
  const { text, ...rest } = statusAttributes(rollout)

  return (
    <Chip
      {...rest}
      backgroundColor="fill-two"
      borderColor="border-fill-two"
    >{text}
    </Chip>
  )
}

function Rollout({ rollout, last }) {
  return (
    <TableRow last={last}>
      <TableData>{rollout.event}</TableData>
      <TableData>{rollout.count} clusters</TableData>
      <TableData>{rollout.heartbeat ? moment(rollout.heartbeat).fromNow() : 'pending'}</TableData>
      <TableData><Status rollout={rollout} /></TableData>
    </TableRow>
  )
}

function RepositoryDeployments() {
  const { id } = useContext(RepositoryContext)
  const [rollouts, loadingRollouts, hasMoreRollouts, fetchMoreRollouts, subscribeToMore] = usePaginatedQuery(DEPLOYMENTS_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.rollouts)

  useEffect(() => subscribeToMore({
    document: ROLLOUT_SUB,
    variables: { repositoryId: id },
    updateQuery: (prev, { subscriptionData: { data: { rolloutDelta: { delta, payload } } } }) => (delta === 'CREATE' ? appendConnection(prev, payload, 'rollouts') : prev),
  }), [id, subscribeToMore])

  const len = rollouts.length

  if (len === 0 && loadingRollouts) {
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
      <Table
        headers={['Event', 'Clusters Updated', 'Last Ping', 'Status']}
        sizes={['30%', '30%', '30%', '10%']}
        background="fill-one"
        width="100%"
        height="calc(100% - 16px)"
      >
        <InfiniteScroller
          pb={4}
          loading={loadingRollouts}
          hasMore={hasMoreRollouts}
          loadMore={fetchMoreRollouts}
          // Allow for scrolling in a flexbox layout
          flexGrow={1}
          height={0}
        >
          {rollouts.map((rollout, i) => (
            <Rollout
              last={i === len - 1}
              key={rollout.id}
              rollout={rollout}
            />
          ))}
        </InfiniteScroller>
      </Table>
    </Flex>
  )
}

export default RepositoryDeployments
