import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button, Div, Flex, H1 } from 'honorable'
import { Input, MagnifyingGlassIcon, RepositoryCard, Token } from 'pluralsh-design-system'
import Fuse from 'fuse.js'

import { capitalize } from '../../utils/string'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { LoopingLogo } from '../utils/AnimatedLogo'

import { MARKETPLACE_QUERY } from './queries'

const searchOptions = {
  keys: ['name', 'description', 'tags.tag'],
  threshold: 0.25,
}

const filterTokenStyles = {
  marginRight: 'xsmall',
  marginBottom: 'xsmall',
  flexShrink: 0,
  minHeight: '42px',
}

function MarketplaceRepositories({ installed, ...props }) {
  const scrollRef = useRef()
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = searchParams.getAll('category')
  const tags = searchParams.getAll('tag')
  const [search, setSearch] = useState('')

  const [repositories, loadingRepositories, hasMoreRepositories, fetchMoreRepositories] = usePaginatedQuery(
    MARKETPLACE_QUERY,
    {},
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
        pt={2}
        align="center"
        justify="center"
        {...props}
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const sortedRepositories = repositories.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(repository => categories.length ? categories.includes(repository.category.toLowerCase()) : true)
    .filter(repository => {
      if (!tags.length) return true

      const repositoryTags = repository.tags.map(({ name }) => name.toLowerCase())

      return tags.some(tag => repositoryTags.includes(tag))
    })
    .filter(repository => installed ? repository.installation : true)

  const fuse = new Fuse(sortedRepositories, searchOptions)

  const resultRepositories = search ? fuse.search(search).map(({ item }) => item) : sortedRepositories

  function handleClearToken(key, value) {
    const existing = searchParams.getAll(key)

    setSearchParams({
      ...searchParams,
      [key]: existing.filter(v => v !== value),
    })
  }

  function handleClearTokens() {
    setSearchParams({})
  }

  function renderFeatured() {
    const featuredA = sortedRepositories.shift()
    const featuredB = sortedRepositories.shift()

    return (
      <>
        <H1 subtitle1>
          Featured Repositories
        </H1>
        <Flex
          marginTop="medium"
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
            tags={featuredA.tags.map(({ name }) => name)}
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
            tags={featuredB.tags.map(({ name }) => name)}
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
      <Div position="relative">
        <Flex
          paddingHorizontal="large"
          align="stretch"
          wrap
          marginBottom="-8px"
        >
          <Div
            minWidth="210px"
            maxWidth="calc(50% - 16px)"
            flex="1 1 210px"
            marginRight="large"
            marginBottom="xsmall"
            _last={{
              marginRight: 'large',
            }}
          >
            <Input
              startIcon={(
                <MagnifyingGlassIcon
                  size={14}
                />
              )}
              placeholder="Search a repository"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </Div>
          {categories.map(category => (
            <Token
              {...filterTokenStyles}
              onClose={() => handleClearToken('category', category)}
            >
              {capitalize(category)}
            </Token>
          ))}
          {tags.map(tag => (
            <Token
              {...filterTokenStyles}
              onClose={() => handleClearToken('tag', tag)}
            >
              {capitalize(tag)}
            </Token>
          ))}
          {!!(categories.length || tags.length) && (
            <Button
              marginBottom="xsmall"
              flexShrink={0}
              tertiary
              small
              onClick={() => handleClearTokens()}
            >
              Clear all
            </Button>
          )}
        </Flex>
        <Div
          flexShrink={0}
          height={16}
          width="100%"
          background="linear-gradient(0deg, transparent 0%, fill-zero 50%);"
          position="absolute"
          top="100%"
          zIndex={999}
        />
      </Div>
      <Div
        pt={1}
        pb={8}
        paddingHorizontal="large"
        overflowY="auto"
        overflowX="hidden"
        position="relative"
        ref={scrollRef}
      >
        {shouldRenderFeatured && renderFeatured()}
        <H1
          subtitle1
          marginTop={shouldRenderFeatured ? 'xlarge' : 0}
        >
          {renderTitle()}
        </H1>
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
              tags={repository.tags.map(({ name }) => name)}
            />
          ))}
        </Flex>
        {loadingRepositories && (
          <Flex
            marginTop="xlarge"
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
