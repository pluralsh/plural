import {
  A,
  Div,
  Flex,
  Img,
} from 'honorable'
import { Button, Tooltip } from '@pluralsh/design-system'
import { useTheme } from 'styled-components'

import { useQuery } from '@apollo/client'

import { QueueList } from '../clusters/Clusters'
import { QUEUES } from '../clusters/queries'

import BillingLegacyUserMessage from '../account/billing/BillingLegacyUserMessage'
import BillingSubscriptionChip from '../account/billing/BillingSubscriptionChip'

const APP_ICON = '/app-logo-white.png'

export default function Header() {
  const theme = useTheme()

  const { data: queuesData } = useQuery<QueueList>(QUEUES, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 10 * 60 * 1000 /* check every 10 min */,
  })

  const consoleDomain = queuesData?.upgradeQueues?.[0]?.domain
  const consoleLink = consoleDomain ? `https://${consoleDomain}` : null

  let consoleButton = (
    <Button
      small
      {...(consoleLink
        ? {
          as: A,
          href: consoleLink,
          target: '_blank',
          rel: 'noopener noreferrer',
          textDecoration: 'none !important',
        }
        : { disabled: true })}
    >
      Launch Console
    </Button>
  )

  // Don't show tooltip unless data has actually loaded confirming there is
  // no console to link to.
  if (queuesData && !consoleLink) {
    consoleButton = (
      <Tooltip
        placement="bottom-end"
        width={240}
        label={
          <>You must have Plural Console deployed to access your console.</>
        }
      >
        <div>{consoleButton}</div>
      </Tooltip>
    )
  }

  return (
    <Div
      backgroundColor={theme.colors['fill-one']}
      borderBottom="1px solid border"
      paddingHorizontal="large"
      paddingVertical="xsmall"
    >
      <Flex
        align="center"
        gap="medium"
        minHeight={40}
      >
        <Img
          height={24}
          marginLeft={-2} /* Optically center with sidebar buttons */
          src={APP_ICON}
          alt="Plural app"
        />
        <Flex grow={1} />
        <BillingLegacyUserMessage />
        <BillingSubscriptionChip />
        {consoleButton}
      </Flex>
    </Div>
  )
}
