import { useState } from 'react'
import { Box, Div, Flex, P } from 'honorable'
import { CopyIcon } from 'pluralsh-design-system'

import Highlight from './Highlight'

function Code({ language, children, ...props }) {
  const [copied, setCopied] = useState(false)

  if (typeof children !== 'string') throw new Error('Code component expects a string as its children')

  function handleCopy() {
    window.navigator.clipboard.writeText(children).then(() => {
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 1500)
    })
  }

  function renderContent() {
    return (
      <Box
        py={1}
        px={0.5}
      >
        <Highlight language={language}>
          {children}
        </Highlight>
      </Box>
    )
  }

  return (
    <Div
      {...props}
      border="1px solid border"
    >
      <Flex
        py={0.25}
        pl={1}
        align="center"
        justify="flex-end"
        backgroundColor="fill-two"
      >
        <P body3>
          {copied ? 'copied!' : `Language: ${language}`}
        </P>
        <Flex
          mx={0.5}
          p={0.5}
          align="center"
          justify="center"
          hoverIndicator="fill-one"
          borderRadius={1000}
          cursor="pointer"
        >
          <CopyIcon
            onClick={handleCopy}
          />
        </Flex>
      </Flex>
      <Div
        borderTop="1px solid border"
        backgroundColor="fill-one"
        overflowX="auto"
      >
        {renderContent()}
      </Div>
    </Div>
  )
}

export default Code
