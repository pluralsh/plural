import { Box, Layer, Text } from 'grommet'
import moment from 'moment'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from 'react-apollo'
import { SecondaryButton, Logs } from 'forge-core'
import { BeatLoader } from 'react-spinners'
import { appendConnection, extendConnection } from '../../utils/graphql'
import { SectionContext, SectionPortal } from '../Explore'
import { StandardScroller } from '../utils/SmoothScroller'
import { TestStatus } from './constants'
import { HeaderItem } from './Docker'
import { TESTS_Q, TESTS_SUB } from './queries'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import { Chalk } from 'xterm-theme'

import { socket } from '../../helpers/client'
import { ModalHeader } from '../utils/ModalHeader'
import { Icon } from '../accounts/Group'

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

function Test({test: {status, name, insertedAt, updatedAt, promoteTag}, setTest}) {
  return (
    <Box pad='small' flex={false} direction='row' gap='xsmall' onClick={setTest} hoverIndicator='tone-light'
         height={ROW_HEIGHT} align='center' border={{side: 'bottom'}}>
      <HeaderItem text={promoteTag} width='10%' />
      <HeaderItem text={name || '<unspecified>'} width='20%' />
      <HeaderItem text={moment(insertedAt).format('lll')} width='20%' nobold />
      <HeaderItem text={updatedAt && moment(updatedAt).format('lll')} width='30%' nobold />
      <Status width='20%' status={status} />
    </Box>
  )
}

function TestLogs({channel, step: {name, id}, close}) {
  const xterm = useRef(null)
  const fitAddon = useMemo(() => new FitAddon(), [])
  useEffect(() => {
    if (!xterm || !xterm.current || !xterm.current.terminal) return
    const term = xterm.current.terminal
    fitAddon.fit()
    channel && channel.on("stdo", ({ line, step }) => {
      console.log({line, step})
      step === id && term.write(line)
    })
  }, [xterm, fitAddon, channel])

  return (
    <Layer modal onEsc={close} onClickOutside={close}>
      <Box width='60vw' height='60vh'>
        <ModalHeader text={`${name} step logs`} setOpen={close} />
        <Box fill background={Chalk.background}>
          <XTerm 
            className="log-term"
            ref={xterm}
            addons={[fitAddon]}
            options={{ theme: Chalk }}
          />
        </Box>
      </Box>
    </Layer>
  )
}

function Step({step: {status, insertedAt, updatedAt, name, description, ...rest}, channel}) {
  const [open, setOpen] = useState(false)

  return (
    <>
    <Box pad='small' flex={false} direction='row' gap='xsmall' height={ROW_HEIGHT} align='center' border={{side: 'bottom'}}>
      <HeaderItem text={name} width='20%' />
      <HeaderItem text={description} width='30%' nobold />
      <HeaderItem text={moment(updatedAt || insertedAt).format('lll')} width='20%' nobold />
      <Box width='10%' justify='start' direction='row'>
        <Icon icon={Logs} onClick={() => setOpen(true)} />
      </Box>
      <Status width='20%' status={status} />
    </Box>
    {open && <TestLogs step={{name, ...rest}} channel={channel} close={() => setOpen(false)} />}
    </>
  )
}

function TestDetails({test: {steps, id}, setTest}) {
  const {setHeader} = useContext(SectionContext)
  const [channel, setChannel] = useState(null)

  useEffect(() => {
    setHeader(`Test ${id}`)
    const chan = socket.channel(`tests:${id}`, {})
    chan.onError(console.log)
    setChannel(chan)
    chan.join()
    return () => {
      chan.leave()
      setHeader('Tests')
    }
  }, [id])

  return (
    <>
    <Box fill>
      <TestStepHeader />
      {steps.map((step) => <Step key={step.id} step={step} channel={channel} />)}
    </Box>
    <SectionPortal>
      <SecondaryButton label='Return' onClick={() => setTest(null)} />
    </SectionPortal>
    </>
  )
}

function TestStepHeader() {
  return (
    <Box flex={false} pad='small' direction='row' gap='xsmall' height={ROW_HEIGHT} align='center' border={{side: 'bottom'}}>
      <HeaderItem text='Name' width='20%' />
      <HeaderItem text='Description' width='30%' />
      <HeaderItem text='last updated' width='20%' />
      <HeaderItem text='logs' width='10%' />
      <HeaderItem text='progress' width='20%' />
    </Box>
  )
}

function TestHeader() {
  return (
    <Box flex={false} pad='small' direction='row' gap='xsmall' height={ROW_HEIGHT} align='center' border={{side: 'bottom'}}>
      <HeaderItem text='Promote To' width='10%' />
      <HeaderItem text='Name' width='20%' />
      <HeaderItem text='created on' width='20%' />
      <HeaderItem text='last updated' width='30%' />
      <HeaderItem text='progress' width='20%' />
    </Box>
  )
}

export function RepositoryTests({repository: {id: repositoryId}}) {
  const [listRef, setListRef] = useState(null)
  const [test, setTest] = useState(null)
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

  if (test) return <TestDetails test={test} setTest={setTest} />

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
          mapper={({node}) => <Test test={node} setTest={() => setTest(node)} />} 
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: {cursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult: {tests}}) => extendConnection(prev, tests, 'tests')
          })} />
      </Box>
    </Box>
  )
}