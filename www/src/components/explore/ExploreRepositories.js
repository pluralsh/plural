import { useQuery } from '@apollo/client'
import { useSearchParams } from 'react-router-dom'
import { Div, P } from 'honorable'
import { RepositoryCard } from 'pluralsh-design-system'

import { useEffect } from 'react'

import { EXPLORE_REPOS } from '../repos/queries'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'

function ExploreRepositories({ scrollRef }) {
  const [repositories, loading, hasMoreRepositories, fetchMoreRepositories] = usePaginatedQuery(
    EXPLORE_REPOS,
    {
      variables: {
      },
    },
    data => data.repositories
  )

  useEffect(() => {
    const { current } = scrollRef

    if (!current) return

    function handleScroll(event) {
      if (!loading && Math.abs(event.target.scrollTop - (event.target.scrollHeight - event.target.offsetHeight)) < 6) {
        fetchMoreRepositories()
      }
    }

    current.addEventListener('scroll', handleScroll)

    return () => {
      current.removeEventListener('scroll', handleScroll)
    }
  }, [scrollRef, fetchMoreRepositories, loading])

  if (!repositories.length) return null

  const sortedRepositories = repositories.slice().sort((a, b) => a.name.localeCompare(b.name))
  const featuredA = sortedRepositories.shift()
  const featuredB = sortedRepositories.shift()

  return (
    <Div pt={4}>
      <P
        px={1.5}
        body0
        fontWeight="bold"
      >
        Featured Repositories
      </P>
      <Div
        px={1.5}
        mt={1}
        xflex="x4s"
      >
        <RepositoryCard
          flexGrow={1}
          flexShrink={0}
          flexBasis="calc(50% - 1.5 * 16px)"
          featured
          title={featuredA.name}
          imageUrl={featuredA.icon}
          subtitle={featuredA.description}
        >
          {featuredA.description}
        </RepositoryCard>
        <RepositoryCard
          ml={3}
          flexGrow={1}
          flexShrink={0}
          flexBasis="calc(50% - 1.5 * 16px)"
          featured
          title={featuredB.name}
          imageUrl={featuredB.icon}
          subtitle={featuredB.description}
        >
          {featuredB.description}
        </RepositoryCard>
      </Div>
      <P
        px={1.5}
        mt={3}
        body0
        fontWeight="bold"
      >
        All Repositories
      </P>
      <Div
        mt={1}
        xflex="x11s"
      >
        {sortedRepositories.map(repository => (
          <RepositoryCard
            mx={1.5}
            mb={3}
            flexGrow={1}
            flexShrink={0}
            flexBasis="calc(33.333% - 3 * 16px)"
            title={repository.name}
            imageUrl={repository.icon}
            subtitle={repository.description}
          >
            {repository.description}
          </RepositoryCard>
        ))}
      </Div>
    </Div>
  )
}

export default ExploreRepositories
