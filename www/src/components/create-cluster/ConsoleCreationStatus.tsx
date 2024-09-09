import { Card, Flex, Spinner, SuccessIcon } from '@pluralsh/design-system'
import styled, { useTheme } from 'styled-components'

import { ConsoleInstanceFragment } from 'generated/graphql'

import { useCreateClusterContext } from './CreateClusterWizard'

export function ConsoleCreationStatus({
  consoleInstance,
}: {
  consoleInstance: ConsoleInstanceFragment
}) {
  const theme = useTheme()
  const { isCreatingInstance } = useCreateClusterContext()

  return (
    <CreationStatusCardSC>
      <Flex
        direction="column"
        gap="xxsmall"
      >
        <Flex>
          <span css={theme.partials.text.body2Bold}>
            {isCreatingInstance
              ? 'Creating console instance...'
              : 'Console successfully provisioned'}
          </span>
          {!isCreatingInstance && (
            <SuccessIcon
              marginLeft="xsmall"
              color={theme.colors['icon-success']}
            />
          )}
        </Flex>
        <span
          css={{
            ...theme.partials.text.caption,
            color: theme.colors['text-light'],
          }}
        >
          {isCreatingInstance
            ? 'Your Console is being deployed in the background on your Plural Cloud instance. This might take a few minutes.'
            : 'You are now ready to complete your cluster creation.'}
        </span>
      </Flex>
      {isCreatingInstance && (
        <Flex
          gap="medium"
          align="center"
          color={theme.colors['text-primary-accent']}
          {...theme.partials.text.badgeLabel}
        >
          <span>Status: {consoleInstance?.status}</span>
          <Spinner />
        </Flex>
      )}
    </CreationStatusCardSC>
  )
}

const CreationStatusCardSC = styled(Card)(({ theme }) => ({
  padding: theme.spacing.medium,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.medium,
}))
