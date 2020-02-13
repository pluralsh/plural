import React from 'react'
import { useQuery } from 'react-apollo'
import { BUILDS_Q } from './graphql/builds'
import Loading from './utils/Loading'
import { Box, Text } from 'grommet'
import moment from 'moment'

function BuildStatusInner({background, text}) {
  return (
    <Box pad='xsmall' round='xsmall' background={background}>
      <Text size='small'>{text}</Text>
    </Box>
  )
}

function BuildStatus({status}) {
  switch (status) {
    case "QUEUED":
      return <BuildStatusInner background='status-unknown' text='queued' />
    case "RUNNING":
      return <BuildStatusInner background='status-warning' text='running' />
    case "FAILED":
      return <BuildStatusInner background='status-error' text='failed' />
    case "SUCCESSFUL":
      return <BuildStatusInner background='status-ok' text='successful' />
    default:
      return null
  }
}

function Build({build: {repository, status, insertedAt}}) {
  return (
    <Box border pad='small' direction='row' align='center'>
      <Box fill='horizontal'>
        <Text size='small' weight='bold'>{repository}</Text>
        <Text size='small' color='dark-3'>Started: {moment(insertedAt).fromNow()}</Text>
      </Box>
      <BuildStatus status={status} />
    </Box>
  )
}

export default function Builds() {
  const {data, loading} = useQuery(BUILDS_Q)

  if (loading || !data) return <Loading />

  const {edges} = data.builds
  return (
    <Box gap='small' pad='medium'>
      {edges.map(({node}) => <Build key={node.id} build={node} />)}
    </Box>
  )
}