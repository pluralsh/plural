import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Button,
  Div,
  Flex,
  H1,
  Hr,
} from 'honorable'
import {
  ArrowTopRightIcon,
  Chip,
  EmptyState,
  FiltersIcon,
  Input,
  MagnifyingGlassIcon,
  TabPanel,
} from '@pluralsh/design-system'
import Fuse from 'fuse.js'
import styled from 'styled-components'
import isEmpty from 'lodash/isEmpty'
import capitalize from 'lodash/capitalize'
import orderBy from 'lodash/orderBy'

import { upperFirst } from 'lodash'

import { growthbook } from '../../helpers/growthbook'

import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { GoBack } from '../utils/GoBack'

import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'

import PublisherSideNav from '../publisher/PublisherSideNav'
import PublisherSideCar from '../publisher/PublisherSideCar'

import LoadingIndicator from '../utils/LoadingIndicator'

import { MARKETPLACE_QUERY } from './queries'

import MarketplaceSidebar from './MarketplaceSidebar'
import MarketplaceStacks from './MarketplaceStacks'
import { RepoCardList } from './RepoCardList'

const searchOptions = {
  keys: ['name', 'description', 'tags.tag'],
  threshold: 0.25,
}

const chipProps = {
  flexShrink: 0,
  tabIndex: 0,
  closeButton: true,
  clickable: true,
  height: '100%',
}

const sidebarWidth = 256 - 32

// @ts-expect-error
const StyledTabPanel = styled(TabPanel)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}))

