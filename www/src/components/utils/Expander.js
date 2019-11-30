import React from 'react'
import {Box, Text} from 'grommet'
import {Next, Down} from 'grommet-icons'
import Collapsible from 'react-collapsible'

function Trigger({text, textSize, open}) {
  return (
    <Box style={{cursor: 'pointer'}} direction='row'>
      <Box width='100%' justify='center' pad={{vertical: 'small'}}>
        <Text style={{fontWeight: 500}} size={textSize || 'small'}>{text}</Text>
      </Box>
      <Box width='40px' align='center' justify='center'>
        {open ? <Down size='15px' /> : <Next size='15px' />}
      </Box>
    </Box>
  )
}

function Expander({text, textSize, open, children}) {
  return (
    <Collapsible
      open={open}
      transitionTime={100}
      trigger={<Trigger text={text} textSize={textSize} />}
      triggerWhenOpen={<Trigger text={text} textSize={textSize} open />}>
      {children}
    </Collapsible>
  )
}

export default Expander