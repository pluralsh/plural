import { useQuery } from '@apollo/client'
import { Flex, H1 } from 'honorable'
import { Divider, StackCard } from 'pluralsh-design-system'

import { STACKS_QUERY } from './queries'

export default function MarketplaceStacks() {
  const { data } = useQuery(STACKS_QUERY, { featured: true })

  if (!data) return

  const { stacks: { edges } } = data

  return (
    <>
      <H1 subtitle1>Plural Stacks</H1>
      <Flex
        gap="large"
        marginVertical="large"
      >
        {edges.map(({ node: stack }) => (
          <StackCard
            key={stack.id}
            title={stack.name}
            description={stack.description}
          />
        ))}
      </Flex>
      <Divider backgroundColor="border" />
    </>
  )
}
