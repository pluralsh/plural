import { useCallback, useEffect, useState } from 'react'
import { Flex, P } from 'honorable'
import { Button, CheckIcon, CopyIcon } from '@pluralsh/design-system'
import styled from 'styled-components'

function CheatsheetCommand({ command, description, last }: any) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => window.navigator.clipboard
    .writeText(`plural ${command}`)
    .then(() => setCopied(true)),
  [command])

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  return (
    <Flex
      position="relative"
      borderBottom={last ? '' : '1px solid border-fill-two'}
      paddingHorizontal="medium"
      paddingVertical="small"
      gap="xsmall"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}

    >
      <P
        flex="50%"
        body2
      >
        <strong>plural {command}</strong>
      </P>
      <P
        flex="50%"
        body2
      >
        {description}
      </P>

      {hovered && (
        <CopyButton
          copied={copied}
          handleCopy={handleCopy}
        />
      )}
    </Flex>
  )
}

// Extracted from the Design System. TODO: Export it there and reuse
function CopyButtonBase({
  copied,
  handleCopy,
  className,
}: {
  copied: boolean
  handleCopy: () => any
  className?: string
}) {
  return (
    <Button
      className={className}
      position="absolute"
      floating
      small
      startIcon={copied ? <CheckIcon /> : <CopyIcon />}
      onClick={handleCopy}
    >
      {copied ? 'Copied' : 'Copy'}
    </Button>
  )
}

const CopyButton = styled(CopyButtonBase)(({ theme }) => ({
  right: theme.spacing.medium,
  bottom: theme.spacing.medium,
  boxShadow: theme.boxShadows.slight,
}))

export { CheatsheetCommand, CopyButtonBase }
