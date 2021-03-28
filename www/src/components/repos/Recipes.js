import React, { useCallback, useState } from 'react'
import { Box, Text, Anchor } from 'grommet'
import { HoveredBackground } from 'forge-core'
import Recipe from './Recipe'
import { Trash } from 'grommet-icons'
import { useMutation } from 'react-apollo'
import { DELETE_RECIPE, REPO_Q } from './queries'
import { Provider } from './misc'
import { Container } from './Integrations'
import { chunk } from '../../utils/array'
import { extendConnection } from '../../utils/graphql'

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
        focusIndicator={false}
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
  const wrappedSetRecipe = useCallback((recipe) => setRecipe(recipe ? recipe : null), [setRecipe])
  if (edges.length === 0) return null

  return (
    <>
    {recipe && (<Recipe recipe={recipe} repository={repository} setOpen={wrappedSetRecipe} />)}
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
        updateQuery: (prev, {fetchMoreResult}) => extendConnection(prev, fetchMoreResult, 'recipes')
      })}>show more</Anchor>)}
    </Box>
    </>
  )
}