import { useQuery } from '@apollo/client'
import { H1 } from 'honorable'
import { Divider, StackCard } from '@pluralsh/design-system'
import { useNavigate } from 'react-router-dom'
import isEmpty from 'lodash/isEmpty'

import { STACKS_QUERY } from './queries'
import { CardGrid } from './CardGrid'

const hues = ['blue', 'green', 'yellow', 'red']

export default function MarketplaceStacks() {
  const navigate = useNavigate()
  const { data } = useQuery(STACKS_QUERY, { variables: { featured: true } })

  if (isEmpty(data?.stacks?.edges)) return null

  const {
    stacks: { edges },
  } = data
  const apps = ({ collections: c }) => (c?.length > 0
    ? c[0].bundles?.map(({
      recipe: {
        repository: { name, darkIcon, icon },
      },
    }) => ({ name, imageUrl: darkIcon || icon }))
    : [])
  const hue = i => hues[i % hues.length]

  return (
    <>
      <H1
        subtitle1
      >Plural Stacks
      </H1>
      <CardGrid
        marginBottom="xlarge"
        marginTop="medium"
      >
        {edges.map(({ node: stack }, i) => (
          <StackCard
            key={stack.name}
            title={stack.displayName || stack.name}
            description={stack.description}
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
