import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import moment from 'moment'
import { Box, Text } from 'grommet'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import { Logs, SecondaryButton } from 'forge-core'
import { BeatLoader } from 'react-spinners'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import { Chalk } from 'xterm-theme'

import { appendConnection, extendConnection } from '../../utils/graphql'
import { SectionContext, SectionPortal } from '../Explore'
import { StandardScroller } from '../utils/SmoothScroller'

import { ModalHeader } from '../ModalHeader'

import { Icon } from '../accounts/Group'

import { TestStatus } from './constants'
import { HeaderItem } from './Docker'
import { LOGS_SUB, TESTS_Q, TESTS_SUB, TEST_LOGS } from './queries'

const ROW_HEIGHT = '50px'
const colors = {
  QUEUED: 'light-4',
  RUNNING: 'progress',
  SUCCEEDED: 'good',
  FAILED: 'error',
}

const statusDescription = s => s.toLowerCase()

function Status({ width, status }) {
  return (
    <Box
      width={width}
      justify="start"
      direction="row"
    >
      <Box
        flex={false}
        pad={{ horizontal: 'small', vertical: 'xsmall' }}
        background={colors[status] || 'light-4'}
        direction="row"
        gap="xsmall"
        align="center"
        round="xsmall"
      >
        {status === TestStatus.RUNNING && (
          <BeatLoader
            size={5}
            margin={2}
            color="white"
          />
        )}
        <Text size="small">{statusDescription(status)}</Text>
      </Box>
    </Box>
  )
}

function Test({ test: { status, name, insertedAt, updatedAt, promoteTag }, setTest }) {
  return (
    <Box
      pad="small"
      flex={false}
      direction="row"
      gap="xsmall"
      onClick={setTest}
      hoverIndicator="tone-light"
      height={ROW_HEIGHT}
      align="center"
      border={{ side: 'bottom' }}
    >
      <HeaderItem
        text={promoteTag}
        width="10%"
      />
      <HeaderItem
        text={name || '<unspecified>'}
        width="20%"
      />
      <HeaderItem
        text={moment(insertedAt).format('lll')}
        width="20%"
        nobold
      />
      <HeaderItem
        text={updatedAt && moment(updatedAt).format('lll')}
        width="30%"
        nobold
      />
      <Status
        width="20%"
        status={status}
      />
    </Box>
  )
}

async function fetchLogs(client, id, step, term) {
  const { data } = await client.query({ query: TEST_LOGS, variables: { id, step } })
  if (data && data.testLogs) {
    const lines = data.testLogs.split(/\r?\n/)
    for (const l of lines) {
      term.writeln(l)
    }
  }
}

function TestLogs({ step: { name, id, hasLogs }, testId, close }) {
  const client = useApolloClient()
  const xterm = useRef(null)
  const fitAddon = useMemo(() => new FitAddon(), [])
  const { data } = useSubscription(LOGS_SUB, {
    variables: { testId },
  })

  useEffect(() => {
    console.log(xterm)
    if (!xterm || !xterm.current || !xterm.current.terminal) return
    xterm.current.terminal.setOption('disableStdin', true)
    fitAddon.fit()
    console.log('joining test channel')

    if (data && data.testLogs && data.testLogs.step.id == id) { // eslint-disable-line
      for (const l of data.testLogs.logs) {
        xterm.current.terminal.writeln(l)
      }
    }
  }, [id, data, xterm, fitAddon])

  useEffect(() => {
    if (!hasLogs || !xterm || !xterm.current || !xterm.current.terminal) return
    const term = xterm.current.terminal
    term.clear()
    fetchLogs(client, testId, id, term)
  }, [hasLogs, client, testId, id, xterm])

  return (
    <Box
      fill="horizontal"
      height="500px"
    >
      <ModalHeader
        text={`${name} step logs`}
        setOpen={close}
      />
      <Box
        fill
        background={Chalk.background}
        pad="small"
        style={{ overflow: 'auto' }}
      >
        <XTerm
          ref={xterm}
          addons={[fitAddon]}
          options={{ theme: Chalk }}
          onResize={console.log}
          onData={console.log}
        />
      </Box>
    </Box>
  )
}

