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
      <Box pad='small' width={`${WIDTH}%`} height='100%' border='right'>
        <Box>
          <Tags pad='small' tags={tags} setTag={setTag} fetchMore={fetchMore} />
        </Box>
      </Box>
      <Box pad='small' width={`${100 - WIDTH}%`} height='100%'>
        <Box pad={{vertical: 'small'}}>
          {tag ? <TagHeader tag={tag} setTag={setTag} /> :
                  <Text style={{fontWeight: 500}}>Installed Repositories</Text>}
        </Box>
        <Box>
          <RepositoryList repositores={repositories} fetchMore={fetchMore} />
        </Box>
      </Box>
    </Box>
  )
}