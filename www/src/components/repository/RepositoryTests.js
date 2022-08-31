import {
  useContext, useEffect, useMemo, useRef, useState,
} from 'react'
import { useApolloClient, useSubscription } from '@apollo/client'
import moment from 'moment'
import {
  Div, Flex, P, Span,
} from 'honorable'
import { XTerm } from 'xterm-for-react'
import { FitAddon } from 'xterm-addon-fit'
import {
  ArrowLeftIcon,
  Button,
  Chip,
  CollapseIcon,
  ErrorIcon,
  ListIcon,
  PageTitle,
  StatusIpIcon,
  StatusOkIcon,
} from 'pluralsh-design-system'

import RepositoryContext from '../../contexts/RepositoryContext'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'
import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'
import { LOGS_SUB, TEST_LOGS } from '../repos/queries'
import { Table, TableData, TableRow } from '../utils/Table'
import { XTermTheme } from '../../theme'

import { TESTS_QUERY } from './queries'
import { RepositoryActions } from './misc'

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
      borderColor="border-fill-two"
    >
      {status.toLowerCase()}
    </Chip>
  )
}

async function fetchLogs(
  client, id, step, term
) {
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
    if (!xterm || !xterm.current || !xterm.current.terminal) return
    xterm.current.terminal.setOption('disableStdin', true)
    fitAddon.fit()

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
    fetchLogs(
      client, testId, id, term
    )
  }, [hasLogs, client, testId, id, xterm])

  return (
    <Div
      maxHeight="520px"
      borderColor="border-fill-two"
      margin="medium"
    >
      <Div
        backgroundColor="fill-two"
        padding="medium"
        borderRadius="large"
        border="1px solid border"
        borderColor="border-fill-two"
      >
        <XTerm
          className="test"
          ref={xterm}
          addons={[fitAddon]}
          options={{ theme: XTermTheme }}
          onResize={console.log}
          onData={console.log}
        />
      </Div>
    </Div>
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
        <P body2>{moment(test.insertedAt).format('MMM DD, YYYY')}</P>
        <P
          caption
          color="text-xlight"
        >{moment(test.insertedAt).format('hh:mm a')}
        </P>
      </TableData>
      <TableData>
        <P body2>{moment(test.updatedAt).format('MMM DD, YYYY')}</P>
        <P
          caption
          color="text-xlight"
        >{moment(test.updatedAt).format('hh:mm a')}
        </P>
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
      >
        <TableData>
          <CollapseIcon
            size={8}
            style={open ? {
              transform: 'rotate(270deg)',
              transitionDuration: '.2s',
              transitionProperty: 'transform',
            } : {
              transform: 'rotate(180deg)',
              transitionDuration: '.2s',
              transitionProperty: 'transform',
            }}
          />
        </TableData>
        <TableData>{step.name}</TableData>
        <TableData>{step.description}</TableData>
        <TableData>
          <P body2>{moment(step.updatedAt || step.insertedAt).format('MMM DD, YYYY')}</P>
          <P
            caption
            color="text-xlight"
          >{moment(step.updatedAt || step.insertedAt).format('hh:mm a')}
          </P>
        </TableData>
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
      <PageTitle
        heading="Tests"
        paddingTop="medium"
      />
      <Button
        secondary
        startIcon={(
          <ArrowLeftIcon size={16} />
        )}
        onClick={() => setTest(null)}
        justifyContent="start"
        marginBottom="medium"
      >
        Back
      </Button>
      <Table
        headers={['', 'Name', 'Description', 'Last updated', 'Status']}
        sizes={['5%', '10%', '50%', '15%', '20%']}
        background="fill-one"
        width="100%"
        heading={test.name}
        overflow="overlay"
      >
        <Div overflow="overlay">
          {test.steps.map((step, i) => (
            <TestStep
              key={`${step}-${i}`}
              step={step}
              last={i === len - 1}
              test={test}
            />
          ))}
        </Div>
      </Table>
    </>
  )
}

function RepositoryTests() {
  const { id } = useContext(RepositoryContext)
  const [test, setTest] = useState(null)
  const [tests, loadingTests, hasMoreTests, fetchMoreTests] = usePaginatedQuery(TESTS_QUERY,
    {
      variables: {
        repositoryId: id,
      },
    },
    data => data.tests)

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
    <Flex
      direction="column"
      flexGrow={1}
    >
      <PageTitle
        heading="Tests"
        paddingTop="medium"
      >
        <Flex display-desktop-up="none"><RepositoryActions /></Flex>
      </PageTitle>
      <Flex
        direction="column"
        flexGrow={1}
        marginBottom="xlarge"
      >
        {tests?.length ? (
          <Table
            headers={['Promote to', 'Name', 'Created on', 'Last updated', 'Status']}
            sizes={['15%', '35%', '15%', '15%', '20%']}
            background="fill-one"
            width="100%"
            height="100%"
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
              {Array.from(new Set(tests)).map((test, id) => (
                <Test
                  key={`${test.id}${id}`}
                  test={test}
                  setTest={setTest}
                />
              ))}
            </InfiniteScroller>
          </Table>
        ) : <Span>This repository does not have any tests yet.</Span>}
      </Flex>
    </Flex>
  )
}

export default RepositoryTests
