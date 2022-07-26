import { useState } from 'react'
import { useQuery } from '@apollo/client'

import { Box } from 'grommet'

import moment from 'moment'

import { useOutletContext } from 'react-router-dom'

import { PageTitle } from 'pluralsh-design-system'

import { extendConnection } from '../../../utils/graphql'
import { StandardScroller } from '../../utils/SmoothScroller'

import { HeaderItem } from '../Docker'

import { DEFERRED_UPDATES } from '../queries'

import { LoopingLogo } from '../../utils/AnimatedLogo'

const ROW_HEIGHT = '50px'
const format = dt => moment(dt).format('lll')

function DeferredUpdateHeader() {
  return (
    <Box
      flex={false}
      direction="row"
      gap="xsmall"
      height={ROW_HEIGHT}
      align="center"
      border={{ side: 'bottom' }}
    >
      <HeaderItem
        text="version"
        width="30%"
      />
      <HeaderItem
        text="dequeueable at"
        width="30%"
      />
      <HeaderItem
        text="created"
        width="30%"
      />
      <HeaderItem
        text="attempts"
        width="10%"
      />
    </Box>
  )
}

function DeferredUpdate({ deferred }) {
  return (
    <Box
      pad="small"
      flex={false}
      direction="row"
      gap="xsmall"
      height={ROW_HEIGHT}
      align="center"
      border={{ side: 'bottom', color: 'border' }}
    >
      <HeaderItem
        text={deferred.version.version}
        width="30%"
      />
      <HeaderItem
        text={format(deferred.dequeueAt)}
        width="30%"
        nobold
      />
      <HeaderItem
        text={format(deferred.insertedAt)}
        width="30%"
        nobold
      />
      <HeaderItem
        text={deferred.attempts}
        width="10%"
        nobold
      />
    </Box>
  )
}

export default function PackageUpdateQueue() {
  const { helmChart, terraformChart } = useOutletContext()
  const chartInst = helmChart?.installation?.id
  const tfInst = terraformChart?.installation?.id

  const [listRef, setListRef] = useState(null)
  const { data, loading, fetchMore } = useQuery(DEFERRED_UPDATES, {
    variables: { chartInst, tfInst },
    fetchPolicy: 'cache-and-network',
  })

  if (!data) return <LoopingLogo />

  const { edges, pageInfo } = data.deferredUpdates

  return (
    <Box
      fill
      flex={false}
      pad="medium"
      gap="small"
    >
      <PageTitle heading="Update queue" />
      <DeferredUpdateHeader />
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        refreshKey={chartInst || tfInst}
        hasNextPage={pageInfo.hasNextPage}
        items={edges}
        loading={loading}
        mapper={({ node }) => <DeferredUpdate deferred={node} />}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { deferredUpdates } }) => (
            extendConnection(prev, deferredUpdates, 'deferredUpdates')
          ),
        })}
      />
    </Box>
  )
}
