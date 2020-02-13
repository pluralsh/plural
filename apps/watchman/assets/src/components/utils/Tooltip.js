import React, {useState, useRef} from 'react'
import {Box, Drop} from 'grommet'

export function TooltipContent(props) {
  return (
    <Drop align={props.align || {bottom: 'top'}} target={props.targetRef.current} plain>
      <Box round='small' background={props.background || 'dark-1'} pad='xsmall'>
        {props.children}
      </Box>
    </Drop>
  )
}

function Tooltip(props) {
  const targetRef = useRef()
  const [open, setOpen] = useState(false)

  const target = props.children[0]
  const dropContents = props.children.slice(1)
  return (
    <>
      <span
        ref={targetRef}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}>
        {target}
      </span>
      {open && (
        <TooltipContent align={props.align} targetRef={targetRef} background={props.background}>
          {dropContents}
        </TooltipContent>
      )}
    </>
  )
}

export default Tooltip