import React, { useState } from 'react'
import { Box, Text, Anchor } from 'grommet'
import Recipe from './Recipe'
import { Trash } from 'grommet-icons'
import HoveredBackground from '../utils/HoveredBackground'
import { useMutation } from 'react-apollo'
import { DELETE_RECIPE, REPO_Q } from './queries'
import { Provider } from './misc'
import { Container } from './Integrations'
import { chunk } from '../../utils/array'

const PROVIDER_WIDTH = 40

function DeleteRecipe({recipe: {id}, repositoryId}) {
  const [mutation] = useMutation(DELETE_RECIPE, {
    variables: {id},
    update: (cache, {data: {deleteRecipe}}) => {
      const prev = cache.readQuery({query: REPO_Q, variables: {repositoryId}})
      cache.writeQuery({query: REPO_Q, variables: {repositoryId}, data: {
        ...prev,
        recipes: {
          ...prev.recipes,
          edges: prev.recipes.edges.filter(({node}) => node.id !== deleteRecipe.id)
        }
      }})
    }
  })

  return (
    <HoveredBackground>
      <Box
        accentable
        style={{cursor: 'pointer'}}
        background='white'
        pad='xsmall'
        round='xsmall'
        onClick={mutation}>
        <Trash size='15px' />
      </Box>
    </HoveredBackground>
  )
}

function RecipeListItem({recipe, setRecipe, repository: {editable, id}}) {
  const {name, description, provider} = recipe
  return (
    <Container
      style={{cursor: 'pointer'}}
      direction='row'
      gap='medium'
      pad='medium'
      modifier={editable ? <DeleteRecipe recipe={recipe} repositoryId={id} /> : null}
      onClick={() => setRecipe(recipe)}>
      {provider && (
        <Box width={PROVIDER_WIDTH + 'px'} align='center' justify='center'>
          <Provider provider={provider} width={PROVIDER_WIDTH - 5} />
        </Box>
      )}
      <Box gap='small' fill='horizontal'>
        <Text weight='bold' size='small'>{name}</Text>
        <Text size='small'>{description}</Text>
      </Box>
    </Container>
  )
}

export default function Recipes({repository, edges, pageInfo, fetchMore}) {
  const [recipe, setRecipe] = useState(null)
  if (edges.length === 0) return null
  function wrappedSetRecipe(recipe) {
    if (!recipe) {
      setRecipe(null)
      return
    }
    setRecipe(recipe)
  }

  return (
    <>
    {recipe && (<Recipe {...recipe} setOpen={wrappedSetRecipe} />)}
    <Box pad='small' gap='medium'>
      {Array.from(chunk(edges, 2)).map((chunk, ind) => (
        <Box key={ind} direction='row' gap='small' fill='horizontal'>
          {chunk.map(({node}) => (
            <RecipeListItem key={node.id} recipe={node} setRecipe={wrappedSetRecipe} repository={repository} />
          ))}
        </Box>
      ))}
      {pageInfo.hasNextPage && (<Anchor onClick={() => fetchMore({
          variables: {recipeCursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {recipes: {edges, pageInfo}}}) => ({
              ...prev,
              recipes: {...prev.recipes, pageInfo, edges: [...prev.recipes.edges, ...edges]}
          })
      })}>show more</Anchor>)}
    </Box>
    </>
  )
}