import React from 'react'
import {Box, Text} from 'grommet'
import {Alert} from 'grommet-icons'

export function Error(props) {
  return (
    <Box direction='row' gap='xsmall' justify='center' align='center'>
      <Alert size="15px"/>
      <Text style={{lineHeight: '15px'}}>
        {props.error.replace("_", ' ')}
      </Text>
    </Box>
  )
}

function Errors(props) {
  let limit = props.limit || 1
  let errors = props.errors.graphQLErrors || [{message: (props.default || 'something went wrong')}]
  return (
    <Box direction='column' gap='xsmall'>
      {errors.slice(0, limit).map(error => <Error error={error.message} />)}
    </Box>
  )
}

export default Errors