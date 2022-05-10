import { useContext } from 'react'
import moment from 'moment'
import { Flex, H2, P } from 'honorable'

import RepositoryContext from '../../contexts/RepositoryContext'

import InfiniteScroller from '../utils/InfiniteScroller'

function Artifacts({ artifact }) {
  return (
    <Flex borderBottom="1px solid border">
      <P
        py={1}
        px={1}
        width="calc(100% / 5)"
      >
        {artifact.name}
      </P>
      <P
        py={1}
        px={1}
        width="calc(100% / 5)"
      >
        {artifact.platform}
      </P>
      <P
        py={1}
        px={1}
        width="calc(100% / 5)"
      >
        {artifact.fileSize}
      </P>
      <P
        py={1}
        px={1}
        width="calc(100% / 5)"
      >
        {moment(artifact.insertedAt).format('MMMM Do YYYY, h:mm:ss a')}
      </P>
      <P
        py={1}
        px={1}
        width="calc(100% / 5)"
      >
        foo
      </P>
    </Flex>
  )
}

function RepositoryDeployments() {
  const { artifacts } = useContext(RepositoryContext)

  function renderContent() {
    if (!artifacts || artifacts.length === 0) {
      return (
        <P mt={1.5}>
          No artifacts found.
        </P>
      )
    }

    return (
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
            Name
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            Platform
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            File Size
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          >
            Created At
          </P>
          <P
            py={0.5}
            px={1}
            width="calc(100% / 5)"
          />
        </Flex>
        <InfiniteScroller
          pb={4}
          // Allow for scrolling in a flexbox layout
          flexGrow={1}
          height={0}
        >
          {artifacts.map(artifact => (
            <Artifacts
              key={artifact.id}
              artifact={artifact}
            />
          ))}
        </InfiniteScroller>
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
        Artifacts
      </H2>
      {renderContent()}
    </Flex>
  )
}

export default RepositoryDeployments
