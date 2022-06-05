import './explore.css'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@apollo/client'
import { Box, Collapsible, Text } from 'grommet'
import { useNavigate, useParams } from 'react-router-dom'
import sortBy from 'lodash.sortby'
import { Down, Next } from 'grommet-icons'
import { Portal } from 'react-portal'
import { v4 as uuidv4 } from 'uuid'

import { extendConnection } from '../utils/graphql'

import { CurrentUserContext } from './login/CurrentUser'
import { SafeLink } from './utils/Link'
import { BreadcrumbsContext } from './Breadcrumbs'
import { RepoIcon, RepoName } from './repos/Repositories'
import { Tag } from './repos/Tags'
import { CATEGORIES, CATEGORY, EXPLORE_REPOS } from './repos/queries'
import { StandardScroller } from './utils/SmoothScroller'
import { LoopingLogo } from './utils/AnimatedLogo'
import { ignore } from './utils/ModalHeader'

const WIDTH = 20

function EmptyState() {
  return (
    <Box pad="small">
      <Text
        weight={500}
        size="small"
      >
        It looks like you haven't installed any repos yet, use the search bar or browse by tag
        to find what you're looking for
      </Text>
    </Box>
  )
}

function RepoTag({ tag, setTag }) {
  return (
    <Box
      round="xsmall"
      background="card"
      pad={{ horizontal: 'xsmall', vertical: '1px' }}
      hoverIndicator="hover"
      focusIndicator={false}
      onClick={e => {
        ignore(e)
        setTag(tag)
      }}
    >
      <Text
        size="small"
        color="text"
      >
        {tag}
      </Text>
    </Box>
  )
}

function Repo({ repo, setTag }) {
  const navigate = useNavigate()

  return (
    <Box
      direction="row"
      gap="medium"
      align="center"
      pad="small"
      border={{ side: 'bottom' }}
      hoverIndicator="fill-one"
      focusIndicator={false}
      onClick={() => navigate(`/repositories/${repo.id}`)}
    >
      <RepoIcon
        repo={repo}
      />
      <Box
        fill="horizontal"
        gap="2px"
      >
        <Box
          direction="row"
          align="center"
          gap="xsmall"
        >
          <RepoName repo={repo} />
          {sortBy(repo.tags, ['tag']).map(({ tag }) => (
            <RepoTag
              key={tag}
              tag={tag}
              setTag={setTag}
            />
          ))}
        </Box>
        <Box
          direction="row"
          gap="xsmall"
          align="center"
        >
          <Text
            size="small"
            color="text-light"
          >publisher:
          </Text>
          <SafeLink to={`/publishers/${repo.publisher.id}`}>{repo.publisher.name}</SafeLink>
        </Box>
        <Text
          size="small"
          color="dark-3"
        ><i>{repo.description}</i>
        </Text>
      </Box>
    </Box>
  )
}

function Placeholder() {
  return (
    <Box
      height="90px"
      direction="row"
      pad="small"
    >
      <Box
        height="50px"
        width="50px"
        background="tone-light"
      />
      <Box
        fill="horizontal"
        gap="xsmall"
      >
        <Box
          width="200px"
          height="13px"
          background="tone-light"
        />
        <Box
          width="400px"
          height="13px"
          background="tone-light"
        />
      </Box>
    </Box>
  )
}

function Repositories({ edges, pageInfo, loading, fetchMore, setTag }) {
  const [listRef, setListRef] = useState(null)

  return (
    <Box fill>
      <StandardScroller
        listRef={listRef}
        setListRef={setListRef}
        hasNextPage={pageInfo.hasNextPage}
        items={edges}
        loading={loading}
        placeholder={Placeholder}
        mapper={({ node }) => (
          <Repo
            key={node.id}
            repo={node}
            setTag={setTag}
          />
        )}
        loadNextPage={() => pageInfo.hasNextPage && fetchMore({
          variables: { cursor: pageInfo.endCursor },
          updateQuery: (prev, { fetchMoreResult: { repositories } }) => extendConnection(prev, repositories, 'repositories'),
        })}
      />
    </Box>
  )
}

