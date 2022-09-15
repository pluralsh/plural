import { useQuery } from '@apollo/client'
import { Flex, H1 } from 'honorable'
import { Divider, StackCard } from 'pluralsh-design-system'

import { fillEmptyColumns, flexBasis } from './utils'

import { STACKS_QUERY } from './queries'

const hues = ['blue', 'green', 'yellow', 'red']

export default function MarketplaceStacks() {
  const { data } = useQuery(STACKS_QUERY, { featured: true } as any)

  if (!data) return

  const { stacks: { edges } } = data
  const apps = ({ collections: c }) => (c?.length > 0
    ? c[0].bundles.map(({ recipe: { repository: { name, icon } } }) => ({ name, imageUrl: icon })) : [])
  const hue = i => hues[i % hues.length]

  return (
    <>
      <H1 subtitle1>Plural Stacks</H1>
      <Flex
        marginTop="medium"
        mx={-1.25}
        align="stretch"
        wrap="wrap"
      >
        {edges.map(({ node: stack }, i) => (
          <Flex
            key={i}
            flexBasis={flexBasis}
            flexGrow={1}
            flexShrink={1}
            width="auto"
            minWidth="250px"
            maxWidth="800px"
            paddingHorizontal="medium"
            marginBottom="xlarge"
          >
            <StackCard
              title={stack.name}
              description={stack.description}
              apps={apps(stack)}
              hue={hue(i)}
            />
          </Flex>
        ))}
        {fillEmptyColumns(10)}
      </Flex>
      <Divider
        backgroundColor="border"
        marginBottom="xlarge"
      />
    </>
  )
}
