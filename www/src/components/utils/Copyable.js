import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Copy} from 'grommet-icons'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Pill from './Pill'

const MAX_LINK_LENGTH = 40

function trimmed(link) {
  if (link.length > MAX_LINK_LENGTH) {
    return `${link.substring(0, MAX_LINK_LENGTH)}...`
  }
  return link
}

function Copyable(props) {
  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)
  return (
    <>
    <CopyToClipboard text={props.text} onCopy={() =>  setDisplay(true)}>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{cursor: 'pointer'}}
        direction='row'
        align='center'
        border={hover ? 'full' : null}
        round='xsmall'
        pad={hover ? {horizontal: 'xsmall'} : null}>
        <Text size='small'>{trimmed(props.text)}</Text>
        {hover && (
          <Box animation={{type: 'fadeIn', duration: 200}}>
            <Copy size='12px' />
          </Box>
        )}
      </Box>
    </CopyToClipboard>
    {display && (
      <Pill background='status-ok' onClose={() => setDisplay(false)}>
        <Text>{props.pillText}</Text>
      </Pill>
    )}
    </>
  )
}

export default Copyable