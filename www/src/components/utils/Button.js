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
      <Pill background='status-warning' onClose={() => setOpen(false)}>
        <Box direction='row' align='center'>
          <Box width='100%' align='center'>
            <Errors errors={error}/>
          </Box>
          <Box width='25px' style={{cursor: 'pointer'}}>
            <FormClose size='25px' onClick={() => setOpen(false)} />
          </Box>
        </Box>
      </Pill>
    )
  )
}

export function SecondaryButton({onClick, label, pad, error, ...rest}) {
  const [hover, setHover] = useState(null)
  return (
    <>
    {error && <ErrorPill error={error} />}
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
      <Text size='small'>{label}</Text>
    </Box>
    </>
  )
}

function Button({pad, disabled, onClick, label, loading, textSize, error, icon, ...rest}) {
  const [hover, setHover] = useState(false)
  return (
    <>
    {error && <ErrorPill error={error} />}
    <Box
      onClick={() => !disabled && onClick && onClick()}
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
      {loading && <BeatLoader color='white' size={8} />}
      {icon ? icon : <Text size={textSize || 'small'}>{label}</Text>}
    </Box>
    </>
  )
}

export default Button