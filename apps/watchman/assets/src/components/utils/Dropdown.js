import React, {useState, useRef} from 'react'
import {Drop} from 'grommet'

function Dropdown(props) {
  const targetRef = useRef();
  const [open, setOpen] = useState(!!props.open);
  let first = props.children[0]
  let rest  = props.children.slice(1)
  return (
    <span style={{lineHeight: '0px'}}>
      <span onClick={() => {
          props.onClick && props.onClick()
          setOpen(true)
        }} ref={targetRef}>
        {first}
      </span>
      {open && (
        <Drop
          align={props.align || { top: "bottom"}}
          margin={{top: '5px'}}
          target={targetRef.current}
          onClickOutside={() => {
            props.onClose && props.onClose()
            setOpen(false)
          }}
          onEsc={() => setOpen(false)}
        >
          {rest}
        </Drop>)}
    </span>
  )
}

export default Dropdown