import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Next} from 'grommet-icons'

export const FlyoutContext = React.createContext({
  flyoutContent: null,
  setFlyoutContent: null,
  open: false,
  setOpen: null
})

function FlyoutContent(props) {
  return (
    <Box border='left' height='100%'>
      {props.content}
    </Box>
  )
}

export function FlyoutContainer(props) {
  return (
    <Box animation={{type: 'fadeIn', duration: 200, delay: 0}} {...props}>
      {props.children}
    </Box>
  )
}

export function FlyoutProvider(props) {
  const [flyoutContent, setFlyoutContent] = useState(null)
  function setOpen(open) {
    if (!open) setFlyoutContent(null)
  }

  return (
    <FlyoutContext.Provider value={{
      flyoutContent,
      setOpen,
      setFlyoutContent
    }}>
      {props.children(<FlyoutContent content={flyoutContent} />, setFlyoutContent)}
    </FlyoutContext.Provider>
  )
}

export function FlyoutHeader(props) {
  const [hover, setHover] = useState(false)
  return (
    <Box
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => props.setOpen(false)}
      style={{cursor: 'pointer'}}
      background='light-1'
      height='40px'
      direction='row'
      border='bottom'
      pad='small'
      elevation={hover ? 'xsmall' : null}
      margin={{bottom: 'small'}}>
      <Box width='100%' direction='row' justify='start' align='center'>
        <Text size='small'>{props.text.toUpperCase()}</Text>
      </Box>
      <Box align='center'  justify='center'>
        <Next size={hover ? '17px' : '15px'} />
      </Box>
    </Box>
  )
}

function Flyout(props) {
  return (
    <FlyoutContext.Consumer>
    {({setFlyoutContent, setOpen}) => {
      return (
        <span style={{lineHeight: '0px'}}>
          <span onClick={() => {
            props.onOpen && props.onOpen()
            setFlyoutContent(props.children(setOpen))
          }}>
          {props.target}
          </span>
        </span>
      )
    }}
    </FlyoutContext.Consumer>
  )
}

export default Flyout