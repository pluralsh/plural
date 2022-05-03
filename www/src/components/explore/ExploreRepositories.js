import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { Div } from 'honorable'
import { RepositoryCard } from 'pluralsh-design-system'

import { EXPLORE_REPOS } from '../repos/queries'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'

function ExploreRepositories() {
  const [repositories, hasMoreRepositories, fetchMoreRepositories] = usePaginatedQuery(
    EXPLORE_REPOS,
    {
      variables: {
      },
    },
    data => data.repositories
  )

  if (!repositories.length) return null

  console.log('featuredA', repositories)
  const sortedRepositories = repositories.slice().sort((a, b) => a.name.localeCompare(b.name))
  const featuredA = sortedRepositories.shift()

  const featuredB = sortedRepositories.shift()

  console.log('featuredA', featuredA)

  return (
    <Div xflex="x4s">
      <RepositoryCard
        featured
        title={featuredA.name}
        imageUrl={featuredA.icon}
        subtitle={featuredA.description}
      >
        {featuredA.description}
      </RepositoryCard>
    </Div>
  )
}

export default ExploreRepositories
