import { Flex, P, Span } from 'honorable'
import { ApolloError } from '@apollo/client/errors'
import {
  Button,
  Chip,
  DiscordIcon,
  DocumentIcon,
  ErrorIcon,
  ProgressBar,
} from '@pluralsh/design-system'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import styled from 'styled-components'

import { CloudShell } from '../../../../../generated/graphql'
import { CopyButtonBase } from '../../../terminal/actionbar/Cheatsheet'

interface StatusChipProps {
  loading: boolean,
  error: ApolloError | undefined
}

function StatusChip({ loading, error }: StatusChipProps) {
  return (
    <Chip
      loading={loading && !error}
      backgroundColor="fill-two"
      borderColor="border-fill-two"
      severity={error ? 'error' : (loading ? 'info' : 'success')}
    >
      {error ? 'Error' : loading ? 'Running' : 'Success'}
    </Chip>
  )
}

interface StatusHeaderProps {
  header: string,
  description: string,
  error: ApolloError | undefined
}

function StatusHeader({ header, description, error }: StatusHeaderProps) {
  return (
    <Flex
      direction="column"
      gap="xxsmall"
    >
      <Flex>
        {error && (
          <ErrorIcon
            color="icon-danger"
            marginRight="xsmall"
          />
        )}
        <P
          body1
          color="text"
          fontWeight={600}
        >
          {!error ? header : 'Cloud shell failed to start'}
        </P>
      </Flex>
      <P
        body2
        color="text-light"
      >
        {!error ? description : 'Check the logs then try the options below to troubleshoot.'}
      </P>
    </Flex>
  )
}

interface ProgressEntryProps {
  text: string
  loading: boolean
  error: ApolloError | undefined
  last?: boolean
}

function ProgressEntry({
  text, loading, error, last = false,
}: ProgressEntryProps) {
  return (
    <Flex
      paddingTop="medium"
      paddingBottom={last ? 0 : 'medium'}
      paddingHorizontal="large"
      align="center"
      justify="space-between"
      borderBottom={last ? 'none' : '1px solid border'}
    >
      <P
        body2
        color="text"
      >
        {text}
      </P>
      <StatusChip
        loading={loading}
        error={error}
      />
    </Flex>
  )
}

const CopyButton = styled(CopyButtonBase)(({ theme }) => ({
  top: theme.spacing.large,
  right: theme.spacing.large,
  boxShadow: theme.boxShadows.slight,
  zIndex: 100,
}))

interface ErrorWrapperProps {
  error: ApolloError
}

function ErrorWrapper({ error }: ErrorWrapperProps) {
  const [hovered, setHovered] = useState(false)
  const [copied, setCopied] = useState(false)
  const message = useMemo(() => {
    if (error.graphQLErrors) return error.graphQLErrors.map(err => err.message.replace(/\\n/g, '\n')).join('\n')

    return error.message.replace(/\\n/g, '\n')
  }, [error])

  const handleCopy = useCallback(() => window.navigator.clipboard
    .writeText(message)
    .then(() => setCopied(true)),
  [message])

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => setCopied(false), 1000)

      return () => clearTimeout(timeout)
    }
  }, [copied])

  return (
    <Flex
      position="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Flex
        flexDirection="column"
        marginTop="medium"
        paddingHorizontal="large"
        paddingVertical="medium"
        background="fill-zero"
        maxHeight={100}
        grow={1}
        overflowY="auto"
        gap="xxsmall"
      >
        <Span style={{ whiteSpace: 'break-spaces' }}>{message}</Span>
      </Flex>
      {hovered && (
        <CopyButton
          copied={copied}
          handleCopy={handleCopy}
        />
      )}
    </Flex>
  )
}

function Community() {
  return (
    <Flex flexDirection="column">
      <Flex
        paddingVertical="medium"
        paddingHorizontal="large"
        borderBottom="1px solid border"
        justify="space-between"
        align="center"
        gap="xxsmall"
      >
        <Flex flexDirection="column">
          <P
            color="text"
            fontWeight={600}
          >
            Read the docs
          </P>
          <P color="text-light">
            Most errors can be tracked down to a common error or mistake.
          </P>
        </Flex>
        <Button
          as="a"
          href="https://docs.plural.sh/reference/troubleshooting"
          target="_blank"
          secondary
          startIcon={<DocumentIcon />}
          small
        >Docs
        </Button>
      </Flex>
      <Flex
        paddingTop="medium"
        paddingHorizontal="large"
        justify="space-between"
        align="center"
        gap="xxsmall"
      >
        <Flex flexDirection="column">
          <P
            color="text"
            fontWeight={600}
          >
            Contact us
          </P>
          <P color="text-light">
            Message us on Discord and we can help you resolve any issues.
          </P>
        </Flex>
        <Button
          as="a"
          href="https://discord.gg/pluralsh"
          target="_blank"
          secondary
          startIcon={<DiscordIcon />}
          small
        >Discord
        </Button>
      </Flex>
    </Flex>
  )
}

interface ShellStatusProps {
  shell: CloudShell
  error?: ApolloError | undefined
  loading?: boolean
}

export function ShellStatus({ shell, error, loading }: ShellStatusProps) {
  return (
    <Flex
      paddingTop="xsmall"
      direction="column"
    >
      <Flex
        paddingHorizontal="large"
        direction="column"
        gap="medium"
      >
        <StatusHeader
          header="Creating cloud shell environment"
          description="The cloud shell will boot automatically upon completion."
          error={error}
        />

        {!error && (
          <ProgressBar
            mode={shell.alive && !loading ? 'determinate' : 'indeterminate'}
            progress={shell.alive && !loading ? 100 : undefined}
            // @ts-expect-error
            backgroundColor="fill-two"
            marginBottom="medium"
          />
        )}
      </Flex>

      {error && (
        <>
          <ErrorWrapper error={error} />
          <Community />
        </>
      )}

      {!error && (
        <>
          <ProgressEntry
            text="Initialize"
            loading={!(shell?.status?.initialized ?? false)}
            error={error}
          />

          <ProgressEntry
            text="Schedule pods"
            loading={!(shell?.status?.podScheduled ?? false)}
            error={error}
          />

          <ProgressEntry
            text="Containers ready"
            loading={!(shell?.status?.containersReady ?? false)}
            error={error}
          />

          <ProgressEntry
            text="Shell ready"
            loading={!(shell?.status?.ready ?? false)}
            error={error}
          />

          <ProgressEntry
            text="Booting into shell"
            loading={loading ?? true}
            error={error}
            last
          />
        </>
      )}
    </Flex>
  )
}
