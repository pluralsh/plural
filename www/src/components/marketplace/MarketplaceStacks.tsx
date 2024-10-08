import { useQuery } from '@apollo/client'
import { H1 } from 'honorable'
import { Divider, StackCard } from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'
import { useTheme } from 'styled-components'

import { getRepoIcon } from '../repository/misc'

import { CardGrid } from './CardGrid'
import { StackFragment, useListStacksQuery } from '../../generated/graphql'
import { mapExistingNodes } from '../../utils/graphql'
import { useMemo } from 'react'

const hues = ['blue', 'green', 'yellow', 'red'] as const

export default function MarketplaceStacks() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { data } = useListStacksQuery({
    variables: { first: 10, featured: true },
  })

  const stacks = useMemo(() => mapExistingNodes(data?.stacks), [data?.stacks])

  if (!stacks || isEmpty(stacks)) return null

  const apps = (stack: StackFragment) => {
    const c = stack.collections

    if (!c || c.length === 0) return []

    return c[0]?.bundles?.map((bundle) => ({
      name: bundle?.recipe?.repository?.name,
      imageUrl: getRepoIcon(bundle?.recipe?.repository, theme.mode),
    }))
  }

  const hue = (i) => hues[i % hues.length]

  return (
    <>
      <H1 subtitle1>Plural Stacks</H1>
      <CardGrid
        marginBottom="xlarge"
        marginTop="medium"
      >
        {stacks.map((stack, i) => (
          <StackCard
            key={stack.name}
            title={stack.displayName || stack.name}
            description={stack.description ?? ''}
            apps={apps(stack)}
            hue={hue(i)}
            onClick={() => navigate(`/stack/${stack.name}`)}
          />
        ))}
      </CardGrid>
      <Divider
        backgroundColor="border"
        marginBottom="xlarge"
      />
    </>
  )
}
