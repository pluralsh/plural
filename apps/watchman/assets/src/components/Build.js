import React, { useEffect, useState, useContext, useRef } from 'react'
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
import { BreadcrumbsContext } from './Breadcrumbs'

function TimerInner({insertedAt, completedAt, status}) {
  const end = completedAt ? moment(completedAt) : moment()
  const begin = moment(insertedAt)
  const fromBeginning = (dt) =>  moment.duration(dt.diff(begin))
  const duration = fromBeginning(end)
  return (
    <pre>
      {status}{moment.utc(duration.as('milliseconds')).format('HH:mm:ss')}
    </pre>
  )
}

function Timer({insertedAt, completedAt, status}) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    if (completedAt) return
    setTimeout(() => setTick(tick + 1), 1000)
  }, [completedAt, tick, setTick])

  return <TimerInner
    tick={tick}
    insertedAt={insertedAt}
    completedAt={completedAt}
    status={status} />
}

function BuildTimer({insertedAt, completedAt, status}) {
  const background = status === "SUCCESSFUL" ? 'success' : (status === 'FAILED' ? 'error' : 'progress')
  const statusLabel = status === 'SUCCESSFUL' ? 'Passed, ' : (status === 'FAILED' ? 'Failed, ' : null)
  return (
    <Box flex={false} pad='xsmall' background={background}>
      <Timer
        insertedAt={insertedAt}
        completedAt={completedAt}
        status={statusLabel} />
    </Box>
  )
}

const countLines = (str) => (str.match(/\n/g) || '').length + 1

function ExitStatusInner({exitCode}) {
  const success = exitCode === 0
  return (
    <Box direction='row' align='center' gap='xsmall'>
      {success ? <Checkmark color='success' size='12px' /> : <StatusCritical size='12px' />}
      {success ? <Text size='small' color='success'>OK</Text> : <Text size='small'>exit code: {exitCode}</Text>}
    </Box>
  )
}

function ExitStatus({exitCode}) {
  const background = exitCode !== 0 ? 'error' : null
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
  const ref = useRef()
  const stdout = command.stdout || 'No ouput...'
  useEffect(() => ref && ref.current && ref.current.scrollIntoView(true), [ref, command.stdout])

  return (
    <Box ref={ref}>
      <Box
        direction='row'
        gap='small'
        elevation='small'
        pad={{vertical: 'xxsmall', horizontal: 'medium'}}
        align='center'
        background='console'>
        <Box fill='horizontal' direction='row' gap='small' align='center'>
          <pre>==> {command.command}</pre>
          <ExitStatus exitCode={command.exitCode} />
        </Box>
        <Timer
          insertedAt={command.insertedAt}
          completedAt={command.completedAt} />
      </Box>
      <div style={{height: countLines(stdout || '') * 19}}>
        <LazyLog text={stdout} follow extraLines={1} />
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
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    setBreadcrumbs([
      {text: 'builds', url: '/'},
      {text: buildId, url: `/builds/${buildId}`}
    ])
  }, [buildId])

  useEffect(() => {
    const first = subscribeToMore({document: COMMAND_SUB, variables: {buildId}, updateQuery})
    const second = subscribeToMore({document: BUILD_SUB, variables: {buildId}, updateQuery})
    return () => {
      first()
      second()
    }
  }, [subscribeToMore])

  if (!data || loading) return <Loading />
  const {commands: {edges}, ...build} = data.build
  return (
    <>
      <Box
        flex={false}
        direction='row'
        align='center'
        pad={{horizontal: 'medium', vertical: 'small'}}
        border='bottom'>
        <Box fill='horizontal'>
          <Text size='small' weight='bold'>{build.repository}</Text>
          <Text size='small' color='dark-3'>{build.message}</Text>
        </Box>
        <BuildTimer insertedAt={build.insertedAt} completedAt={build.completedAt} status={build.status} />
      </Box>
      <div style={{height: 'calc(100vh-100px)', overflow: 'auto'}}>
        <ScrollableContainer>
          {edges.map(({node}) => <Command key={node.id} command={node} />)}
        </ScrollableContainer>
      </div>
    </>
  )
}