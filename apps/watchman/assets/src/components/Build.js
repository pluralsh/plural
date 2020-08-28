import React, { useEffect, useState, useContext, useRef } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { useQuery, useMutation } from 'react-apollo'
import { ScrollableContainer, Modal, ModalHeader, Button, Loading } from 'forge-core'
import { Box, Text, Layer } from 'grommet'
import Line from 'react-lazylog/build/Line'
import { ansiparse } from './utils/ansi'
import { BUILD_Q, COMMAND_SUB, BUILD_SUB, CREATE_BUILD, CANCEL_BUILD } from './graphql/builds'
import { mergeEdges } from './graphql/utils'
import moment from 'moment'
import { Checkmark, StatusCritical } from 'grommet-icons'
import { BeatLoader } from 'react-spinners'
import { BreadcrumbsContext } from './Breadcrumbs'
import './build.css'

 const HEADER_PADDING = {horizontal: 'medium', vertical: 'small'}

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
    <Box flex={false} pad={HEADER_PADDING} border='left' height='65px' justify='center' align='center'>
      <Box flex={false} pad='xsmall' background={background}>
        <Timer
          insertedAt={insertedAt}
          completedAt={completedAt}
          status={statusLabel} />
      </Box>
    </Box>
  )
}

function Rebuild({build: {repository, message, type}}) {
  let history = useHistory()
  const [open, setOpen] = useState(false)
  const [mutation, {loading}] = useMutation(CREATE_BUILD, {
    variables: {attributes: {repository, message, type}},
    onCompleted: ({createBuild: {id}}) => history.push(`/build/${id}`)
  })

  return (
    <>
    <Box
      pad={HEADER_PADDING}
      hoverIndicator='light-3'
      onClick={() => setOpen(true)}
      border='left'
      height='65px'
      justify='center'
      align='center'>
      <Text size='small'>restart</Text>
    </Box>
    {open && (
      <Layer modal>
        <Box width='40vw'>
          <ModalHeader text='Are you sure you want to restart this build?' setOpen={setOpen} />
          <Box direction='row' justify='end' pad='medium'>
            <Button label='restart' onClick={mutation} loading={loading} />
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

function Cancel({build: {id}}) {
  const [open, setOpen] = useState(false)
  const [mutation, {loading}] = useMutation(CANCEL_BUILD, {variables: {id}})

  return (
    <>
    <Box
      pad={HEADER_PADDING}
      hoverIndicator='light-3'
      onClick={() => setOpen(true)}
      border='left'
      height='65px'
      justify='center'
      align='center'>
      <Text size='small'>cancel</Text>
    </Box>
    {open && (
      <Layer modal>
        <Box width='40vw'>
          <ModalHeader text='Are you sure you want to cancel this build?' setOpen={setOpen} />
          <Box direction='row' justify='end' pad='medium'>
            <Button label='Cancel' onClick={mutation} loading={loading} />
          </Box>
        </Box>
      </Layer>
    )}
    </>
  )
}

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

function LogLine({line, number}) {
  const lineRef = useRef()
  useEffect(() => {
    lineRef && lineRef.current && lineRef.current.scrollIntoView(true)
  }, [lineRef, line])

  return (
    <div ref={lineRef}>
      <Line data={ansiparse(line)} number={number} rowHeight={19} />
    </div>
  )
}

function Log({text}) {
  if (!text) return null

  const lines = text.match(/[^\r\n]+/g)
  const last = lines.length
  return (
    <div class='log'>
      {lines.map((line, ind) => <LogLine key={ind} line={line} number={ind + 1} last={last} />)}
    </div>
  )
}

function Command({command}) {
  const ref = useRef()
  const stdout = command.stdout
  useEffect(() => ref && ref.current && ref.current.scrollIntoView(), [ref])

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
      <Log text={stdout} follow />
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
    <>
      <Box
        flex={false}
        direction='row'
        align='center'
        border='bottom'>
        <Box fill='horizontal' pad={HEADER_PADDING}>
          <Text size='small' weight='bold'>{build.repository}</Text>
          <Text size='small' color='dark-3'>{build.message}</Text>
        </Box>
        <BuildTimer insertedAt={build.insertedAt} completedAt={build.completedAt} status={build.status} />
        <Rebuild build={build} />
        <Cancel build={build} />
      </Box>
      <div style={{height: 'calc(100vh-100px)', overflow: 'auto', backgroundColor: '#222222', paddingBottom: '19px'}}>
        <ScrollableContainer>
          {edges.map(({node}) => <Command key={node.id} command={node} />)}
        </ScrollableContainer>
      </div>
    </>
  )
}