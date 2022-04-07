import { Box, Text } from 'grommet'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useQuery } from 'react-apollo'
import { BeatLoader } from 'react-spinners'
import { appendConnection, extendConnection } from '../../utils/graphql'
import { StandardScroller } from '../utils/SmoothScroller'
import { TestStatus } from './constants'
import { HeaderItem } from './Docker'
import { TESTS_Q, TESTS_SUB } from './queries'


const ROW_HEIGHT = '50px'
const colors = {
  'QUEUED': 'light-4',
  'RUNNING': 'progress',
  'SUCCEEDED': 'good',
  'FAILED': 'error'
}

const statusDescription = (s) => s.toLowerCase() 

function Status({width, status}) {
  return (
    <Box width={width} justify='start' direction='row'>
      <Box flex={false} pad={{horizontal: 'small', vertical: 'xsmall'}} background={colors[status] || 'light-4'} 
           direction='row' gap='xsmall' align='center' round='xsmall'>
        {status === TestStatus.RUNNING && <BeatLoader size={5} margin={2} color='white' />}
        <Text size='small'>{statusDescription(status)}</Text>
      </Box>
    </Box>
  )
}

function Test({test: {status, insertedAt, updatedAt, promoteTag}}) {
  return (
    <Box pad='small' flex={false} direction='row' gap='xsmall' height={ROW_HEIGHT} align='center' border={{side: 'bottom'}}>
      <HeaderItem text={promoteTag} width='20%' />
      <HeaderItem text={moment(insertedAt).format('lll')} width='30%' nobold />
      <HeaderItem text={updatedAt && moment(updatedAt).format('lll')} width='30%' nobold />
      <Status width='20%' status={status} />
    </Box>
  )
}

function TestHeader() {
  return (
    <Box flex={false} pad='small' direction='row' gap='xsmall' height={ROW_HEIGHT} align='center' border={{side: 'bottom'}}>
      <HeaderItem text='Promote To' width='20%' />
      <HeaderItem text='created on' width='30%' />
      <HeaderItem text='last updated' width='30%' />
      <HeaderItem text='progress' width='20%' />
    </Box>
  )
}

export function RepositoryTests({repository: {id: repositoryId}}) {
  const [listRef, setListRef] = useState(null)
  const {data, loading, subscribeToMore, fetchMore} = useQuery(TESTS_Q, {
    variables: {repositoryId},
    fetchPolicy: 'cache-and-network'
  })

  useEffect(() => subscribeToMore({
    document: TESTS_SUB,
    variables: {repositoryId},
    updateQuery: (prev, {subscriptionData: {data: {testDelta: {delta, payload}}}}) => {
      return delta === 'CREATE' ? appendConnection(prev, payload, 'tests') : prev
    }
  }), [repositoryId])

  if (!data) return null

  const {edges, pageInfo} = data.tests

  return (
    <Box fill>
      <TestHeader />
      <Box fill>
        <StandardScroller
          listRef={listRef}
          setListRef={setListRef}
          refreshKey={repositoryId}
          hasNextPage={pageInfo.hasNextPage}
          items={edges}
          loading={loading} 
          mapper={({node}) => <Test test={node} />} 
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {tests}}) => extendConnection(prev, tests, 'tests')
          })} />
      </Box>
    </Box>
  )
}