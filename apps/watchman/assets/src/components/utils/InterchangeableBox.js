import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {FormPrevious} from 'grommet-icons'
import HoveredBackground from './HoveredBackground'

function ContentWrapper(props) {
  return (
    <Box gap='xsmmall' animation={slideAnimate('slideRight')}>
      {props.children}
      <Box pad='xxsmall' border='top'>
        <HoveredBackground>
          <Box
            hoverable
            style={{cursor: 'pointer'}}
            onClick={() => props.setAlternate(null)}
            pad={{vertical: 'xsmall', horizontal: 'small'}}
            direction='row'
            align='center'
            round='xsmall'
            gap='xsmall'>
            <FormPrevious size='15px' />
            <Text size='small'>return to menu</Text>
          </Box>
        </HoveredBackground>
      </Box>
    </Box>
  )
}

function MaybeWrap(props) {
  if (props.noWrap) return props.children
  const {children, ...rest} = props
  return (<ContentWrapper {...rest}>{children}</ContentWrapper>)
}

function slideAnimate(type) {
  return {type: type, duration: 150, delay: 0, size: 'xlarge'}
}

function InterchangeableBox(props) {
  const [loaded, setLoaded] = useState(false)
  const [alternate, setAlternate] = useState(null)
  function wrappedSetAlternate(alternate) {
    setLoaded(true)
    setAlternate(alternate)
  }

  return (!alternate ?
    <Box animation={loaded && !props.noWrap ? slideAnimate('slideLeft') : null} {...props}>
      {props.children(wrappedSetAlternate)}
    </Box>
    : <MaybeWrap noWrap={props.noWrap} setAlternate={wrappedSetAlternate}>{alternate}</MaybeWrap>
  )
}

export default InterchangeableBox