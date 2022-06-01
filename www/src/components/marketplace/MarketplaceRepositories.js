import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Div, Flex, P } from 'honorable'
import { Input, MagnifyingGlassIcon, RepositoryCard, Token } from 'pluralsh-design-system'
import Fuse from 'fuse.js'

import { capitalize } from '../../utils/string'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { MARKETPLACE_QUERY } from './queries'

const searchOptions = {
  keys: ['name', 'description', 'tags.tag'],
}

function MarketplaceRepositories({ installed, ...props }) {
  const scrollRef = useRef()
  const [searchParams, setSearchParams] = useSearchParams()
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

  function handleClearToken(key, value) {
    setSearchParams(searchParams.set(key, searchParams.getAll(key).filter(v => v !== value)))
  }

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
      position="relative"
      {...props}
    >
      <Flex align="center">
        <Input
          mr={1}
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
        {categories.map(category => (
          <Token onClose={() => handleClearToken('category', category)}>
            {capitalize(category)}
          </Token>
        ))}
        {tags.map(tag => (
          <Token onClose={() => handleClearToken('tag', tag)}>
            {capitalize(tag)}
          </Token>
        ))}
      </Flex>
      <Div
        flexShrink={0}
        height={16}
        width="100%"
        background="linear-gradient(0deg, transparent 0%, fill-zero 50%);"
        position="absolute"
        top={32}
      />
      <Div
        pt={1}
        pb={8}
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
