import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-apollo'
import { Box, Text } from 'grommet'
import { LazyLog } from 'react-lazylog'
import { BUILD_Q, BUILD_SUB, COMMAND_SUB } from './graphql/builds'
import Loading from './utils/Loading'
import ScrollableContainer from './utils/ScrollableContainer'
import { mergeList, mergeEdges } from './graphql/utils'
import moment from 'moment'
import { reverse } from '../utils/array'
import { Checkmark, StatusCritical } from 'grommet-icons'
import { BounceLoader } from 'react-spinners'

function Timer({insertedAt, completedAt}) {
  const end = completedAt ? moment(completedAt) : moment()
  const begin = moment(insertedAt)
  const [duration, setDuration] = useState(moment.duration(end.diff(begin)))
  useEffect(() => {
    if (completedAt) {
      setDuration(moment.duration(moment(completedAt).diff(begin)))
      return
    }

    const interval = setInterval(() => setDuration(moment.duration(moment().diff(begin))), 1000)
    return () => clearInterval(interval)
  }, [insertedAt, completedAt])

  return <Text size='small'>{moment.utc(duration.as('milliseconds')).format('HH:mm:SS')}</Text>
}

function BuildTimer({insertedAt, completedAt, status}) {
  const background = status === "SUCCESSFUL" ? 'status-ok' : (status === 'FAILED' ? 'status-error' : 'running')
  return (
    <Box pad='xsmall' background={background}>
      <Timer insertedAt={insertedAt} completedAt={completedAt} />
    </Box>
  )
}

const countLines = (str) => (str.match(/\n/g) || '').length + 1

function exitCodeToStatus(code) {
  if (code === 0) return "SUCCESSFUL"
  if (!code) return "RUNNING"
  return "FAILED"
}

function ExitStatusInner({exitCode}) {
  const success = exitCode === 0
  return (
    <Box direction='row' align='center' gap='xsmall'>
      {success ? <Checkmark color='status-ok' size='12px' /> : <StatusCritical size='12px' />}
      {success ? <Text size='small' color='green'>OK</Text> : <Text size='small'>exit code: {exitCode}</Text>}
    </Box>
  )
}

function ExitStatus({exitCode}) {
  const background = exitCode !== 0 ? 'status-error' : null
  if (!exitCode && exitCode !== 0) return <Box width='40px'><BounceLoader size={8} /></Box>

  return (
    <Box pad='xsmall' background={background} align='center'>
      <ExitStatusInner exitCode={exitCode} />
    </Box>
  )
}

function Command({command}) {
  return (
    <Box margin={{bottom: 'small'}}>
      <Box direction='row' gap='small' elevation='small' background='light-3' pad='xsmall' align='center'>
        <Box fill='horizontal' direction='row' gap='small' align='center'>
          <pre>~> {command.command}</pre>
          <ExitStatus exitCode={command.exitCode} />
        </Box>
        <Timer
          insertedAt={command.insertedAt}
          completedAt={command.completedAt} />
      </Box>
      <div style={{height: Math.min(countLines(command.stdout || '') * 20, 300)}}>
        {command.stdout && <LazyLog text={command.stdout} follow extraLines={1} />}
      </div>
    </Box>
  )
}

function updateQuery(prev, {subscriptionData: {data}}) {
  if (!data) return prev
  const {commandDelta: {delta, payload}} = data
  const {commands: {edges, ...rest}, ...build} = prev.build
  return {
    ...prev,
    build: {
      ...build,
      commands: {...rest, edges: mergeEdges(edges, delta, payload, 'CommandEdge', 'append')}
  }}
}

export default function Build() {
  const {buildId} = useParams()
  const {data, loading, subscribeToMore} = useQuery(BUILD_Q, {variables: {buildId}})
  useEffect(() => subscribeToMore({document: COMMAND_SUB, variables: {buildId}, updateQuery}), [])

  if (!data || loading) return <Loading />
  const {commands: {edges}, ...build} = data.build
  return (
    <Box height='100vh' pad={{bottom: 'small'}}>
      <ScrollableContainer>
        <Box margin={{horizontal: 'medium'}}>
        <Box direction='row' align='center' pad='small'>
          <Box fill='horizontal'>
            <Text size='small' weight='bold'>{build.repository}</Text>
          </Box>
          <BuildTimer insertedAt={build.insertedAt} completedAt={build.completedAt} status={build.status} />
        </Box>
        {edges.map(({node}) => <Command key={node.id} command={node} />)}
        </Box>
      </ScrollableContainer>
    </Box>
  )
}