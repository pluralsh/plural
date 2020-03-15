import React from 'react'
import {Box, Text, TextInput} from 'grommet'

export function ResponsiveInput({label, name, type, value, onChange, placeholder}) {
  return (
    <ResponsiveInputContainer
      label={label}
      content={
        <TextInput
          name={name || 'name'}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder} />
      } />
  )
}

export function ResponsiveInputContainer({label, content}) {
  return (
    <tr>
      <td style={{whiteSpace: 'nowrap'}}>
        <Text size='small' weight='bold'>{label}</Text>
      </td>
      <td style={{width: '99%'}}>
        {content}
      </td>
    </tr>
  )
}

export function InputCollection({children}) {
  return (
    <table width='100%' style={{borderCollapse: 'separate', borderSpacing: '5px 8px'}}>
      <tbody>{children}</tbody>
    </table>
  )
}

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