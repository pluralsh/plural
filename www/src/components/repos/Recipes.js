import React, { useState } from 'react'
import { Box, Text, Stack } from 'grommet'
import Carousel from '../utils/Carousel'
import Recipe from './Recipe'
import { Trash } from 'grommet-icons'
import HoveredBackground from '../utils/HoveredBackground'
import { useMutation } from 'react-apollo'
import { DELETE_RECIPE, REPO_Q } from './queries'
import { Provider } from './misc'

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
        onClick={mutation}
        margin={{top: 'xsmall', right: 'xsmall'}}>
        <Trash size='12px' />
      </Box>
    </HoveredBackground>
  )
}

function RecipeListItemInner({recipe, setRecipe, hover, setHover}) {
  const {name, description, provider} = recipe

  return (
    <Box
      direction='row'
      border
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => setRecipe(recipe)}
      round='xsmall'
      pad='medium'
      gap='small'
      background={hover ? 'light-3' : null}>
      {provider && (
        <Box width={PROVIDER_WIDTH + 'px'} align='center' justify='center'>
          <Provider provider={provider} width={PROVIDER_WIDTH - 5} />
        </Box>
      )}
      <Box gap='small' fill='horizontal'>
        <Text weight='bold' size='small'>{name}</Text>
        <Text size='small'>{description}</Text>
      </Box>
    </Box>
  )
}

function RecipeListItem({recipe, setRecipe, repository: {editable, id}}) {
  const [hover, setHover] = useState(false)

  if (editable && hover) {
    return (
      <Stack anchor='top-right' onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
        <RecipeListItemInner recipe={recipe} setRecipe={setRecipe} hover={hover} setHover={() => null} />
        <DeleteRecipe recipe={recipe} repositoryId={id} />
      </Stack>
    )
  }

  return <RecipeListItemInner recipe={recipe} setRecipe={setRecipe} hover={hover} setHover={setHover} />
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
    <Box pad='small' gap='small' elevation='small'>
      <Text size='small' style={{fontWeight: 500}}>Recipes</Text>
      <Carousel
        draggable={false}
        dots
        slidesPerPage={3}
        offset={12}
        edges={edges}
        mapper={({node}) => <RecipeListItem key={node.id} recipe={node} setRecipe={wrappedSetRecipe} repository={repository} />}
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
    </>
  )
}