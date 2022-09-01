import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  A, Br, Button, Div, Flex, H1, Hr, Span, useMediaQuery,
} from 'honorable'
import {
  ArrowTopRightIcon,
  Chip,
  EmptyState,
  FiltersIcon,
  Input,
  MagnifyingGlassIcon,
  RepositoryCard,
  Tab,
  TabList,
  TabPanel,
} from 'pluralsh-design-system'
import Fuse from 'fuse.js'
import styled from 'styled-components'
import { isEmpty } from 'lodash'

import { capitalize } from '../../utils/string'
import usePaginatedQuery from '../../hooks/usePaginatedQuery'

import { GoBack } from '../utils/GoBack'
import { LoopingLogo } from '../utils/AnimatedLogo'
import { LinkTabWrap } from '../utils/Tabs'

import TopBar from '../layout/TopBar'
import { ResponsiveLayoutSidecarContainer, ResponsiveLayoutSpacer } from '../layout/ResponsiveLayout'

import PublisherSideNav from '../publisher/PublisherSideNav'
import PublisherSideCar from '../publisher/PublisherSideCar'

import { MARKETPLACE_QUERY } from './queries'

import MarketplaceSidebar from './MarketplaceSidebar'

const searchOptions = {
  keys: ['name', 'description', 'tags.tag'],
  threshold: 0.25,
}

const chipProps = {
  marginRight: 'xsmall',
  marginBottom: 'xsmall',
  flexShrink: 0,
  tabIndex: 0,
  closeButton: true,
  clickable: true,
}

const sidebarWidth = 256 - 32

function RepoCardList({
  repositories, repoProps, maxWidth, stretchLastRow = false, size = 'small', ...props
}) {
  const flexBasis = '400px'

  // Workaround that will render empty columns to align the last row.
  // It is better to use bigger columns number to prevent issues on all kinds of viewports.
  function fillEmptyColumns(columns) {
    return (
      <>
        {[...Array(columns)].map((x, i) => (
          <Flex
            key={i}
            flexGrow={1}
            flexBasis={flexBasis}
          />
        ))}
      </>
    )
  }

  return (
    <Flex
      mx={-1}
      align="stretch"
      wrap="wrap"
      {...props}
    >
      {
        repositories.map(repository => (
          <Flex
            key={`${repository.id}flex`}
            px={0.75}
            marginBottom="large"
            width="auto"
            flexBasis={flexBasis}
            flexGrow={1}
            flexShrink={1}
            minWidth="250px"
            maxWidth={maxWidth || '800px'}
          >
            <RepositoryCard
              key={repository.id}
              as={Link}
              to={`/repository/${repository.id}`}
              color="text"
              textDecoration="none"
              width="100%"
              title={repository.name}
              imageUrl={repository.darkIcon || repository.icon}
              publisher={repository.publisher?.name}
              description={repository.description}
              tags={repository.tags.map(({ tag }) => tag)}
              priv={repository.private}
              installed={!!repository.installation}
              verified={repository.verified}
              size={size}
              {...repoProps}
            />
          </Flex>
        ))
      }
      {!stretchLastRow && fillEmptyColumns(10)}
    </Flex>
  )
}

const StyledTabPanel = styled(TabPanel)(() => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}))

