import React from 'react'
import {useHistory} from 'react-router-dom'
import {Box, Text} from 'grommet'
import Me from './users/Me'

function Toolbar(props) {
  let history = useHistory()
  return (
    <Box direction='row' fill='horizontal' pad={{left: 'small'}}>
      <Box width='100px' height='100%' justify='center'>
        <Text
          style={{cursor: 'pointer'}}
          size='small'
          weight='bold'
          onClick={() => history.push('/')}>
          Chartmart
        </Text>
      </Box>
      <Box width='100%'>

      </Box>
      <Me me={props.me} />
    </Box>
  )
}

export default Toolbar