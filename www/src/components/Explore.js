import React, { useState, useContext, useEffect, useCallback } from 'react'
import { Tabs, TabHeader, TabHeaderItem, TabContent, Scroller } from 'forge-core'
import { useQuery } from 'react-apollo'
import { EXPLORE_REPOS, REPO_TAGS } from './repos/queries'
import { Box, Text, TextInput } from 'grommet'
import Tags from './repos/Tags'
import { RepoIcon, RepoName } from './repos/Repositories'
import { Search } from 'grommet-icons'
import { BreadcrumbsContext } from './Breadcrumbs'
import { extendConnection } from '../utils/graphql'
import { useHistory } from 'react-router'
import { Link } from 'react-router-dom'

const WIDTH = 15

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
    <Box direction='row' gap='small' align='center' onClick={(e) => e.stopPropagation()} focusIndicator={false}>
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
          {repo.tags.map(({tag}) => (
            <Box key={tag} round='xsmall' pad={{horizontal: 'xsmall', vertical: '1px'}} background='light-2'
              hoverIndicator='light-4' focusIndicator={false} onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setTag(tag)
              }}>
              <Text size='small'>{tag}</Text>
            </Box>
          ))}
        </Box>
        <Detail name='publisher'>
          <Link to={`/publishers/${repo.publisher.id}`}>{repo.publisher.name}</Link>
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
        mapper={({node}) => <Repo repo={node} setTag={setTag} />}
        onLoadMore={() => pageInfo.hasNextPage && fetchMore({
          variables: {cursor: pageInfo.endCursor},
          updateQuery: (prev, {fetchMoreResult: {repositories}}) => extendConnection(prev, repositories, 'repositories')
        })}
      />
    </Box>
  )
}

function TagSidebar({tag, setTag}) {
  const [q, setQ] = useState('')
  const {data, fetchMore} = useQuery(REPO_TAGS, {
    variables: {q: q === '' ? null : q}
  })

  if (!data) return null

  const {tags} = data

  return (
    <Box width={`${WIDTH}%`} height='100%' border={{side: 'right', color: 'light-6'}}>
      <Box flex={false} margin='small' direction='row' align='center'
            gap='xsmall' border={{side: 'bottom', color: 'light-3'}}>
        <Search size='14px' />
        <TextInput plain value={q || ''} onChange={({target: {value}}) => setQ(value)} />
      </Box>
      <Tags pad={{vertical: 'xsmall'}} tags={tags} setTag={setTag} fetchMore={fetchMore} tag={tag} />
    </Box>
  )
}

export default function Explore() {
  const [tag, setTag] = useState(null)
  const [installed, setInstalled] = useState(false)
  const {data, fetchMore} = useQuery(EXPLORE_REPOS, {
    variables: {tag, installed},
    fetchPolicy: 'cache-and-network'
  })
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => setBreadcrumbs([]), [])
  const doSetTag = useCallback((t) => t === tag ? setTag(null) : setTag(t), [tag, setTag])

  if (!data) return null

  const {repositories: {edges, pageInfo}} = data

  return (
    <Box direction='row' fill>
      <Tabs defaultTab='Public' onTabChange={(tab) => setInstalled(tab !== 'Public')}>
        <TabHeader>
          <TabHeaderItem name='Public'>
            <Text weight={500} size='small'>Public</Text>
          </TabHeaderItem>
          <TabHeaderItem name='Installed'>
            <Text weight={500} size='small'>Installed</Text>
          </TabHeaderItem>
        </TabHeader>
        <TabContent name='Public'>
          <Box fill direction='row' gap='0px' border={{side: 'between', color: 'light-5'}}>
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
      </Tabs>
    </Box>
  )
}