function MarketplaceRepositories({ publisher }: {publisher?: any}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = searchParams.getAll('category')
  const tags = searchParams.getAll('tag')
  const backRepositoryName = searchParams.get('backRepositoryName')
  const [search, setSearch] = useState('')
  const [areFiltersOpen, setAreFiltersOpen] = useState(true)
  const tabStateRef = useRef<any>(null)

  const [
    repositories,
    loadingRepositories,
    hasMoreRepositories,
    fetchMoreRepositories,
  ] = usePaginatedQuery(MARKETPLACE_QUERY,
    {
      variables: {
        ...(publisher ? { publisherId: publisher.id } : {}),
      },
    },
    data => data.repositories)

  const shouldRenderStacks
    = growthbook.isOn('stacks')
    && !isEmpty(categories)
    && !isEmpty(tags)
    && !search

  useEffect(() => {
    const { current } = scrollRef

    if (!current) return

    function handleScroll(event) {
      if (
        !loadingRepositories
        && hasMoreRepositories
        && Math.abs(event.target.scrollTop
            - (event.target.scrollHeight - event.target.offsetHeight)) < 32
      ) {
        fetchMoreRepositories()
      }
    }

    current.addEventListener('scroll', handleScroll)

    return () => {
      current.removeEventListener('scroll', handleScroll)
    }
  }, [
    scrollRef,
    fetchMoreRepositories,
    loadingRepositories,
    hasMoreRepositories,
  ])

  if (repositories.length === 0 && loadingRepositories) {
    return <LoadingIndicator />
  }

  const sortedRepositories = orderBy(repositories.slice(),
    ['trending', r => r.name.toLowerCase()],
    ['desc', 'asc'])
    .filter(repository => (categories.length
      ? categories.some(category => category === repository.category.toLowerCase()
              || (category === 'installed' && repository.installation))
      : true))
    .filter(repository => {
      if (!tags.length) return true

      const repositoryTags = repository.tags.map(({ tag }) => tag.toLowerCase())

      return tags.some(tag => repositoryTags.includes(tag))
    })

  const fuse = new Fuse(sortedRepositories, searchOptions)

  const resultRepositories = search
    ? orderBy(fuse.search(search).map(({ item }) => item),
      ['trending', r => r.name.toLowerCase()],
      ['desc', 'asc'])
    : sortedRepositories

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

  function handleClearFilters() {
    setSearch('')
    setSearchParams({})
  }

  function renderTitle() {
    let title = 'All Repositories'

    if (categories.length || tags.length) title += ', filtered'

    return title
  }

  return (
    <Flex
      direction="column"
      overflow="hidden"
      maxWidth-desktopLarge-up={publisher ? null : 1640}
      width-desktopLarge-up={publisher ? null : 1640}
      width-desktopLarge-down="100%"
      flexGrow={publisher ? 1 : 0}
    >
      <Flex
        marginHorizontal="large"
        flexShrink={0}
        height={57}
        alignItems="flex-end"
      >
        {publisher && !backRepositoryName && (
          <GoBack
            text="Back to marketplace"
            link="/marketplace"
          />
        )}
        {publisher && backRepositoryName && (
          <GoBack
            text={`Back to ${capitalize(backRepositoryName)}`}
            link={`/repository/${backRepositoryName}`}
          />
        )}
        {!publisher && (
          <Flex
            paddingBottom="xxsmall"
            paddingTop="xxsmall"
            justify="flex-end"
            flexGrow={1}
            borderBottom="1px solid border"
          >
            <Button
              tertiary
              small
              startIcon={<FiltersIcon />}
              onClick={() => setAreFiltersOpen(x => !x)}
              backgroundColor={
                areFiltersOpen ? 'fill-zero-selected' : 'fill-zero'
              }
            >
              Filters
            </Button>
          </Flex>
        )}
      </Flex>
      <Flex
        flexGrow={1}
        marginTop="medium"
        overflow="hidden"
      >
        {publisher && (
          <>
            <PublisherSideNav publisher={publisher} />
            <ResponsiveLayoutSpacer />
          </>
        )}
        <MainContentArea
          width={publisher ? 928 : null} // 896 + 32 margin
          maxWidth-desktopLarge-up={publisher ? 928 : null}
          width-desktopLarge-up={publisher ? 928 : null}
        >
          {publisher && (
            <Div
              paddingLeft="large"
              paddingRight="large"
            >
              <H1 title1>{capitalize(publisher.name)}'s Apps</H1>
              <Hr
                marginTop="large"
                marginBottom="medium"
              />
            </Div>
          )}
          <Div
            paddingBottom="xxxlarge"
            paddingLeft="large"
            paddingRight="small"
            paddingHorizontal="large"
            marginRight="large"
            overflowY="auto"
            overflowX="hidden"
            position="relative"
            ref={scrollRef}
          >
            <Div
              marginBottom="medium"
              position="sticky"
              top="0"
              backgroundColor="fill-zero"
            >
              <Flex
                align="stretch"
                wrap
                gap="small"
              >
                <Div
                  minWidth="210px"
                  flex="1 1 210px"
                >
                  <Input
                    startIcon={<MagnifyingGlassIcon size={14} />}
                    placeholder="Search for a repository"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                  />
                </Div>
                {categories.map(category => (
                  <Flex
                    key={category}
                    flexDirection="column"
                  >
                    <Chip
                      {...chipProps}
                      onClick={() => handleClearToken('category', category)}
                      onKeyDown={event => (event.key === 'Enter' || event.key === ' ')
                      && handleClearToken('category', category)}
                    >
                      {upperFirst(category)}
                    </Chip>
                  </Flex>
                ))}
                {tags.map(tag => (
                  <Flex
                    key={tag}
                    flexDirection="column"
                  >
                    <Chip
                      {...chipProps}
                      onClick={() => handleClearToken('tag', tag)}
                      onKeyDown={event => (event.key === 'Enter' || event.key === ' ')
                    && handleClearToken('tag', tag)}
                    >
                      {(tag)}
                    </Chip>
                  </Flex>
                ))}
                {!!(categories.length || tags.length) && (
                  <Flex flexDirection="column">
                    <Button
                      height="100%"
                      marginBottom="xsmall"
                      flexShrink={0}
                      tertiary
                      small
                      onClick={() => handleClearTokens()}
                    >
                      Clear all
                    </Button>
                  </Flex>
                )}
              </Flex>
              <Div
                flexShrink={0}
                height={16}
                width="100%"
                background="linear-gradient(0deg, transparent 0%, fill-zero 90%);"
                position="absolute"
                top="100%"
                zIndex={999}
              />
            </Div>
            {shouldRenderStacks && <MarketplaceStacks />}
            {resultRepositories?.length > 0 && !publisher && (
              <H1
                subtitle1
                marginTop={shouldRenderStacks ? 'xlarge' : 0}
              >
                {renderTitle()}
              </H1>
            )}
            <RepoCardList
              repositories={resultRepositories}
              marginTop={publisher ? 0 : 'medium'}
            />
            {loadingRepositories && <LoadingIndicator />}
            {!resultRepositories?.length && (
              <EmptyState
                message="Oops! We couldn't find any apps."
                description="If you can't find what you're looking for, you can onboard the application."
              >
                <Flex
                  direction="column"
                  marginTop="large"
                  gap="medium"
                >
                  <Button
                    as="a"
                    href="https://docs.plural.sh/applications/adding-new-application"
                    target="_blank"
                    primary
                    endIcon={<ArrowTopRightIcon />}
                  >
                    Add an application
                  </Button>
                  {!publisher && (
                    <Button
                      secondary
                      onClick={handleClearFilters}
                    >
                      Clear filters
                    </Button>
                  )}
                </Flex>
              </EmptyState>
            )}
          </Div>
        </MainContentArea>
        {!publisher && (
          <Div
            display="flex"
            flexDirection="column"
            width={sidebarWidth}
            height="auto"
            overflow="hidden"
            marginRight={areFiltersOpen ? 'large' : `-${sidebarWidth}px`}
            transform={areFiltersOpen ? 'translateX(0)' : 'translateX(100%)'}
            opacity={areFiltersOpen ? 1 : 0}
            flexShrink={0}
            position="sticky"
            top={0}
            right={0}
            marginBottom="medium"
            border="1px solid border"
            backgroundColor="fill-one"
            borderRadius="large"
            transition="all 250ms ease"
          >
            <MarketplaceSidebar width="100%" />
          </Div>
        )}
        {publisher && (
          <>
            <ResponsiveLayoutSidecarContainer
              marginRight="large"
              marginLeft={0}
            >
              <PublisherSideCar
                publisher={publisher}
              />
            </ResponsiveLayoutSidecarContainer>
            <ResponsiveLayoutSpacer />
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default MarketplaceRepositories
