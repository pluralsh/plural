import React, { useState, useContext, useEffect } from 'react'
import { useQuery } from 'react-apollo'
import { EXPLORE_REPOS } from './repos/queries'
import { Box, Text, TextInput } from 'grommet'
import Tags from './repos/Tags'
import { TagHeader } from './repos/Integrations'
import { RepositoryList } from './repos/Repositories'
import { Search } from 'grommet-icons'
import { BreadcrumbsContext } from './Breadcrumbs'

const WIDTH = 15

function EmptyState() {
  return (
    <Box pad='small'>
      <Text style={{fontWeight: 500}} size='small'>It looks like you haven't installed any repos yet, use the search bar or browse by tag
      to find what you're looking for</Text>
    </Box>
  )
}

export default function Explore() {
  const [q, setQ] = useState(null)
  const [tag, setTag] = useState(null)
  const {data, fetchMore} = useQuery(EXPLORE_REPOS, {
    variables: {tag, q: q === '' ? null : q},
    fetchPolicy: 'cache-and-network'
  })
  const {setBreadcrumbs} = useContext(BreadcrumbsContext)
  useEffect(() => setBreadcrumbs([]), [])

  if (!data) return null

  const {tags, repositories} = data

  return (
    <Box direction='row' fill='horizontal' height='100%'>
      <Box width={`${WIDTH}%`} height='100%' border={{side: 'right', color: 'light-6'}}>
        <Box flex={false} margin='small' direction='row' align='center'
             gap='xsmall' border={{side: 'bottom', color: 'light-3'}}>
          <Search size='14px' />
          <TextInput plain value={q || ''} onChange={({target: {value}}) => setQ(value)} />
        </Box>
        <Tags pad={{vertical: 'xsmall'}} tags={tags} setTag={setTag} fetchMore={fetchMore} tag={tag} />
      </Box>
      <Box pad='medium' width={`${100 - WIDTH}%`} height='100%' gap='small'>
        <Box>
          {tag ? <TagHeader tag={tag} setTag={setTag} /> :
                  <Text style={{fontWeight: 500}}>Installed Repositories</Text>}
        </Box>
        <Box>
          <RepositoryList
            repositores={repositories}
            emptyState={<EmptyState />}
            fetchMore={fetchMore}
            columns={3} />
        </Box>
      </Box>
    </Box>
  )
}