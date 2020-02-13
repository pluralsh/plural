import React, {useState, useRef} from 'react'
import {Drop} from 'grommet'

function CloseableDropdown(props) {
  const targetRef = useRef();
  const [open, setOpen] = useState(!!props.open);

  return (
    <span style={props.style}>
      <span onClick={() => {
          props.onClick && props.onClick()
          setOpen(true)
        }} ref={targetRef}>
        {props.target}
      </span>
      {open && (
        <Drop
          align={props.align || {top: "bottom"}}
          margin={{top: '5px'}}
          target={targetRef.current}
          onClickOutside={() => setOpen(false)}
          onEsc={() => setOpen(false)}
          {...props.dropProps}
        >
          {props.children(setOpen)}
        </Drop>)}
    </span>
  )
}

export default CloseableDropdown