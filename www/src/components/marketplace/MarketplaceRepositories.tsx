import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Div, Flex, FlexProps, H1, Hr } from 'honorable'
import {
  ArrowTopRightIcon,
  BrowseAppsIcon,
  Chip,
  EmptyState,
  Input,
  MagnifyingGlassIcon,
} from '@pluralsh/design-system'
import Fuse from 'fuse.js'
import styled, { useTheme } from 'styled-components'
import isEmpty from 'lodash/isEmpty'
import capitalize from 'lodash/capitalize'
import orderBy from 'lodash/orderBy'

import { upperFirst } from 'lodash'

import { ResponsiveLayoutSidecarContainer } from '../utils/layout/ResponsiveLayoutSidecarContainer'
import { ResponsiveLayoutSpacer } from '../utils/layout/ResponsiveLayoutSpacer'

import PublisherSideNav from '../publisher/PublisherSideNav'
import PublisherSideCar from '../publisher/PublisherSideCar'

import LoadingIndicator from '../utils/LoadingIndicator'

import { useMarketplaceRepositoriesQuery } from '../../generated/graphql'

import { usePaginatedQueryHook } from '../../hooks/usePaginatedQuery'

import { ResponsiveLayoutPage } from '../utils/layout/ResponsiveLayoutPage'

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
  minHeight: 32,
}

const MainContentArea = styled(Div)((_) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}))

function SearchBar({ search, setSearch }) {
  return (
    <Div
      minWidth="210px"
      flex="1 1 210px"
    >
      <Input
        titleContent={
          <>
            <BrowseAppsIcon marginRight="small" />
            Marketplace
          </>
        }
        startIcon={
          <MagnifyingGlassIcon
            size={16}
            color="icon-light"
          />
        }
        placeholder="Search the marketplace"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </Div>
  )
}

