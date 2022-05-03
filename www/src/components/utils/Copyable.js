import { useState } from 'react'
import { Box, Layer, Text } from 'grommet'
import { CircleInformation } from 'grommet-icons'
import { Close, Copy } from 'forge-core'
import CopyToClipboard from 'react-copy-to-clipboard'
import truncate from 'lodash.truncate'

import { Icon } from '../accounts/Group'

export function CopyNotice({ text, onClose }) {
  return (
    <Layer
      position="top"
      plain
      onEsc={onClose}
      onClickOutside={onClose}
    >
      <Box
        direction="row"
        align="center"
        gap="small"
        background="white"
        border={{ color: 'border' }}
        round="xsmall"
        margin={{ top: 'small' }}
        pad={{ horizontal: 'small', vertical: 'xsmall' }}
      >
        <CircleInformation
          color="progress"
          size="medium"
        />
        <Text>{text}</Text>
        <Icon
          icon={Close}
          onClick={onClose}
        />
      </Box>
    </Layer>
  )
}

export function Copyable({ text, pillText, displayText, onCopy }) {
  const [display, setDisplay] = useState(false)
  const [hover, setHover] = useState(false)

  return (
    <>
      <CopyToClipboard
        text={text}
        onCopy={() => onCopy ? onCopy() : setDisplay(true)}
      >
        <Box
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          style={{ cursor: 'pointer' }}
          direction="row"
          align="center"
          round="xsmall"
          gap="xsmall"
        >
          <Text size="small">{truncate(displayText || text, 40)}</Text>
          {hover && (
            <Box animation={{ type: 'fadeIn', duration: 200 }}>
              <Copy
                size="12px"
                color="dark-3"
              />
            </Box>
          )}
        </Box>
      </CopyToClipboard>
      {display && (
        <CopyNotice
          text={pillText}
          onClose={() => setDisplay(false)}
        />
      )}
    </>
  )
}