function CategoryTags({ category, tag, setTag }) {
  const { data, fetchMore } = useQuery(CATEGORY, { variables: { category: category.category } })
  const loadMore = useCallback(() => fetchMore({
    variables: { cursor: data.category.tags.pageInfo.endCursor },
    updateQuery: (prev, { fetchMoreResult: { category } }) => ({
      ...prev, category: extendConnection(prev.category, category.tags, 'tags'),
    }),
  }), [data, fetchMore])

  if (!data) return null

  const { tags } = data.category

  return (
    <Box
      flex={false}
      fill="horizontal"
      pad={{ vertical: 'xsmall' }}
      border={{ side: 'bottom' }}
    >
      {tags.edges.map(({ node }) => (
        <Tag
          key={node.tag}
          tag={node}
          setTag={setTag}
          enabled={tag === node.tag}
        />
      ))}
      {tags.pageInfo.hasNextPage && (
        <Box
          flex={false}
          pad="xsmall"
          margin={{ horizontal: 'xsmall' }}
          round="xsmall"
          hoverIndicator="fill-one"
          onClick={loadMore}
        >
          <Text size="small">see more...</Text>
        </Box>
      )}
    </Box>
  )
}

function Category({ category, tag, setTag, unfurl }) {
  const [open, setOpen] = useState(unfurl)

  return (
    <>
      <Box
        className="category-header"
        flex={false}
        direction="row"
        align="center"
        hoverIndicator="fill-one"
        pad={{ horizontal: 'small', vertical: 'xsmall' }}
        border={open ? { side: 'bottom' } : null}
        onClick={() => setOpen(!open)}
      >
        <Box
          fill="horizontal"
          align="center"
          gap="xsmall"
          direction="row"
        >
          <Text
            size="small"
            weight={500}
          >
            {category.category.toLowerCase()}
          </Text>
          <Box className="hoverable">
            <Text
              size="small"
              color="dark-3"
            >
              ({category.count})
            </Text>
          </Box>
        </Box>
        <Box flex={false}>
          {open && <Down size="small" />}
          {!open && <Next size="small" />}
        </Box>
      </Box>
      <Collapsible
        open={open}
        direction="vertical"
      >
        <CategoryTags
          category={category}
          tag={tag}
          setTag={setTag}
        />
      </Collapsible>
    </>
  )
}

function TagSidebar({ tag, setTag }) {
  const { data } = useQuery(CATEGORIES)

  if (!data) return null

  const { categories } = data

  return (
    <Box
      flex={false}
      width={`${WIDTH}%`}
      height="100%"
      style={{ overflow: 'auto' }}
    >
      <Box flex={false}>
        {categories.map(category => (
          <Category
            key={category.category}
            unfurl={false}
            category={category}
            tag={tag}
            setTag={setTag}
          />
        ))}
      </Box>
    </Box>
  )
}

function filters(tab, me) {
  if (tab === 'installed') return { installed: true }
  if (tab === 'published') return { publisherId: me.publisher.id }

  return {}
}

export const SectionContext = createContext({})

export function SectionPortal({ children }) {
  const { ref } = useContext(SectionContext)

  return (
    <Portal node={ref}>
      {children}
    </Portal>
  )
}

