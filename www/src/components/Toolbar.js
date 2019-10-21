import React from 'react'
import {Box, Text} from 'grommet'
import Me from './users/Me'

function Toolbar(props) {
  return (
    <Box direction='row' fill='horizontal'>
      <Box width='100px' height='100%' justify='center'>
        <Text size='small' weight='bold'>Chartmart</Text>
      </Box>
      <Box width='100%'>

      </Box>
      <Me me={props.me} />
    </Box>
  )
}

export default Toolbar