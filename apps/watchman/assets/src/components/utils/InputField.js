import React from 'react'
import {Box, Text, TextInput} from 'grommet'

function InputField(props) {
  return (
    <Box direction='row' align='center'>
      <Box width={props.labelWidth || '50px'}>
        <Text size='small' margin={{right: 'small'}} weight='bold'>{props.label}</Text>
      </Box>
      <TextInput
        name='name'
        type={props.type}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        />
    </Box>
  )
}

export default InputField