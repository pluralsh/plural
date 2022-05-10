import { useState } from 'react'
import Highlight from 'react-highlight.js'
import hljs from 'highlight.js'
import { Div, Flex, P, Pre } from 'honorable'
import { CopyIcon } from 'pluralsh-design-system'

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
    if (hljs.getLanguage(language)) {
      return (
        <Div pb={0.001}> {/* HACK to fix weird Highlight padding bug */}
          <Highlight language={language}>
            {children}
          </Highlight>
        </Div>
      )
    }

    return (
      <Pre
        py={2}
        px={1}
      >
        {children}
      </Pre>
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
        backgroundColor="background-middle"
      >
        <P body3>
          {copied ? 'copied!' : `Language: ${language}`}
        </P>
        <Flex
          mx={0.5}
          p={0.5}
          align="center"
          justify="center"
          hoverIndicator="background-light"
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
        backgroundColor="background-light"
      >
        {renderContent()}
      </Div>
    </Div>
  )
}

export default Code
