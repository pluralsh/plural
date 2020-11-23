import React, { useState } from 'react'
import { Anchor, Box, Layer, Text } from 'grommet'
import moment from 'moment'
import { Scroller } from 'forge-core'
import { EditTags, VersionTag } from './VersionTags'
import { DetailContainer } from '../repos/Installation'

export function Version({version, onSelect, refetch}) {
  const [open, setOpen] = useState(false)

  return (
    <Box direction='row' align='center' className='chart-version' height='30px'>
      <Box direction='row' fill='horizontal' align='center' gap='xsmall'>
        <Anchor size='small' onClick={() => onSelect(version)}>
          {version.version}
        </Anchor>
        <Text size='small' truncate>- {moment(version.insertedAt).fromNow()}</Text>
      </Box>
      <Box flex={false} className='tags' direction='row' gap='xxsmall'>
        {version.tags.map((tag) => <VersionTag key={tag} tag={tag} />)}
      </Box>
      <Box flex={false} className='edit'>
        <Anchor size='small' onClick={() => setOpen(true)}>edit tags</Anchor>
      </Box>
      {open && (
        <Layer modal>
          <EditTags version={version} setOpen={setOpen} refetch={refetch} />
        </Layer>
      )}
    </Box>
  )
}

export function Versions({setVersion, edges, refetch, pageInfo, fetchMore}) {
  return (
    <DetailContainer gap='xsmall' pad='small' style={{maxHeight: '50%'}}>
      <Text size='small' weight='bold'>Versions</Text>
      <Scroller id='chart'
        edges={edges}
        style={{overflow: 'auto', width: '100%', maxHeight: '50vh'}}
        mapper={({node}, next) => (
          <Version
            key={node.id}
            version={node}
            hasNext={!!next}
            onSelect={setVersion}
            refetch={refetch} />
        )}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {versions: {edges, pageInfo}}}) => (
            {...prev, versions: {...prev.versions, pageInfo, edges: [...prev.versions.edges, ...edges]}}
          )
        })} />
    </DetailContainer>
  )
}