import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from 'react-apollo'
import { Box, Text } from 'grommet'
import { LazyLog } from 'react-lazylog'
import { BUILD_Q, COMMAND_SUB, BUILD_SUB } from './graphql/builds'
import Loading from './utils/Loading'
import ScrollableContainer from './utils/ScrollableContainer'
import { mergeEdges } from './graphql/utils'
import moment from 'moment'
import { Checkmark, StatusCritical } from 'grommet-icons'
import { BeatLoader } from 'react-spinners'

function TimerInner({insertedAt, completedAt}) {
  const end = completedAt ? moment(completedAt) : moment()
  const begin = moment(insertedAt)
  const fromBeginning = (dt) =>  moment.duration(dt.diff(begin))
  const duration = fromBeginning(end)
  return (
    <pre>
      {moment.utc(duration.as('milliseconds')).format('HH:mm:ss')}
    </pre>
  )
}

function Timer({insertedAt, completedAt}) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (completedAt) return
    setTimeout(() => setTick(tick + 1), 1000)
  }, [completedAt, tick, setTick])

  return <TimerInner tick={tick} insertedAt={insertedAt} completedAt={completedAt} />
}

function BuildTimer({insertedAt, completedAt, status}) {
  const background = status === "SUCCESSFUL" ? 'status-ok' : (status === 'FAILED' ? 'status-error' : 'progress')
  return (
    <Box pad='xsmall' background={background}>
      <Timer insertedAt={insertedAt} completedAt={completedAt} />
    </Box>
  )
}

const countLines = (str) => (str.match(/\n/g) || '').length + 1

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
  if (!exitCode && exitCode !== 0) return (
    <Box width='40px' direction='row'>
      <BeatLoader size={5} />
    </Box>
  )

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
          <pre>==> {command.command}</pre>
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
  if (data.buildDelta) {
    return {...prev, build: {...prev, ...data.buildDelta.payload}}
  }

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
  useEffect(() => {
    const first = subscribeToMore({document: COMMAND_SUB, variables: {buildId}, updateQuery})
    const second = subscribeToMore({document: BUILD_SUB, variables: {buildId}, updateQuery})
    return () => {
      first()
      second()
    }
  }, [buildId, subscribeToMore])

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