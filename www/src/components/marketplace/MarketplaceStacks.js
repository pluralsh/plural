import { useQuery } from '@apollo/client'
import { Flex, H1 } from 'honorable'
import { Divider, StackCard } from 'pluralsh-design-system'

import { STACKS_QUERY } from './queries'

const hues = ['blue', 'green', 'yellow', 'red']

export default function MarketplaceStacks() {
  const { data } = useQuery(STACKS_QUERY, { featured: true })

  if (!data) return

  const { stacks: { edges } } = data

  // TODO: It should rely directly on stack.bundles instead of provider-specific stack.collections.
  const apps = ({ collections: c }) => (c?.length > 0
    ? c[0].bundles.map(({ recipe: { repository: { name, icon } } }) => ({ name, imageUrl: icon })) : [])

  const hue = i => hues[i % hues.length]

  return (
    <>
      <H1 subtitle1>Plural Stacks</H1>
      <Flex
        gap="large"
        marginVertical="large"
      >
        {edges.map(({ node: stack }, i) => (
          <StackCard
            key={stack.id}
            title={stack.name}
            description={stack.description}
            apps={apps(stack)}
            hue={hue(i)}
          />
        ))}
      </Flex>
      <Divider backgroundColor="border" />
    </>
  )
}
