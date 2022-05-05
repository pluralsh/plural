import { Link, useSearchParams } from 'react-router-dom'
import { Div, P } from 'honorable'
import { RepositoryCard } from 'pluralsh-design-system'

import { useEffect } from 'react'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { EXPLORE_QUERY } from './queries'

function ExploreRepositories({ scrollRef }) {
  const [searchParams] = useSearchParams()
  const categories = searchParams.getAll('category')
  const [repositories, loadingRepositories, hasMoreRepositories, fetchMoreRepositories] = usePaginatedQuery(
    EXPLORE_QUERY,
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
      if (!loadingRepositories && hasMoreRepositories && Math.abs(event.target.scrollTop - (event.target.scrollHeight - event.target.offsetHeight)) < 32) {
        fetchMoreRepositories()
      }
    }

    current.addEventListener('scroll', handleScroll)

    return () => {
      current.removeEventListener('scroll', handleScroll)
    }
  }, [scrollRef, fetchMoreRepositories, loadingRepositories, hasMoreRepositories])

  if (!repositories.length) {
    return (
      <Div
        pt={12}
        xflex="x5"
      >
        <LoopingLogo />
      </Div>
    )
  }

  const sortedRepositories = repositories.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(repository => categories.length ? categories.includes(repository.category) : true)

  function renderFeatured() {
    const featuredA = sortedRepositories.shift()
    const featuredB = sortedRepositories.shift()

    return (
      <>
        <P
          px={3}
          body0
          fontWeight="bold"
        >
          Featured Repositories
        </P>
        <Div
          px={3}
          mt={1}
          xflex="x4s"
        >
          <RepositoryCard
            as={Link}
            to={`/repository/${featuredA.id}`}
            color="text"
            textDecoration="none"
            flexGrow={1}
            flexShrink={0}
            flexBasis="calc(50% - 1 * 16px)"
            featured
            title={featuredA.name}
            imageUrl={featuredA.darkIcon || featuredA.icon}
            subtitle={featuredA.publisher?.name?.toUpperCase()}
          >
            {featuredA.description}
          </RepositoryCard>
          <RepositoryCard
            as={Link}
            to={`/repository/${featuredB.id}`}
            color="text"
            textDecoration="none"
            ml={2}
            flexGrow={1}
            flexShrink={0}
            flexBasis="calc(50% - 1 * 16px)"
            featured
            title={featuredB.name}
            imageUrl={featuredB.darkIcon || featuredB.icon}
            subtitle={featuredB.publisher?.name?.toUpperCase()}
          >
            {featuredB.description}
          </RepositoryCard>
        </Div>
      </>
    )
  }

  return (
    <Div py={2}>
      {!categories.length && renderFeatured()}
      <P
        px={3}
        mt={2}
        body0
        fontWeight="bold"
      >
        All Repositories
      </P>
      <Div
        px={2}
        mt={1}
        xflex="x11s"
      >
        {sortedRepositories.map(repository => (
          <RepositoryCard
            key={repository.id}
            as={Link}
            to={`/repository/${repository.id}`}
            color="text"
            textDecoration="none"
            mx={1}
            mb={2}
            flexGrow={0}
            flexShrink={0}
            width="calc(33.333% - 2 * 16px)"
            title={repository.name}
            imageUrl={repository.darkIcon || repository.icon}
            subtitle={repository.publisher?.name?.toUpperCase()}
          >
            {repository.description}
          </RepositoryCard>
        ))}
      </Div>
      {loadingRepositories && (
        <Div
          mt={2}
          xflex="x5"
        >
          <LoopingLogo />
        </Div>
      )}
    </Div>
  )
}

export default ExploreRepositories
