import { useContext, useState } from 'react'
import moment from 'moment'
import { Flex, H2, Modal, P, Span, Tooltip } from 'honorable'
import { Download, ListView } from 'forge-core'
import { Apple, DocumentText, Ubuntu, Windows } from 'grommet-icons'
import fs from 'filesize'

import RepositoryContext from '../../contexts/RepositoryContext'

import InfiniteScroller from '../utils/InfiniteScroller'
import Code from '../utils/Code'
import { download } from '../../utils/file'

const platformToIcon = {
  MAC: <Apple size="14px" />,
  WINDOWS: <Windows size="14px" />,
  LINUX: <Ubuntu size="14px" />,
}

function ArtifactIcon({ Icon, tooltip, ...props }) {
  return (
    <Tooltip label={tooltip}>
      <Flex
        align="center"
        justify="center"
        p={0.5}
        hoverIndicator="fill-one"
        borderRadius={1000}
        cursor="pointer"
        {...props}
      >
        <Icon size="16px" />
      </Flex>
    </Tooltip>
  )
}

function Artifacts({ artifact }) {
  const [readmeOpen, setReadmeOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  function handleDownload() {
    download(artifact.blob)
  }

  return (
    <>
      <Flex borderBottom="1px solid border">
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          {artifact.name}
        </P>
        <Flex
          py={1}
          px={1}
          align="center"
          width="calc(100% / 5)"
        >
          {platformToIcon[artifact.platform]}
          <Span ml={0.5}>
            {artifact.arch}
          </Span>
        </Flex>
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          {fs(artifact.filesize)}
        </P>
        <P
          py={1}
          px={1}
          width="calc(100% / 5)"
        >
          {moment(artifact.insertedAt).format('MMMM Do YYYY, h:mm:ss a')}
        </P>
        <Flex
          py={1}
          px={1}
          align="center"
          width="calc(100% / 5)"
        >
          <ArtifactIcon
            Icon={DocumentText}
            tooltip="Readme"
            onClick={() => setReadmeOpen(true)}
          />
          <ArtifactIcon
            Icon={ListView}
            tooltip="Details"
            onClick={() => setDetailsOpen(true)}
            ml={1}
          />
          <ArtifactIcon
            Icon={Download}
            tooltip="Download"
            onClick={handleDownload}
            ml={1}
          />
        </Flex>
      </Flex>
      <Modal
        open={readmeOpen}
        onClose={() => setReadmeOpen(false)}
      >
        <H2>
          Readme
        </H2>
        <Code
          language="markdown"
          mt={2}
        >
          {artifact.readme}
        </Code>
      </Modal>
      <Modal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      >
        <H2>
          Details
        </H2>
        <Code
          language="json"
          mt={2}
        >
          {`{
  "name": "${artifact.name}",
  "sha256": "${artifact.sha}",
  "platform": "${artifact.platform} ${artifact.arch}",
  "filesize": ${artifact.filesize},
  "createdAt": "${moment(artifact.insertedAt).toISOString()}"
}`}
        </Code>
      </Modal>
    </>
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
