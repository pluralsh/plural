import React, { useState, useContext, useEffect, useCallback, useMemo } from 'react'
import { Scroller } from 'forge-core'
import { useQuery } from 'react-apollo'
import { CATEGORIES, CATEGORY, EXPLORE_REPOS } from './repos/queries'
import { Box, Collapsible, Text } from 'grommet'
import { Tag } from './repos/Tags'
import { RepoIcon, RepoName } from './repos/Repositories'
import { BreadcrumbsContext } from './Breadcrumbs'
import { extendConnection } from '../utils/graphql'
import { useHistory, useParams } from 'react-router'
import { sortBy } from 'lodash'
import { SafeLink } from './utils/Link'
import { CurrentUserContext } from './login/CurrentUser'
import { Down, InstallOption, Next, Share, ShareOption } from 'grommet-icons'
import { Portal } from 'react-portal'
import { v4 as uuidv4 } from 'uuid'
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
  const loadMore = useCallback(() => fetchMore({
    variables: {cursor: data.category.tags.pageInfo.endCursor},
    updateQuery: (prev, {fetchMoreResult: {category}}) => ({
      ...prev, category: extendConnection(prev.category, category.tags, 'tags')
    })
  }), [data, fetchMore])

  if (!data) return null

  const {tags} = data.category

  return (
    <Box flex={false} fill='horizontal'  pad={{vertical: 'xsmall'}} border={{side: 'bottom', color: 'light-6'}}>
      {tags.edges.map(({node}) => (
        <Tag key={node.tag} tag={node} setTag={setTag} enabled={tag === node.tag} />
      ))}
      {tags.pageInfo.hasNextPage && (
        <Box flex={false} pad='xsmall' margin={{horizontal: 'xsmall'}} 
             round='xsmall' hoverIndicator='tone-light' onClick={loadMore}>
          <Text size='small'>see more...</Text>
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
  if (tab === 'installed') return {installed: true}
  if (tab === 'published') return {publisherId: me.publisher.id}
  return {}
}

export const SectionContext = React.createContext({})

export function SectionPortal({children}) {
  const {id} = useContext(SectionContext)

  return (
    <Portal node={document && document.getElementById(id)}>
      {children}
    </Portal>
  )
}

export function SectionContentContainer({header, children}) {
  const id = useMemo(() => uuidv4(), [])

  return (
    <SectionContext.Provider value={{id}}>
      <Box fill>
        <Box flex={false} direction='row' pad='small' height='45px'  
             border={{side: 'bottom', color: 'light-5'}} align='center'>
          <Box fill='horizontal'>
            <Text size='small' weight={500}>{header}</Text>
          </Box>
          <Box id={id} flex={false} />
        </Box>
        <Box fill>
          {children}
        </Box>
      </Box>
    </SectionContext.Provider>
  )
}

export function SectionItemContainer({label, icon, selected, location, ...props}) {
  let hist = useHistory()
  return (
    <Box flex={false} pad='small' round='xsmall' background={selected ? '#000' : null} fill='horizontal' 
         align='center' gap='small' direction='row' hoverIndicator='#000'
         onClick={selected ? null : () => hist.push(location)} {...props}>
      <Box flex={false}>
        {icon}
      </Box>
      <Box fill='horizontal'>
        {label}
      </Box>
    </Box>
  )
}

export function SectionItem({name, label, icon}) {
  const {group} = useParams()
  return (
    <SectionItemContainer
      label={label}
      icon={icon}
      selected={name === group}
      location={`/explore/${name}`} />
  )
}

export function SectionContent({name, header, children}) {
  const {group} = useParams()
  if (group !== name) return null

  return (
    <SectionContentContainer header={header}>
      {children}
    </SectionContentContainer>
  )
}

export default function Explore() {
  const {group, tag} = useParams()
  let history = useHistory()
  const me = useContext(CurrentUserContext)
  const args = filters(group, me) 
  const {data, fetchMore} = useQuery(EXPLORE_REPOS, {
    variables: {tag, ...args},
    fetchPolicy: 'cache-and-network'
  })
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => {
    let crumbs = [
      {url: '/explore', text: 'explore'},
      {url: `/explore/${group}`, text: group}
    ]
    if (tag) crumbs.push({url: `/explore/${group}/${tag}`, text: tag})
    setBreadcrumbs(crumbs)
  }, [group, tag])
  const doSetTag = useCallback((t) => (
    t === tag ? history.push('/explore/public') : 
                history.push(`/explore/public/${t}`)
  ), [tag])

  if (!data) return null

  const {repositories: {edges, pageInfo}} = data

  return (
    <Box direction='row' fill>
      <Box flex={false} width='175px' background='backgroundColor' fill='vertical' pad={{vertical: 'medium', right: 'small'}} gap='xsmall'>
        <SectionItem name='public' label='Public' icon={<ShareOption size='14px' />} />
        <SectionItem name='installed' label='Installed' icon={<InstallOption size='14px' />} />
        {me.publisher && <SectionItem name='published' label='Published' icon={<Share size='14px' />} />}
      </Box>
      <Box fill>
        <SectionContent name='public' header='Public Repositories'>
          <Box fill direction='row' gap='0px' border={{side: 'between', color: 'light-5', size: 'xsmall'}}>
            <TagSidebar setTag={doSetTag} tag={tag} />
            <Repositories edges={edges} pageInfo={pageInfo} fetchMore={fetchMore} setTag={doSetTag} />
          </Box>
        </SectionContent>
        <SectionContent name='installed' header='Installed Repositories'>
          {edges.length > 0 ? 
            <Repositories edges={edges} pageInfo={pageInfo} fetchMore={fetchMore} setTag={doSetTag} /> :
            <EmptyState />
          }
        </SectionContent>
        <SectionContent name='published' header='Published Repositories'>
          <Repositories edges={edges} pageInfo={pageInfo} fetchMore={fetchMore} setTag={doSetTag} /> :
        </SectionContent>
      </Box>
    </Box>
  )
}