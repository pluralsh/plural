import { Link, useSearchParams } from 'react-router-dom'
import { Div, Flex, P } from 'honorable'
import { RepositoryCard } from 'pluralsh-design-system'

import { useEffect } from 'react'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { EXPLORE_QUERY } from './queries'

function ExploreRepositories({ installed, scrollRef }) {
  const [searchParams] = useSearchParams()
  const categories = searchParams.getAll('category')
  const tags = searchParams.getAll('tag')

  const [repositories, loadingRepositories, hasMoreRepositories, fetchMoreRepositories] = usePaginatedQuery(
    EXPLORE_QUERY,
    {
      variables: {
        // Does not work:
        // tag: tags[0] || null,
      },
    },
    data => data.repositories
  )

  const shouldRenderFeatured = !categories.length && !tags.length && !installed

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

  if (loadingRepositories) {
    return (
      <Flex
        pt={12}
        align="center"
        justify="center"
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const sortedRepositories = repositories.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(repository => categories.length ? categories.includes(repository.category) : true)
    .filter(repository => {
      if (!tags.length) return true

      const repositoryTags = repository.tags.map(({ tag }) => tag)

      return tags.some(tag => repositoryTags.includes(tag))
    })
    .filter(repository => installed ? repository.installation : true)

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
        <Flex
          px={3}
          mt={1}
        >
          <RepositoryCard
            as={Link}
            to={`/repository/${featuredA.id}`}
            installed={!!featuredA.installation}
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
            installed={!!featuredB.installation}
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
        </Flex>
      </>
    )
  }

  function renderTitle() {
    let title = installed ? 'Installed Repositories' : 'All Repositories'

    if (categories.length || tags.length) title += ', filtered'

    return title
  }

  return (
    <Div py={2}>
      {shouldRenderFeatured && renderFeatured()}
      <P
        px={3}
        mt={shouldRenderFeatured ? 2 : 0}
        body0
        fontWeight="bold"
      >
        {renderTitle()}
      </P>
      <Flex
        px={2}
        mt={1}
        align="stretch"
        wrap="wrap"
      >
        {sortedRepositories.map(repository => (
          <RepositoryCard
            key={repository.id}
            as={Link}
            to={`/repository/${repository.id}`}
            installed={!!repository.installation}
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
      </Flex>
      {loadingRepositories && (
        <Flex
          mt={2}
          align="center"
          justify="center"
        >
          <LoopingLogo />
        </Flex>
      )}
    </Div>
  )
}

export default ExploreRepositories
