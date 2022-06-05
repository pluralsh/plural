import { useContext, useState } from 'react'
import { useSubscription } from '@apollo/client'
import moment from 'moment'
import { Flex, H2, H3, Modal, P, Span } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'
import InfiniteScroller from '../utils/InfiniteScroller'

import { TESTS_QUERY, TEST_LOGS_SUBSCRIPTION } from './queries'

const statusToColor = {
  QUEUED: 'fill-one',
  RUNNING: 'warning',
  SUCCEEDED: 'success',
  FAILED: 'error',
}

function Status({ status }) {
  return (
    <Span
      backgroundColor={statusToColor[status]}
      borderRadius={4}
      px={0.5}
      py={0.25}
    >
      {status}
    </Span>
  )
}

function TestLogsModal({ test, ...props }) {
  const { data, loading, error } = useSubscription(TEST_LOGS_SUBSCRIPTION, {
    variables: {
      testId: test.id,
    },
    skip: !props.open,
  })

  console.log('x', error, data, loading)

  function renderContent() {
    if (loading) {
      return (
        <Flex
          direction="row"
          justify="center"
        >
          <LoopingLogo />
        </Flex>
      )
    }

    return null
  }

  return (
    <Modal
      {...props}
    >
      <H3 mb={1}>
        {test.name}
      </H3>
      {renderContent()}
    </Modal>
  )
}

function Test({ test }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Flex
        borderBottom="1px solid border"
        hoverIndicator="fill-one"
        cursor="pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          {test.promoteTag}
        </P>
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          {test.name}
        </P>
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          {moment(test.insertedAt).format('MMMM Do YYYY, h:mm:ss a')}
        </P>
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          {moment(test.updatedAt).format('MMMM Do YYYY, h:mm:ss a')}
        </P>
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          <Status status={test.status} />
        </P>
      </Flex>
      <TestLogsModal
        test={test}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

function RepositoryTests() {
  const { id } = useContext(RepositoryContext)
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

  return (
    <Flex
      height="100%"
      maxHeight="100%"
      direction="column"
    >
      <H2 flexShrink={0}>
        Tests
      </H2>
      <Flex
        mt={1.5}
        flexGrow={1}
        direction="column"
      >
        <Flex
          borderBottom="1px solid border"
          fontWeight={500}
        >
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            Promote to
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            Name
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            Created on
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            Last updated on
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            Progress
          </P>
        </Flex>
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
            />
          ))}
        </InfiniteScroller>
      </Flex>
    </Flex>
  )
}

export default RepositoryTests
