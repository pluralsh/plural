import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {FormClose} from 'grommet-icons'
import {BeatLoader} from 'react-spinners'
import Errors from './Error'
import Pill from './Pill'

const BUTTON_PAD = {horizontal: 'small', vertical: 'xsmall'}

function ErrorPill({error}) {
  const [open, setOpen] = useState(true)
  return (
    open && (
      <Pill onClose={() => setOpen(false)}>
        <Box width='100%'>
          <Errors errors={error}/>
        </Box>
        <Box width='20px'>
          <FormClose size='15px' onClick={() => setOpen(false)} />
        </Box>
      </Pill>
    )
  )
}

export function SecondaryButton({onClick, label, pad, error, ...rest}) {
  const [hover, setHover] = useState(null)
  return (
    <Box
      style={{cursor: 'pointer'}}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      direction='row'
      border
      align='center'
      justify='center'
      elevation={hover ? 'small' : null}
      background='#fff'
      pad={pad || BUTTON_PAD}
      {...rest}>
      {error && <ErrorPill errors={error} />}
      <Text size='small'>{label}</Text>
    </Box>
  )
}

function Button({pad, disabled, onClick, label, loading, textSize, error, ...rest}) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onClick={() => !disabled && onClick()}
      style={!disabled ? {cursor: 'pointer'} : null}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      pad={pad || BUTTON_PAD}
      direction='row'
      gap='xsmall'
      align='center'
      justify='center'
      background={disabled ? 'light-6' : 'action'}
      elevation={hover && !disabled ? 'small' : null}
      {...rest}>
      {error && <ErrorPill errors={error} />}
      {loading && <BeatLoader color='white' size={8} />}
      <Text size={textSize || 'small'}>{label}</Text>
    </Box>
  )
}

export default Button