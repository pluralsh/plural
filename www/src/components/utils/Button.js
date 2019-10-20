import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {BeatLoader} from 'react-spinners'

const BUTTON_PAD = {horizontal: 'small', vertical: 'xsmall'}

export function SecondaryButton(props) {
  const [hover, setHover] = useState(null)
  const {onClick, label, pad, ...rest} = props
  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={props.onClick}
      direction='row'
      border
      align='center'
      justify='center'
      elevation={hover ? 'small' : null}
      background='#fff'
      pad={pad || BUTTON_PAD}
      {...rest}>
      <Text size='small'>{label}</Text>
    </Box>
  )
}

function Button(props) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onClick={() => !props.disabled && props.onClick()}
      style={!props.disabled ? {cursor: 'pointer'} : null}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      pad={props.pad || BUTTON_PAD}
      direction='row'
      gap='xsmall'
      align='center'
      justify='center'
      background={props.disabled ? 'light-6' : 'action'}
      elevation={hover && !props.disabled ? 'small' : null}
      margin={props.margin}
      width={props.width}
      height={props.height}
      round={props.round}>
      {props.loading && <BeatLoader color='white' size={8} />}
      <Text size={props.textSize || 'small'}>{props.label}</Text>
    </Box>
  )
}

export default Button