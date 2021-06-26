import React, { useState, useContext, useEffect, useCallback } from 'react'
import { Tabs, TabHeader, TabHeaderItem, TabContent, Scroller } from 'forge-core'
import { useQuery } from 'react-apollo'
import { CATEGORIES, CATEGORY, EXPLORE_REPOS } from './repos/queries'
import { Box, Collapsible, Text } from 'grommet'
import { Tag } from './repos/Tags'
import { RepoIcon, RepoName } from './repos/Repositories'
import { BreadcrumbsContext } from './Breadcrumbs'
import { extendConnection } from '../utils/graphql'
import { useHistory } from 'react-router'
import { sortBy } from 'lodash'
import { SafeLink } from './utils/Link'
import { CurrentUserContext } from './login/CurrentUser'
import { Down, Next } from 'grommet-icons'
import './explore.css'


const WIDTH = 20

function EmptyState() {
  return (
    <Box pad='small'>
      <Text weight={500} size='small'>It looks like you haven't installed any repos yet, use the search bar or browse by tag
      to find what you're looking for</Text>
    </Box>
  )
}

function Detail({name, children}) {
  return (
    <Box direction='row' gap='xsmall' align='center' >
      <Text size='small' weight={500}>{name}:</Text>
      {children}
    </Box>
  )
}

function Repo({repo, setTag}) {
  let hist = useHistory()
  return (
    <Box direction='row' gap='medium' align='center' pad='small' border={{side: 'bottom', color: 'light-5'}}
      hoverIndicator='light-1' focusIndicator={false} onClick={() => hist.push(`/repositories/${repo.id}`)}>
      <RepoIcon repo={repo} />
      <Box fill='horizontal' gap='2px'>
        <Box direction='row' align='center' gap='xsmall'>
          <RepoName repo={repo} />
          {sortBy(repo.tags, ['tag']).map(({tag}) => (
            <Box key={tag} round='xsmall' pad={{horizontal: 'xsmall', vertical: '1px'}} background='tone-light'
              hoverIndicator='tone-medium' focusIndicator={false} onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setTag(tag)
              }}>
              <Text size='small'>{tag}</Text>
            </Box>
          ))}
        </Box>
        <Detail name='publisher'>
          <SafeLink to={`/publishers/${repo.publisher.id}`}>{repo.publisher.name}</SafeLink>
        </Detail>
        <Text size='small'><i>{repo.description}</i></Text>
      </Box>
    </Box>
  )
}

function Repositories({edges, pageInfo, fetchMore, setTag}) {
  return (
    <Box fill>
      <Scroller
        id='repos'
        style={{height: '100%', width: '100%', overflow: 'auto'}}
        edges={edges}
        mapper={({node}) => <Repo key={node.id} repo={node} setTag={setTag} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {repositories}}) => extendConnection(prev, repositories, 'repositories')
        })}
      />
    </Box>
  )
}

function CategoryTags({category, tag, setTag}) {
  const {data, fetchMore} = useQuery(CATEGORY, {variables: {category: category.category}})

  if (!data) return null

  const {tags} = data.category

  return (
    <Box flex={false} fill='horizontal'  pad={{vertical: 'xsmall'}} border={{side: 'bottom', color: 'light-6'}}>
      {tags.edges.map(({node}) => (
        <Tag tag={node} setTag={setTag} enabled={tag === node.tag} />
      ))}
      {tags.pageInfo.hasNextPage && (
        <Box flex={false} fill='horizontal' pad={{vertical: 'xsmall', horizontal: 'small'}} 
             hoverIndicator='light-1' 
             onClick={() => fetchMore({
               variables: {cursor: tags.pageInfo.endCursor},
               updateQuery: (prev, {fetchMoreResult: {category}}) => ({
                 ...prev, category: extendConnection(prev.category, category.tags, 'tags')
               })
             })}
        >
          <Text size='small'>more...</Text>
        </Box>
      )}
    </Box>
  )
}

function Category({category, tag, setTag, unfurl}) {
  const [open, setOpen] = useState(unfurl)
  return (
    <>
    <Box className='category-header' flex={false} direction='row' align='center' hoverIndicator='light-1' 
         pad={{horizontal: 'small', vertical: 'xsmall'}}  border={open ? {side: 'bottom', color: 'light-6'} : null}
         onClick={() => setOpen(!open)}>
      <Box fill='horizontal' align='center' gap='xsmall' direction='row'>
        <Text size='small' weight={500}>{category.category.toLowerCase()}</Text>
        <Box className='hoverable' >
          <Text size='small' color='dark-3'>({category.count})</Text>
        </Box>
      </Box>
      <Box flex={false}>
        {open && <Down size='small' />}
        {!open && <Next size='small' />}
      </Box>
    </Box>
    <Collapsible open={open} direction='vertical'>
      <CategoryTags category={category} tag={tag} setTag={setTag} />
    </Collapsible>
    </>
  )
}

function TagSidebar({tag, setTag}) {
  const {data} = useQuery(CATEGORIES)

  if (!data) return null

  const {categories} = data

  return (
    <Box flex={false} width={`${WIDTH}%`} height='100%' style={{overflow: 'auto'}}>
      <Box flex={false}>
        {categories.map((category, ind) => (
          <Category 
            key={category.category}
            unfurl={ind === 0}
            category={category}
            tag={tag}
            setTag={setTag} />
        ))}
      </Box>
    </Box>
  )
}

function filters(tab, me) {
  if (tab === 'Installed') return {installed: true}
  if (tab === 'Published') return {publisherId: me.publisher.id}
  return {}
}

export default function Explore() {
  const [tag, setTag] = useState(null)
  const [tab, setTab] = useState('Public')
  const me = useContext(CurrentUserContext)
  const args = filters(tab, me) 
  const {data, fetchMore} = useQuery(EXPLORE_REPOS, {
    variables: {tag, ...args},
    fetchPolicy: 'cache-and-network'
  })
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => setBreadcrumbs([]), [])
  const doSetTag = useCallback((t) => t === tag ? setTag(null) : setTag(t), [tag, setTag])

  if (!data) return null

  const {repositories: {edges, pageInfo}} = data

  return (
    <Box direction='row' fill>
      <Tabs defaultTab='Public' onTabChange={setTab}>
        <TabHeader>
          <TabHeaderItem name='Public'>
            <Text weight={500} size='small'>Public</Text>
          </TabHeaderItem>
          <TabHeaderItem name='Installed'>
            <Text weight={500} size='small'>Installed</Text>
          </TabHeaderItem>
          {me.publisher && (
            <TabHeaderItem name='Published'>
              <Text weight={500} size='small'>Published</Text>
            </TabHeaderItem>
          )}
        </TabHeader>
        <TabContent name='Public'>
          <Box fill direction='row' gap='0px' border={{side: 'between', color: 'light-5', size: 'xsmall'}}>
            <TagSidebar setTag={doSetTag} tag={tag} />
            <Repositories edges={edges} pageInfo={pageInfo} fetchMore={fetchMore} setTag={doSetTag} />
          </Box>
        </TabContent>
        <TabContent name='Installed'>
          {edges.length > 0 ? 
            <Repositories edges={edges} pageInfo={pageInfo} fetchMore={fetchMore} setTag={doSetTag} /> :
            <EmptyState />
          }
        </TabContent>
        <TabContent name='Published'>
          <Repositories edges={edges} pageInfo={pageInfo} fetchMore={fetchMore} setTag={doSetTag} /> :
        </TabContent>
      </Tabs>
    </Box>
  )
}