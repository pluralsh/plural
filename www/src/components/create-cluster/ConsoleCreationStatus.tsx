import { Card, Flex, Spinner, SuccessIcon } from '@pluralsh/design-system'
import { useIsClusterHealthy } from 'components/overview/clusters/ClusterHealth'
import { ConsoleInstanceFragment } from 'generated/graphql'
import styled, { useTheme } from 'styled-components'

export function ConsoleCreationStatus({
  consoleInstance,
}: {
  consoleInstance: ConsoleInstanceFragment
}) {
  const theme = useTheme()
  const loading = !useIsClusterHealthy(consoleInstance?.console?.pingedAt)

  return (
    <CreationStatusCardSC>
      <Flex
        direction="column"
        gap="xxsmall"
      >
        <Flex>
          <span css={theme.partials.text.body2Bold}>
            {loading
              ? 'Creating console instance...'
              : 'Console successfully provisioned'}
          </span>
          <SuccessIcon
            marginLeft="xsmall"
            color={theme.colors['icon-success']}
          />
        </Flex>
        <span
          css={{
            ...theme.partials.text.caption,
            color: theme.colors['text-light'],
          }}
        >
          {loading
            ? 'Your Console is being deployed in the background on your Plural Cloud instance. This might take a few minutes.'
            : 'You are now ready to complete your cluster creation.'}
        </span>
      </Flex>
      {loading && (
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
