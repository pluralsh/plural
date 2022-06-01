import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Div, Flex, P } from 'honorable'
import { Input, MagnifyingGlassIcon, RepositoryCard } from 'pluralsh-design-system'
import Fuse from 'fuse.js'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { MARKETPLACE_QUERY } from './queries'

const searchOptions = {
  keys: ['name', 'description', 'tags.tag'],
}

function MarketplaceRepositories({ installed, ...props }) {
  const scrollRef = useRef()
  const [searchParams] = useSearchParams()
  const categories = searchParams.getAll('category')
  const tags = searchParams.getAll('tag')
  const [search, setSearch] = useState('')

  const [repositories, loadingRepositories, hasMoreRepositories, fetchMoreRepositories] = usePaginatedQuery(
    MARKETPLACE_QUERY,
    {
      variables: {
        // Does not work:
        // tag: tags[0] || null,
      },
    },
    data => data.repositories
  )

  const shouldRenderFeatured = !categories.length && !tags.length && !installed && !search

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

  if (repositories.length === 0 && loadingRepositories) {
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

  const fuse = new Fuse(sortedRepositories, searchOptions)

  const resultRepositories = search ? fuse.search(search).map(({ item }) => item) : sortedRepositories

  function renderFeatured() {
    const featuredA = sortedRepositories.shift()
    const featuredB = sortedRepositories.shift()

    return (
      <>
        <P
          body0
          fontWeight="bold"
        >
          Featured Repositories
        </P>
        <Flex
          mt={1}
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
            publisher={featuredA.publisher?.name?.toUpperCase()}
            description={featuredA.description}
            tags={featuredA.tags.map(({ tag }) => tag)}
          />
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
            publisher={featuredB.publisher?.name?.toUpperCase()}
            description={featuredB.description}
            tags={featuredB.tags.map(({ tag }) => tag)}
          />
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
    <Flex
      direction="column"
      {...props}
    >
      <Div>
        <Input
          small
          startIcon={(
            <MagnifyingGlassIcon
              size={14}
              mt={0.1}
            />
          )}
          placeholder="Search a repository"
          value={search}
          onChange={event => setSearch(event.target.value)}
        />
      </Div>
      <Div
        mt={1}
        overflowY="auto"
        overflowX="hidden"
        ref={scrollRef}
      >
        {shouldRenderFeatured && renderFeatured()}
        <P
          mt={shouldRenderFeatured ? 2 : 0}
          body0
          fontWeight="bold"
        >
          {renderTitle()}
        </P>
        <Flex
          mx={-1}
          mt={1}
          align="stretch"
          wrap="wrap"
        >
          {resultRepositories.map(repository => (
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
              publisher={repository.publisher?.name?.toUpperCase()}
              description={repository.description}
              tags={repository.tags.map(({ tag }) => tag)}
            />
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
    </Flex>
  )
}

export default MarketplaceRepositories