function MarketplaceRepositories({ publisher }: { publisher?: any }) {
  const theme = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = searchParams.getAll('category')
  const tags = searchParams.getAll('tag')
  const [search, setSearch] = useState('')
  const [areFiltersOpen] = useState(true)

  const [
    repositories,
    loadingRepositories,
    hasMoreRepositories,
    fetchMoreRepositories,
  ] = usePaginatedQueryHook(
    useMarketplaceRepositoriesQuery,
    {
      variables: {
        ...(publisher ? { publisherId: publisher.id } : {}),
      },
    },
    (data) => data.repositories
  )

  const isFiltered = !isEmpty(categories) || !isEmpty(tags)
  const isFilteredOrSearched = isFiltered || search
  const shouldRenderStacks = !isFilteredOrSearched

  useEffect(() => {
    const { current } = scrollRef

    if (!current) return

    function handleScroll(event) {
      if (
        !loadingRepositories &&
        hasMoreRepositories &&
        Math.abs(
          event.target.scrollTop -
            (event.target.scrollHeight - event.target.offsetHeight)
        ) < 32
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

  const sortedRepositories = (
    orderBy(
      repositories,
      [
        'trending',
        (r) => (r as (typeof repositories)[number])?.name?.toLowerCase(),
      ],
      ['desc', 'asc']
    ) as typeof repositories
  )
    .filter((repository) =>
      categories.length
        ? categories.some(
            (category) =>
              category === repository?.category?.toLowerCase() ||
              (category === 'installed' && repository?.installation) ||
              (category === 'trending' && repository.trending)
          )
        : true
    )
    .filter((repository) => {
      if (!tags.length) return true

      const repositoryTags = repository?.tags?.map((t) => t?.tag.toLowerCase())

      return tags.some((tag) => repositoryTags?.includes(tag))
    })

  const fuse = new Fuse(sortedRepositories, searchOptions)

  const resultRepositories = search
    ? (orderBy(
        fuse.search(search).map(({ item }) => item),
        [
          'trending',
          (r) => (r as (typeof repositories)[number])?.name.toLowerCase(),
        ],
        ['desc', 'asc']
      ) as typeof repositories)
    : sortedRepositories

  function handleClearToken(key, value) {
    const existing = searchParams.getAll(key)

    setSearchParams({
      ...searchParams,
      [key]: existing.filter((v) => v !== value),
    })
  }

  function handleClearTokens() {
    setSearchParams({})
  }

  function handleClearFilters() {
    setSearch('')
    setSearchParams({})
  }

  return (
    <ResponsiveLayoutPage
      padding={0}
      overflow="auto"
    >
      <Flex
        direction="column"
        overflow="hidden"
        flexGrow={publisher ? 1 : 0}
      >
        <Flex
          flexGrow={1}
          marginTop="large"
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
              marginBottom="medium"
              paddingHorizontal="large"
              paddingLeft="large"
              paddingRight={areFiltersOpen ? 'small' : 'large'}
              marginRight={areFiltersOpen ? 'large' : '0'}
              overflowY="auto"
              scrollbarGutter="stable"
              overflowX="hidden"
              position="relative"
              ref={scrollRef}
            >
              <Flex
                flexDirection="column"
                gap="small"
                marginBottom="medium"
                position="sticky"
                top="0"
                backgroundColor="fill-zero"
                zIndex={1}
              >
                <Flex gap="small">
                  <SearchBar
                    search={search}
                    setSearch={setSearch}
                  />
                  {/* <FiltersButton
                    setAreFiltersOpen={setAreFiltersOpen}
                    areFiltersOpen={areFiltersOpen}
                  /> */}
                </Flex>
                {isFiltered && (
                  <FilterChips
                    categories={categories}
                    handleClearToken={handleClearToken}
                    tags={tags}
                    handleClearTokens={handleClearTokens}
                  />
                )}
                <Div
                  flexShrink={0}
                  height={16}
                  width="100%"
                  background="linear-gradient(0deg, transparent 0%, fill-zero 90%);"
                  position="absolute"
                  top="100%"
                  zIndex={999}
                />
              </Flex>
              {shouldRenderStacks && <MarketplaceStacks />}
              {resultRepositories?.length > 0 &&
                !publisher &&
                !isFilteredOrSearched && (
                  <H1
                    subtitle1
                    marginTop={shouldRenderStacks ? 'xlarge' : 0}
                  >
                    All Apps
                  </H1>
                )}
              <RepoCardList
                repositories={resultRepositories}
                css={{
                  marginTop: publisher ? 0 : theme.spacing.medium,
                }}
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
          {!publisher && <MarketplaceSidebar isOpen={areFiltersOpen} />}
          {publisher && (
            <>
              <ResponsiveLayoutSidecarContainer
                marginRight="large"
                marginLeft={0}
              >
                <PublisherSideCar publisher={publisher} />
              </ResponsiveLayoutSidecarContainer>
              <ResponsiveLayoutSpacer />
            </>
          )}
        </Flex>
      </Flex>
      {!publisher && <ResponsiveLayoutSpacer />}
    </ResponsiveLayoutPage>
  )
}

export default MarketplaceRepositories

// NOTE: Disabling Filters column expand/collapse functionality, but leaving
// code here in case we want to revert that decision.

// function FiltersButton({
//   setAreFiltersOpen,
//   areFiltersOpen,
// }: {
//   setAreFiltersOpen: Dispatch<SetStateAction<boolean>>
//   areFiltersOpen: boolean
// }) {
//   return (
//     <Button
//       tertiary
//       small
//       startIcon={<FiltersIcon />}
//       onClick={() => setAreFiltersOpen(x => !x)}
//       backgroundColor={areFiltersOpen ? 'fill-zero-selected' : 'fill-zero'}
//     >
//       Filters
//     </Button>
//   )
// }

function FilterChips({
  categories,
  handleClearToken,
  tags,
  handleClearTokens,
  ...props
}: {
  categories: string[]
  handleClearToken: (key: any, value: any) => void
  tags: string[]
  handleClearTokens: () => void
} & FlexProps) {
  return (
    <Flex
      gap="small"
      wrap="wrap"
      {...props}
    >
      {categories.map((category) => (
        <Chip
          {...chipProps}
          onClick={() => handleClearToken('category', category)}
          onKeyDown={(event) =>
            (event.key === 'Enter' || event.key === ' ') &&
            handleClearToken('category', category)
          }
        >
          {upperFirst(category)}
        </Chip>
      ))}
      {tags.map((tag) => (
        <Chip
          {...chipProps}
          onClick={() => handleClearToken('tag', tag)}
          onKeyDown={(event) =>
            (event.key === 'Enter' || event.key === ' ') &&
            handleClearToken('tag', tag)
          }
        >
          {tag}
        </Chip>
      ))}
      <Button
        flexShrink={0}
        tertiary
        small
        onClick={() => handleClearTokens()}
      >
        Clear all
      </Button>
    </Flex>
  )
}
