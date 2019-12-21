import React, { useState } from 'react'
import { Box, Text } from 'grommet'
import Carousel from '../utils/Carousel'

function Recipe({name, description}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      border
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      round='xsmall'
      pad='medium'
      gap='small'
      background={hover ? 'light-3' : null}
      margin={{left: 'small'}}>
      <Text weight='bold' size='small'>{name}</Text>
      <Text size='small'>{description}</Text>
    </Box>
  )
}

export default function Recipes({edges, pageInfo, fetchMore}) {
  if (edges.length === 0) return null


  return (
    <Box pad='small' gap='small' elevation='small'>
      <Text size='small' style={{fontWeight: 500}}>Recipes</Text>
      <Carousel
        draggable={false}
        dots
        slidesPerPage={3}
        edges={edges}
        mapper={({node}) => <Recipe {...node} />}
        fetchMore={() => {
          if (!pageInfo.hasNextPage) return

          fetchMore({
            variables: {recipeCursor: pageInfo.endCursor},
            updateQuery: (prev, {fetchMoreResult}) => {
              const {edges, pageInfo} = fetchMoreResult.recipes
              return edges.length ? {
                ...prev,
                recipes: {
                  ...prev.recipes,
                  pageInfo,
                  edges: [...prev.recipes.edges, ...edges]
                }
              } : prev
            }
          })
        }} />
    </Box>
  )
}