function Step({ step: { status, insertedAt, updatedAt, name, description, ...rest }, testId }) {
  const [open, setOpen] = useState(false)

  return (
    <Box border={{ side: 'bottom' }}>
      <Box
        pad="small"
        flex={false}
        direction="row"
        gap="xsmall"
        height={ROW_HEIGHT}
        align="center"
      >
        <HeaderItem
          text={name}
          width="20%"
        />
        <HeaderItem
          text={description}
          width="30%"
          nobold
        />
        <HeaderItem
          text={moment(updatedAt || insertedAt).format('lll')}
          width="20%"
          nobold
        />
        <Box
          width="10%"
          justify="start"
          direction="row"
        >
          <Icon
            icon={Logs}
            onClick={() => setOpen(true)}
          />
        </Box>
        <Status
          width="20%"
          status={status}
        />
      </Box>
      {open && (
        <TestLogs
          step={{ name, ...rest }}
          testId={testId}
          close={() => setOpen(false)}
        />
      )}
    </Box>
  )
}

function TestDetails({ test: { steps, id }, setTest }) {
  const { setHeader } = useContext(SectionContext)

  useEffect(() => {
    setHeader(`Test ${id}`)

    return () => {
      setHeader('Tests')
    }
  }, [id, setHeader])

  return (
    <>
      <Box
        fill
        flex={false}
        style={{ overflow: 'auto' }}
      >
        <TestStepHeader />
        {steps.map(step => (
          <Step
            key={step.id}
            testId={id}
            step={step}
          />
        ))}
      </Box>
      <SectionPortal>
        <SecondaryButton
          label="Return"
          onClick={() => setTest(null)}
        />
      </SectionPortal>
    </>
  )
}

function TestStepHeader() {
  return (
    <Box
      flex={false}
      pad="small"
      direction="row"
      gap="xsmall"
      height={ROW_HEIGHT}
      align="center"
      border={{ side: 'bottom' }}
    >
      <HeaderItem
        text="Name"
        width="20%"
      />
      <HeaderItem
        text="Description"
        width="30%"
      />
      <HeaderItem
        text="last updated"
        width="20%"
      />
      <HeaderItem
        text="logs"
        width="10%"
      />
      <HeaderItem
        text="progress"
        width="20%"
      />
    </Box>
  )
}

function TestHeader() {
  return (
    <Box
      flex={false}
      pad="small"
      direction="row"
      gap="xsmall"
      height={ROW_HEIGHT}
      align="center"
      border={{ side: 'bottom' }}
    >
      <HeaderItem
        text="Promote To"
        width="10%"
      />
      <HeaderItem
        text="Name"
        width="20%"
      />
      <HeaderItem
        text="created on"
        width="20%"
      />
      <HeaderItem
        text="last updated"
        width="30%"
      />
      <HeaderItem
        text="progress"
        width="20%"
      />
    </Box>
  )
}

export function RepositoryTests({ repository: { id: repositoryId } }) {
  const [listRef, setListRef] = useState(null)
  const [test, setTest] = useState(null)
  const { data, loading, subscribeToMore, fetchMore } = useQuery(TESTS_Q, {
    variables: { repositoryId },
    fetchPolicy: 'cache-and-network',
  })

  useEffect(() => subscribeToMore({
    document: TESTS_SUB,
    variables: { repositoryId },
    updateQuery: (prev, { subscriptionData: { data: { testDelta: { delta, payload } } } }) => delta === 'CREATE' ? appendConnection(prev, payload, 'tests') : prev,
  }), [repositoryId, subscribeToMore])

  if (!data) return null

  const { edges, pageInfo } = data.tests

  if (test) {
    return (
      <TestDetails
        test={edges.find(({ node: { id } }) => id === test.id).node} // to receive cache updates
        setTest={setTest}
      />
    )
  }

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
          mapper={({ node }) => (
            <Test
              test={node}
              setTest={() => setTest(node)}
            />
          )}
          loadNextPage={() => pageInfo.hasNextPage && fetchMore({
            variables: { cursor: pageInfo.endCursor },
            updateQuery: (prev, { fetchMoreResult: { tests } }) => extendConnection(prev, tests, 'tests'),
          })}
        />
      </Box>
    </Box>
  )
}
