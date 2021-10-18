import React, { useCallback, useState } from 'react'
import { Box, Text, Anchor } from 'grommet'
import Recipe from './Recipe'
import { Trash } from 'forge-core'
import { useMutation } from 'react-apollo'
import { DELETE_RECIPE, REPO_Q } from './queries'
import { Provider } from './misc'
import { Container } from './Integrations'
import { chunk } from '../../utils/array'
import { extendConnection, updateCache, removeConnection } from '../../utils/graphql'
import { Confirm } from '../utils/Confirm'

const PROVIDER_WIDTH = 40

function DeleteRecipe({recipe: {id}, repositoryId}) {
  const [confirm, setConfirm] = useState(false)
  const [mutation] = useMutation(DELETE_RECIPE, {
    variables: {id},
    update: (cache, {data: {deleteRecipe}}) => updateCache(cache, {
      query: REPO_Q,
      variables: {repositoryId},
      update: (prev) => removeConnection(prev, 'recipes', deleteRecipe)
    })
  })

  return (
    <>
    <Box
      focusIndicator={false}
      pad='xsmall'
      round='xsmall'
      hoverIndicator='hover'
      onClick={() => setConfirm(true)}>
      <Trash size='15px' />
    </Box>
    {confirm && (
      <Confirm
        label='Delete'
        description='This will delete the bundle permanently'
        submit={mutation}
        cancel={() => setConfirm(false)} />
    )}
    </>
  )
}

function RecipeListItem({recipe, setRecipe, repository: {editable, id}}) {
  const {name, description, provider} = recipe
  return (
    <Container
      direction='row'
      gap='medium'
      pad='medium'
      width='50%'
      modifier={editable ? <DeleteRecipe recipe={recipe} repositoryId={id} /> : null}
      onClick={() => setRecipe(recipe)}>
      {provider && (
        <Box width={PROVIDER_WIDTH + 'px'} align='center' justify='center'>
          <Provider provider={provider} width={PROVIDER_WIDTH - 5} />
        </Box>
      )}
      <Box fill='horizontal'>
        <Text weight='bold' size='small'>{name}</Text>
        <Text size='small'>{description}</Text>
      </Box>
    </Container>
  )
}

export default function Recipes({repository, recipes: {edges, pageInfo, fetchMore}}) {
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
            <RecipeListItem 
              key={node.id} 
              recipe={node} 
              setRecipe={wrappedSetRecipe} 
              repository={repository} />
          ))}
        </Box>
      ))}
      {pageInfo.hasNextPage && (<Anchor onClick={() => fetchMore({
        variables: {recipeCursor: pageInfo.endCursor},
        updateQuery: (prev, {fetchMoreResult: {recipes}}) => extendConnection(prev, recipes, 'recipes')
      })}>show more</Anchor>)}
    </Box>
    </>
  )
}