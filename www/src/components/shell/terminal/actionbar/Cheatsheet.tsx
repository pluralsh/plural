import { Layer } from 'grommet'
import {
  Button,
  Card,
  CheckIcon,
  CloseIcon,
  CopyIcon,
  IconFrame,
} from '@pluralsh/design-system'
import {
  Div,
  Flex,
  P,
  Span,
} from 'honorable'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

function Cheatsheet({ onClose }) {
  return (
    <Layer
      plain
      onClickOutside={onClose}
      animation="fadeIn"
      position="top-right"
      margin={{ top: '60px', right: '60px' }}
    >
      <Card
        fillLevel={2}
        width={420}
        overflow="hidden"
        margin="large"
        display="flex"
        flexDirection="column"
      >
        <Flex
          direction="column"
          gap="xsmall"
          padding="large"
          borderBottom="1px solid border-fill-two"
        >
          <Flex justify="space-between">
            <Span
              body0
              fontWeight={500}
              lineHeight="24px"
            >
              CLI cheat sheet
            </Span>
            <IconFrame
              clickable
              onClick={onClose}
              icon={<CloseIcon />}
            />
          </Flex>
          <Div
            body2
            color="text-light"
          >
            Select a command below to copy
          </Div>
        </Flex>
        <CheatsheetCommands />
      </Card>
    </Layer>
  )
}

function CheatsheetCommands() {
  const commands = [
    {
      command: 'repos list',
      description:
        'Shows all available applications on the platform (repos) and the cloud providers they can be deployed to (using a bundle).',
    },
    {
      command: 'bundle list <repo>',
      description: 'Shows all available bundles for repository.',
    },
    {
      command: 'bundle install <repo> <bundle>',
      description: (
        <>
          E.g. <strong>plural bundle install dagster dagster-gcp</strong> would
          configure Dagster for deployment to GCP.
        </>
      ),
    },
    {
      command: 'build',
      description: 'Generates all the infrastructure as code.',
    },
    {
      command: 'deploy',
      description: 'Deploys all installed bundles.',
    },
    {
      command: 'watch <repo>',
      description: 'Watches applications until they become ready.',
    },
  ]

  return (
    <Flex
      overflow="auto"
      direction="column"
    >
      {commands.map((c, idx) => (
        <CheatsheetCommand
          key={c.command}
          command={c.command}
          description={c.description}
          last={commands.length - 1 === idx}
        />
      ))}
    </Flex>
  )
}

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
export function CopyButtonBase({
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

export { Cheatsheet }
