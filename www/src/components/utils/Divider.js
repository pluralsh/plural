import React from 'react'
import {ThemeContext, Text} from 'grommet'
import styled from 'styled-components'
import {normalizeColor} from './colors'

const StyledDivider = styled.div`
${props => (
  `
    display: flex;
    flex-basis: 100%;
    align-items: ${props.align || 'center'};
    max-height: 30px;
    color: ${normalizeColor(props.color || 'dark-1', props.theme)};
    margin: ${props.margin || '8px'} 0px;
    &::before, &::after {
      content: "";
      flex-grow: 1;
      background: ${normalizeColor(props.color || 'light-6', props.theme)};
      height: 1px;
      font-size: 0px;
      line-height: 0px;
      margin: 0px ${props.textMargin || '8px'};
    }
  `
)}
`;

function Divider(props) {
  return (
    <ThemeContext.Consumer>
    {theme => (
      <StyledDivider theme={theme} color={props.color}>
        {props.text && <Text style={{fontWeight: 500}} size='small'>{props.text}</Text>}
      </StyledDivider>
    )}
    </ThemeContext.Consumer>
  )
}

export default Divider