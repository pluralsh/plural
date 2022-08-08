import { useEffect, useState } from 'react'
import { Box, Div } from 'honorable'
import {
  Button, Card, CheckIcon, CopyIcon,
} from 'pluralsh-design-system'

import Highlight from './Highlight'

function Code({ language, children, ...props }) {
  const [copied, setCopied] = useState(false)
  const [hover, setHover] = useState(false)

  if (typeof children !== 'string') throw new Error('Code component expects a string as its children')

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false)
      }, 1000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  function handleCopy() {
    window.navigator.clipboard.writeText(children).then(() => {
      setCopied(true)
    })
  }

  return (
    <Card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Box
        {...props}
        position="relative"
        padding={null}
      >
        {hover && (
          <Button
            position="absolute"
            right="24px"
            top="24px"
            tertiary
            backgroundColor="fill-three"
            _hover={{ backgroundColor: 'fill-one-hover' }}
            startIcon={copied ? <CheckIcon /> : <CopyIcon />}
            onClick={handleCopy}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        )}
        <Div
          overflowX="auto"
          padding="large"
        >
          <Highlight language={language}>
            {children}
          </Highlight>
        </Div>
      </Box>
    </Card>

  )
}

export default Code
