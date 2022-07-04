import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import moment from 'moment'
import { Flex, Span } from 'honorable'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import { Chalk } from 'xterm-theme'

import { Box } from 'grommet'

import { Chip, ErrorIcon, ListIcon, StatusIpIcon, StatusOkIcon } from 'pluralsh-design-system'

import { Return } from 'grommet-icons'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { LOGS_SUB, TEST_LOGS } from '../repos/queries'

import { Table, TableData, TableRow } from '../utils/Table'

import { Icon } from '../profile/Icon'

import { TESTS_QUERY } from './queries'

const statusAttrs = {
  QUEUED: { severity: 'neutral', icon: <StatusIpIcon /> },
  RUNNING: { severity: 'info', loading: true },
  SUCCEEDED: { severity: 'success', icon: <StatusOkIcon /> },
  FAILED: { severity: 'error', icon: <ErrorIcon /> },
}

function Status({ status }) {
  return (
    <Chip
      {...statusAttrs[status]}
      backgroundColor="fill-two"
    >
      {status.toLowerCase()}
    </Chip>
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

function TestLogs({ step: { id, hasLogs }, testId }) {
  const client = useApolloClient()
  const xterm = useRef(null)
  const fitAddon = useMemo(() => new FitAddon(), [])
  const { data } = useSubscription(LOGS_SUB, {
    variables: { testId },
  })

  useEffect(() => {
    // console.log(xterm)
    if (!xterm || !xterm.current || !xterm.current.terminal) return
    xterm.current.terminal.setOption('disableStdin', true)
    fitAddon.fit()
    // console.log('joining test channel')

    if (data && data.testLogs && data.testLogs.step.id === id) {
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
      height="520px"
      pad="small"
      border={{ side: 'bottom' }}
    >
      <Box
        style={{ overflow: 'auto' }}
        fill
        background={Chalk.background}
        pad="small"
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

function Test({ test, last, setTest }) {
  return (
    <TableRow
      last={last}
      hoverIndicator="fill-one-hover"
      onClick={() => setTest(test)}
      cursor="pointer"
      suffix={<ListIcon size={16} />}
    >
      <TableData>
        {test.promoteTag}
      </TableData>
      <TableData>
        {test.name}
      </TableData>
      <TableData>
        {moment(test.insertedAt).format('MMMM Do YYYY, h:mm:ss a')}
      </TableData>
      <TableData>
        {moment(test.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}
      </TableData>
      <TableData>
        <Status status={test.status} />
      </TableData>
    </TableRow>
  )
}

function TestStep({ step, test, last }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <TableRow
        last={open || last}
        onClick={() => setOpen(!open)}
        hoverIndicator="fill-one-hover"
        cursor="pointer"
        suffix={<ListIcon size={16} />}
      >
        <TableData>{step.name}</TableData>
        <TableData>{step.description}</TableData>
        <TableData>{moment(step.updatedAt || step.insertedAt).format('lll')}</TableData>
        <TableData><Status status={step.status} /></TableData>
      </TableRow>
      {open && (
        <TestLogs
          step={step}
          testId={test.id}
          close={() => setOpen(false)}
        />
      )}
    </>
  )
}

function TestDetail({ test, setTest }) {
  const len = test.steps.length

  return (
    <>
      <Flex
        align="center"
        border="1px solid border"
        backgroundColor="fill-one"
        paddingVertical="small"
        paddingHorizontal="medium"
        marginBottom="medium"
        borderRadius="large"
      >
        <Icon
          icon={(
            <Return size="15px" />
          )}
          onClick={() => setTest(null)}
        />
        <Span
          bold
          marginLeft="medium"
        >
          {test.name}
        </Span>
      </Flex>
      <Table
        headers={['Name', 'Description', 'Last Updated', 'Status']}
        sizes={['25%', '25%', '25%', '25%']}
        background="fill-one"
        width="100%"
        height="calc(100% - 16px - 16px - 53px)" // The previous node is 53px tall with a 16px marginBottom
      >
        {test.steps.map((step, i) => (
          <TestStep
            step={step}
            last={i === len - 1}
            test={test}
          />
        ))}
      </Table>
    </>
  )
}

function RepositoryTests() {
  const { id } = useContext(RepositoryContext)
  const [test, setTest] = useState(null)
  const [tests, loadingTests, hasMoreTests, fetchMoreTests] = usePaginatedQuery(
    TESTS_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.tests
  )

  if (tests.length === 0 && loadingTests) {
    return (
      <Flex
        pt={2}
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  if (test) {
    return (
      <TestDetail
        test={test}
        setTest={setTest}
      />
    )
  }

  return (
    <Table
      headers={['Promote To', 'Name', 'Created On', 'Last Updated On', 'Progress']}
      sizes={['20%', '20%', '20%', '20%', '20%']}
      background="fill-one"
      width="100%"
      height="calc(100% - 16px)"
    >
      <InfiniteScroller
        pb={4}
        loading={loadingTests}
        hasMore={hasMoreTests}
        loadMore={fetchMoreTests}
          // Allow for scrolling in a flexbox layout
        flexGrow={1}
        height={0}
      >
        {tests.map(test => (
          <Test
            key={test.id}
            test={test}
            setTest={setTest}
          />
        ))}
      </InfiniteScroller>
    </Table>
  )
}

export default RepositoryTests
