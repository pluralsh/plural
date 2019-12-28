import React from 'react'
import Carousel from '../utils/Carousel'
import { Box, Text } from 'grommet'

const ICON_SIZE = 50

function Integration({name, description, icon, tags}) {
  return (
    <Box direction='row' pad='medium' round='xsmall' gap='small' border>
      <Box align='center' justify='center' width={`${ICON_SIZE}px`}>
        <img src={icon} alt={name} width={`${ICON_SIZE}px`} height={`${ICON_SIZE}px`} />
      </Box>
      <Box gap='xsmall'>
        <Text style={{fontWeight: 500}} size='small'>{name}</Text>
        <Box>
          <Text color='dark-3' size='small'>{description}</Text>
          {tags && tags.length > 0 && (
            <Box direction='row' gap='xxsmall'>
              {tags.map(({tag}) => <Text size='xsmall' color='dark-3'>#{tag}</Text>)}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default function Integrations({integrations: {edges, pageInfo}, fetchMore}) {

  return (
    <Box pad='small'>
      <Carousel
        draggable={false}
        dots
        slidesPerPage={1}
        offset={12}
        edges={edges}
        mapper={({node}) => <Integration key={node.id} {...node} />}
        fetchMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {intCursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.integrations
              return edges.length ? {
                ...prev,
                integrations: {
                  ...prev.integrations,
                  pageInfo,
                  edges: [...prev.integrations.edges, ...edges]
                }
              } : prev
            }
          })
        }} />
    </Box>
  )
}