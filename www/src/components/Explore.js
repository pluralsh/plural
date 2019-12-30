import React, { useState } from 'react'
import { useQuery } from 'react-apollo'
import { EXPLORE_REPOS } from './repos/queries'
import { Box, Text } from 'grommet'
import Tags from './repos/Tags'
import { TagHeader } from './repos/Integrations'
import { RepositoryList } from './repos/Repositories'

const WIDTH = 15

export default function Explore() {
  const [tag, setTag] = useState(null)
  const {data, fetchMore} = useQuery(EXPLORE_REPOS, {
    variables: {tag},
    fetchPolicy: 'cache-and-network'
  })

  if (!data) return null
  const {tags, repositories} = data

  return (
    <Box direction='row' fill='horizontal' height='100%'>
      <Box width={`${WIDTH}%`} height='100%' border='right' elevation='small' background='light-1'>
        <Tags tags={tags} setTag={setTag} fetchMore={fetchMore} tag={tag} />
      </Box>
      <Box pad='medium' width={`${100 - WIDTH}%`} height='100%' gap='small'>
        <Box>
          {tag ? <TagHeader tag={tag} setTag={setTag} /> :
                  <Text style={{fontWeight: 500}}>Installed Repositories</Text>}
        </Box>
        <Box>
          <RepositoryList repositores={repositories} fetchMore={fetchMore} columns={3} />
        </Box>
      </Box>
    </Box>
  )
}