import { Div } from 'honorable'
import { Link } from 'react-router-dom'

import { Repository } from '../../generated/graphql'

import { fillEmptyColumns } from './utils'
import { MarketplaceAppCard } from './AppCard'

// Maket sure verified checkmark isn't supposed to go next to publisher

export function RepoCardList({
  repositories,
  repoProps = {},
  urlParams = '',
  stretchLastRow = false,
  ...props
}: any) {
  console.log('repoProps', repoProps)

  const repos = repositories as Repository[]

  return (
    <Div
      display="grid"
      gap="medium"
      gridTemplateColumns="repeat(auto-fit, minmax(350px, 1fr))"
      {...props}
    >
      {repos?.map(repository => (
        <MarketplaceAppCard
          key={repository.id}
          as={Link}
          to={`/repository/${repository.name}${
            urlParams ? `?${urlParams}` : ''
          }`}
          color="text"
          textDecoration="none"
          width="100%"
          repository={repository}
          {...repoProps}
        />
      ))}
      {!stretchLastRow && fillEmptyColumns(10)}
    </Div>
  )
}
