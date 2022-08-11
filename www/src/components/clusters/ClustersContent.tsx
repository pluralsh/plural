import { useQuery } from '@apollo/client'
import { Flex, P } from 'honorable'
import moment from 'moment'
import { Button, Chip, PageTitle } from 'pluralsh-design-system'
import {
  ReactElement, useContext, useEffect, useState,
} from 'react'

import QueueContext from '../../contexts/QueueContext'
import { appendConnection, extendConnection } from '../../utils/graphql'
import { RepoIcon } from '../repos/Repositories'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { StandardScroller } from '../utils/SmoothScroller'

import { QUEUE, UPGRADE_SUB } from './queries'

export interface Upgrade {
  id: string;
  insertedAt: string;
  message: string;
  repository: Repository;
}

interface Repository {
  id: string;
  name: string;
  category: string;
  darkIcon: string;
  icon: string;
  description: string;
}

export function ClustersContent(): ReactElement | null {
  const queue = useContext(QueueContext)

  const {
    data, loading, fetchMore, subscribeToMore, refetch,
  } = useQuery(QUEUE, {
    variables: { id: queue.id },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => subscribeToMore({
    document: UPGRADE_SUB,
    variables: { id: queue.id },
    updateQuery: ({ upgradeQueue, ...rest }, { subscriptionData: { data: { upgrade } } }) => ({
      ...rest,
      upgradeQueue: appendConnection(upgradeQueue, upgrade, 'upgrades'),
    }),
  }), [queue.id, subscribeToMore])

  if (!data) {
    return (
      <LoopingLogo
        nofill={false}
        darkbg={false}
        height={undefined}
        scale={undefined}
        dark={false}
        still={false}
      />
    )
  }

  return (
    <Flex
      grow={1}
      direction="column"
      paddingVertical="large"
    >
      <PageTitle
        heading="Upgrades"
      >
        <Button
          secondary
          marginRight={1} // Compensate for the border when focused
          onClick={() => refetch()}
        >Refresh
        </Button>
      </PageTitle>
      <UpgradesList
        upgrades={data.upgradeQueue?.upgrades}
        loading={loading}
        fetchMore={fetchMore}
      />
    </Flex>
  )
}

function UpgradesList({
  upgrades, loading, fetchMore,
}): ReactElement {
  const [listRef, setListRef] = useState(null)
  const { edges, pageInfo, acked } = upgrades

  return (
    <Flex
      grow={1}
      backgroundColor="fill-one"
      color="text-light"
      border="1px solid border"
      borderRadius="large"
      paddingRight="xxxsmall"
    >
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        hasNextPage={pageInfo.hasNextPage}
        items={edges}
        loading={loading}
        mapper={({ node }, { next }) => (
          <UpgradeItem
            key={node.id}
            upgrade={node as Upgrade}
            acked={acked}
            last={!next.node}
          />
        )}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { upgradeQueue: { upgrades } } }) => ({
            ...prev, upgradeQueue: extendConnection(prev.upgradeQueue, upgrades, 'upgrades'),
          }),
        })}
        placeholder={undefined}
        handleScroll={undefined}
        refreshKey={undefined}
        setLoader={undefined}
      />
    </Flex>
  )
}

function UpgradeItem({ upgrade, acked, last }: { upgrade: Upgrade, acked: string, last: boolean }): ReactElement | null {
  const delivered = acked && upgrade.id <= acked
  const severity = delivered ? 'success' : 'neutral'

  return (
    <Flex
      borderBottom={last ? null : '1px solid border'}
      padding="medium"
    >
      <RepoIcon
        repo={upgrade.repository}
        size="48px"
        round=""
      />
      <Flex
        direction="column"
        paddingLeft={12}
        gap={4}
        justify="center"
      >
        <Flex
          body1
          direction="row"
          gap={8}
        >
          <P color="text">{upgrade.repository.name}</P>
          <P color="text-xlight">{moment(upgrade.insertedAt).format('lll')}</P>
        </Flex>
        <P
          body2
          color="text-light"
        >{upgrade.message}
        </P>
      </Flex>
      <Flex grow={1} />
      <Chip
        alignSelf="center"
        size="large"
        severity={severity}
        hue="lighter"
      >
        {delivered ? 'Delivered' : 'Pending'}
      </Chip>
    </Flex>
  )
}