export function SectionContentContainer({ header: h, children, borderLeft }) {
  const [header, setHeader] = useState(h)
  const [ref, setRef] = useState(null)
  const id = useMemo(() => uuidv4(), [])
  const value = useMemo(() => ({ id, ref, setHeader }), [id, ref, setHeader])

  return (
    <SectionContext.Provider value={value}>
      <Box fill>
        <Box
          flex={false}
          direction="row"
          pad="small"
          height="45px"
          border={borderLeft ? [{ side: 'bottom' }, { side: 'left' }] : [{ side: 'bottom' }]}
          align="center"
          background="fill-one"
        >
          <Box fill="horizontal">
            <Text
              size="small"
              weight={500}
            >
              {header}
            </Text>
          </Box>
          <Box
            ref={setRef}
            id={id}
            flex={false}
          />
        </Box>
        <Box fill>
          {children}
        </Box>
      </Box>
    </SectionContext.Provider>
  )
}

export function SectionItemContainer({ label, icon, selected, location, ...props }) {
  const navigate = useNavigate()

  return (
    <Box
      flex={false}
      pad="small"
      round="3px"
      background={selected ? 'fill-one' : null}
      fill="horizontal"
      align="center"
      gap="small"
      direction="row"
      hoverIndicator="fill-one"
      onClick={selected ? null : () => navigate(location)}
      {...props}
    >
      <Box flex={false}>
        {icon}
      </Box>
      <Box fill="horizontal">
        {label}
      </Box>
    </Box>
  )
}

export function SectionItem({ name, label, icon }) {
  const { group } = useParams()

  return (
    <SectionItemContainer
      label={label}
      icon={icon}
      selected={name === group}
      location={`/explore/${name}`}
    />
  )
}

export function SectionContent({ name, header, children }) {
  const { group } = useParams()
  if (group !== name) return null

  return (
    <SectionContentContainer header={header}>
      {children}
    </SectionContentContainer>
  )
}

export default function Explore() {
  const { group, tag } = useParams()
  const navigate = useNavigate()
  const me = useContext(CurrentUserContext)
  const args = filters(group, me)
  const { data, loading, fetchMore } = useQuery(EXPLORE_REPOS, {
    variables: { tag, ...args },
    fetchPolicy: 'cache-and-network',
  })
  const { setBreadcrumbs } = useContext(BreadcrumbsContext)
  useEffect(() => {
    const crumbs = [
      { url: '/explore', text: 'explore' },
      { url: `/explore/${group}`, text: group },
    ]
    if (tag) crumbs.push({ url: `/explore/${group}/${tag}`, text: tag })
    setBreadcrumbs(crumbs)
  }, [group, tag, setBreadcrumbs])
  const doSetTag = useCallback(t => (
    t === tag ? navigate('/explore/public') :
      navigate(`/explore/public/${t}`)
  ), [tag, navigate])

  const refreshBy = `${group}:${tag}`

  if (!data) {
    return (
      <LoopingLogo />
    )
  }

  const { repositories: { edges, pageInfo } } = data

  return (
    <Box
      direction="row"
      fill
    >
      <Box fill>
        <SectionContent
          name="public"
          header="Public Repositories"
        >
          <Box
            fill
            direction="row"
            border={{ side: 'between' }}
          >
            <TagSidebar
              setTag={doSetTag}
              tag={tag}
            />
            <Repositories
              refreshBy={refreshBy}
              edges={edges}
              loading={loading}
              pageInfo={pageInfo}
              fetchMore={fetchMore}
              setTag={doSetTag}
            />
          </Box>
        </SectionContent>
        <SectionContent
          name="installed"
          header="Installed Repositories"
        >
          {edges.length > 0 ? (
            <Repositories
              refreshBy={refreshBy}
              edges={edges}
              loading={loading}
              pageInfo={pageInfo}
              fetchMore={fetchMore}
              setTag={doSetTag}
            />
          ) :
            <EmptyState />}
        </SectionContent>
        <SectionContent
          name="published"
          header="Published Repositories"
        >
          <Repositories
            refreshBy={refreshBy}
            edges={edges}
            loading={loading}
            pageInfo={pageInfo}
            fetchMore={fetchMore}
            setTag={doSetTag}
          /> :
        </SectionContent>
      </Box>
    </Box>
  )
}
