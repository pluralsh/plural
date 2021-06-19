import React from 'react'
import { Box, Text, TextInput } from 'grommet'
import styled from 'styled-components';
import { normalizeColor } from 'grommet/utils';

const BORDER = 'light-5'

const InputContainer = styled.td`
  &:focus-within {
    outline: none;
    border-color: ${props => normalizeColor('brand', props.theme)};
  }
  border: 1px solid ${props => normalizeColor(BORDER, props.theme)};
  border-radius: 0px 3px 3px 0px;
`;

const LabelContainer = styled.td`
  border-color: ${props => normalizeColor(BORDER, props.theme)};
  border-width: 1px 0px 1px 1px;
  border-style: solid;
  background-color: ${props => normalizeColor('label', props.theme)};
  white-space: nowrap;
  border-radius: 3px 0px 0px 3px;
`

export function LabelledInput({label, type, value, placeholder, onChange}) {
  return (
    <tr>
      <LabelContainer>
        <Box pad={{horizontal: 'small'}}>
          <Text weight={500} size='small'>{label}</Text>
        </Box>
      </LabelContainer>
      <InputContainer>
        <TextInput
          plain
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={({target: {value}}) => onChange(value)} />
      </InputContainer>
    </tr>
  )
}