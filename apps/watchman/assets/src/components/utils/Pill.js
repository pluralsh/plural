import React from 'react'
import {Layer, Box} from 'grommet'

function Pill(props) {
  return (
    <Layer plain modal={false} position='top' onEsc={props.onClose} onClickOutside={props.onClose}>
      <Box
        direction='row'
        align='center'
        elevation='medium'
        round='small'
        margin={{top: 'medium'}}
        pad={props.pad || {vertical: 'xsmall', horizontal: 'medium'}}
        background={props.background}>
        {props.children}
      </Box>
    </Layer>
  )
}

export default Pill