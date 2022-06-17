import { useState } from 'react'
import { Flex } from 'honorable'
import { CopyIcon } from 'pluralsh-design-system'

function CodeLine({ children, ...props }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    window.navigator.clipboard.writeText(children).then(() => {
      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 1250)
    })
  }

  return (
    <Flex
      border="1px solid border-fill-two"
      backgroundColor="fill-one"
      borderRadius="medium"
      {...props}
    >
      <Flex
        align="center"
        paddingLeft="medium"
        paddingVertical="small"
        overflowX="auto"
        flexGrow={1}
        fontFamily="Monument Semi-Mono, monospace"
        fontSize={14}
        lineHeight="24px"
        color="text-light"
      >
        {copied ? 'Copied!' : children}
      </Flex>
      <Flex
        align="center"
        justify="center"
        paddingVertical="small"
        paddingHorizontal="medium"
        backgroundColor="fill-two"
        borderLeft="1px solid border-fill-two"
        cursor="pointer"
        _hover={{ backgroundColor: 'fill-two-hover' }}
        _active={{ backgroundColor: 'fill-two-selected' }}
        onClick={handleCopy}
      >
        <CopyIcon />
      </Flex>
    </Flex>
  )
}

export default CodeLine
