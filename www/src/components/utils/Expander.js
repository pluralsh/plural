import React from 'react'
import {Box, Text} from 'grommet'
import {Next, Down} from 'grommet-icons'

function Expander(props) {
  return (
    <Box style={{cursor: 'pointer'}} direction='row'>
      <Box width='100%' justify='center' pad='small'>
        <Text size='small'>{props.text}</Text>
      </Box>
      <Box width='40px' align='center' justify='center'>
        {props.expanded ? <Down size='15px' /> : <Next size='15px' />}
      </Box>
    </Box>
  )
}

export default Expander