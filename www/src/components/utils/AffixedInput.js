import React from 'react'
import { Box, TextInput, Text } from 'grommet'
import { trimSuffix } from '../../utils/array'

export function SuffixedInput({suffix, value, onChange, placeholder}) {
  return (
    <Box direction='row' align='center'>
      <TextInput
        weight={450}
        value={value ? trimSuffix(value, suffix) : ''}
        placeholder={placeholder}
        onChange={({target: {value}}) => onChange(`${value}${suffix}`)} />
      <Box flex={false} style={{borderLeftStyle: 'none'}} border={{color: 'light-5'}} 
            pad={{horizontal: 'small'}} background='tone-light' height='41px' justify='center'>
        <Text size='small' weight={500}>{suffix}</Text>
      </Box>
    </Box>
  )
}