function MarketplaceRepositories({ installed, publisher }) {
  const scrollRef = useRef()
  const [searchParams, setSearchParams] = useSearchParams()
  const categories = searchParams.getAll('category')
  const tags = searchParams.getAll('tag')
  const backRepositoryName = searchParams.get('backRepositoryName')
  const backRepositoryId = searchParams.get('backRepositoryId')
  const [search, setSearch] = useState('')
  const [areFiltersOpen, setAreFiltersOpen] = useState(true)
  const tabStateRef = useRef()
  const isDesktopLarge = useMediaQuery('up', 'desktopLarge')

  const [repositories, loadingRepositories, hasMoreRepositories, fetchMoreRepositories] = usePaginatedQuery(MARKETPLACE_QUERY,
    {
      variables: {
        ...(publisher ? { publisherId: publisher.id } : {}),
      },
    },
    data => data.repositories)

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
        flexGrow={1}
      >
        <LoopingLogo />
      </Flex>
    )
  }

  const sortedRepositories = repositories.slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter(repository => (categories.length ? categories.includes(repository.category.toLowerCase()) : true))
    .filter(repository => {
      if (!tags.length) return true

      const repositoryTags = repository.tags.map(({ tag }) => tag.toLowerCase())

      return tags.some(tag => repositoryTags.includes(tag))
    })
    .filter(repository => (installed ? repository.installation : true))

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

  function handleClearFilters() {
    setSearch('')
    setSearchParams({})
  }

  function renderFeatured() {
    if (publisher) return null

    const featuredA = sortedRepositories.shift()
    const featuredB = sortedRepositories.shift()

    return (
      <>
        <H1 subtitle1>
          Featured Repositories
        </H1>
        <RepoCardList
          repositories={[featuredA, featuredB]}
          repoProps={{ featured: true }}
          marginTop="medium"
          maxWidth="100%"
          stretchLastRow
          size={isDesktopLarge ? 'large' : 'medium'}
        />
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
      overflow="hidden"
      maxWidth-desktopLarge-up={publisher ? null : 1640}
      width-desktopLarge-up={publisher ? null : 1640}
      width-desktopLarge-down="100%"
      flexGrow={publisher ? 1 : 0}
    >
      <TopBar>
        {!publisher && (
          <TabList
            stateRef={tabStateRef}
            stateProps={{
              orientation: 'horizontal',
              selectedKey: installed ? 'installed' : 'marketplace',
            }}
          >
            <LinkTabWrap
              key="marketplace"
              textValue="Marketplace"
              to="/marketplace"
            >
              <Tab>Marketplace</Tab>
            </LinkTabWrap>
            <LinkTabWrap
              key="installed"
              textValue="Installed"
              to="/installed"
            >
              <Tab>Installed</Tab>
            </LinkTabWrap>
          </TabList>
        )}
        {publisher && !(backRepositoryName && backRepositoryId) && (
          <GoBack
            text="Back to marketplace"
            link="/marketplace"
          />
        )}
        {publisher && backRepositoryName && backRepositoryId && (
          <GoBack
            text={`Back to ${capitalize(backRepositoryName)}`}
            link={`/repository/${backRepositoryId}`}
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
              backgroundColor={areFiltersOpen ? 'fill-zero-selected' : 'fill-zero'}
            >
              Filters
            </Button>
          </Flex>
        )}
      </TopBar>
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
        <StyledTabPanel
          stateRef={tabStateRef}
          width={publisher ? 928 : null} // 896 + 32 margin
          maxWidth-desktopLarge-up={publisher ? 928 : null}
          width-desktopLarge-up={publisher ? 928 : null}
        >
          <Div position="relative">
            {publisher && (
              <Div paddingHorizontal="large">
                <H1 title1>
                  {capitalize(publisher.name)}'s Apps
                </H1>
                <Hr
                  marginTop="large"
                  marginBottom="medium"
                />
              </Div>
            )}
            <Flex
              paddingHorizontal="large"
              align="stretch"
              wrap
              marginBottom="-8px"
              paddingVertical={2}
            >
              <Div
                minWidth="210px"
                flex="1 1 210px"
                marginBottom="xsmall"
              >
                <Input
                  startIcon={(
                    <MagnifyingGlassIcon
                      size={14}
                    />
                  )}
                  placeholder="Search for a repository"
                  marginRight={[...categories, ...tags].length ? 'xsmall' : 'none'}
                  value={search}
                  onChange={event => setSearch(event.target.value)}
                />
              </Div>
              {categories.map(category => (
                <Chip
                  {...chipProps}
                  onClick={() => handleClearToken('category', category)}
                  onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && handleClearToken('category', category)}
                >
                  {capitalize(category)}
                </Chip>
              ))}
              {tags.map(tag => (
                <Chip
                  {...chipProps}
                  onClick={() => handleClearToken('tag', tag)}
                  onKeyDown={event => (event.key === 'Enter' || event.key === ' ') && handleClearToken('tag', tag)}
                >
                  {capitalize(tag)}
                </Chip>
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
            paddingTop="medium"
            paddingBottom="xxxlarge"
            paddingHorizontal="large"
            margin="xxsmall"
            overflowY="auto"
            overflowX="hidden"
            position="relative"
            ref={scrollRef}
          >
            {shouldRenderFeatured && renderFeatured()}
            {resultRepositories?.length > 0 && !publisher && (
              <H1
                subtitle1
                marginTop={shouldRenderFeatured ? 'xlarge' : 0}
              >
                {renderTitle()}
              </H1>
            )}
            <RepoCardList
              repositories={resultRepositories}
              marginTop={publisher ? 0 : 'medium'}
            />
            {loadingRepositories && (
              <Flex
                marginTop="xlarge"
                align="center"
                justify="center"
              >
                <LoopingLogo />
              </Flex>
            )}
            {!resultRepositories?.length && installed && ![...searchParams]?.length && isEmpty(search) && (
              <EmptyState
                message="Looks like you haven't installed your first app yet."
              >
                <Span>
                  Head back to the marketplace to select your first application! If you need
                  <Br />support installing your first app, read our&nbsp;
                  <A
                    inline
                    href="https://docs.plural.sh/getting-started/getting-started"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    quickstart guide
                  </A>.
                </Span>
                <Button
                  as={Link}
                  to="/marketplace"
                  marginTop="medium"
                >
                  Go to marketplace
                </Button>
              </EmptyState>
            )}
            {!resultRepositories?.length && !installed && (
              <EmptyState
                message="Oops! We couln't find any apps."
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
                    endIcon={(<ArrowTopRightIcon />)}
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
        </StyledTabPanel>
        {!publisher && (
          <Div
            marginRight={areFiltersOpen ? 'large' : `-${sidebarWidth}px`}
            transform={areFiltersOpen ? 'translateX(0)' : 'translateX(100%)'}
            opacity={areFiltersOpen ? 1 : 0}
            flexShrink={0}
            position="sticky"
            top={0}
            right={0}
            width={sidebarWidth}
            height="calc(100% - 16px)"
            overflowY="auto"
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
            <ResponsiveLayoutSidecarContainer>
              <PublisherSideCar publisher={publisher} />
            </ResponsiveLayoutSidecarContainer>
            <ResponsiveLayoutSpacer />
          </>
        )}
      </Flex>
    </Flex>
  )
}

export default MarketplaceRepositories
