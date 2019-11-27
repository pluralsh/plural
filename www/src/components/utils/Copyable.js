import React, {useState} from 'react'
import {Box, Text} from 'grommet'
import {Copy, Close} from 'grommet-icons'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import Pill from './Pill'

const MAX_LINK_LENGTH = 40

function trimmed(link) {
  if (link.length > MAX_LINK_LENGTH) {
    return `${link.substring(0, MAX_LINK_LENGTH)}...`
  }
  return link
}

function Copyable({text, pillText, displayText}) {
  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)
  return (
    <>
    <CopyToClipboard text={text} onCopy={() =>  setDisplay(true)}>
      <Box
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{cursor: 'pointer'}}
        direction='row'
        align='center'
        round='xsmall'
        gap='xsmall'>
        <Text size='small'>{trimmed(displayText || text)}</Text>
        {hover && (
          <Box animation={{type: 'fadeIn', duration: 200}}>
            <Copy size='12px' />
          </Box>
        )}
      </Box>
    </CopyToClipboard>
    {display && (
      <Pill background='status-ok' onClose={() => setDisplay(false)}>
        <Box direction='row' align='center' gap='small'>
          <Text>{pillText}</Text>
          <Close style={{cursor: 'pointer'}} size='15px' onClick={() => setDisplay(false)} />
        </Box>
      </Pill>
    )}
    </>
  )
}

export default Copyable