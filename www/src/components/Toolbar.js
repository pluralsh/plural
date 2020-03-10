import React from 'react'
import {useHistory} from 'react-router-dom'
import {Box, Text} from 'grommet'
import Me from './users/Me'
import SearchRepositories from './repos/SearchRepositories'

export default function Toolbar({me}) {
  let history = useHistory()
  return (
    <Box direction='row' fill='horizontal' pad={{left: 'small'}}>
      <Box width='100px' height='100%' justify='center'>
        <Text
          style={{cursor: 'pointer'}}
          size='small'
          weight='bold'
          onClick={() => history.push('/')}>
          Forge
        </Text>
      </Box>
      <Box direction='row' width='100%' align='center' justify='center'>
        <SearchRepositories />
      </Box>
      <Me me={me} />
    </Box>
  )
}