import { Anchor, Box, Text } from 'grommet'
import moment from 'moment'
import { Scroller } from 'forge-core'

import { DetailContainer } from '../repos/Installation'
import { extendConnection } from '../../utils/graphql'

import { VersionTag } from './VersionTags'

export function Version({ version, onSelect }) {

  return (
    <Box
      direction="row"
      align="center"
      className="chart-version"
      height="30px"
      hoverIndicator="fill-one"
      onClick={() => onSelect(version)}
      pad={{ horizontal: 'small' }}
    >
      <Box
        direction="row"
        fill="horizontal"
        align="center"
        gap="xsmall"
      >
        <Anchor
          size="small"
          onClick={() => onSelect(version)}
        >
          {version.version}
        </Anchor>
        <Text
          size="small"
          truncate
        >- {moment(version.insertedAt).fromNow()}
        </Text>
      </Box>
      <Box
        flex={false}
        className="tags"
        direction="row"
        gap="xxsmall"
      >
        {version.tags.map(tag => (
          <VersionTag
            key={tag}
            tag={tag}
          />
        ))}
      </Box>
    </Box>
  )
}

export function Versions({ setVersion, edges, refetch, pageInfo, fetchMore }) {
  return (
    <DetailContainer
      gap="xsmall"
      pad={{ vertical: 'small' }}
      style={{ minHeight: '80px', maxHeight: '80px' }}
    >
      <Scroller
        id="chart"
        edges={edges}
        style={{ overflow: 'auto', width: '100%', maxHeight: '50vh' }}
        mapper={({ node }, next) => (
          <Version
            key={node.id}
            version={node}
            hasNext={!!next}
            onSelect={setVersion}
            refetch={refetch}
          />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { versions } }) => extendConnection(prev, versions, 'versions'),
        })}
      />
    </DetailContainer>
  )
}
