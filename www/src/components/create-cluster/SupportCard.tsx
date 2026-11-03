import { Button, DiscordIcon } from '@pluralsh/design-system'
import styled from 'styled-components'

import { useBillingSubscription } from 'components/account/billing/BillingSubscriptionProvider'

export const CONTACT_URL = 'https://www.plural.sh/contact'
const DISCORD_URL = 'https://discord.gg/pluralsh'

export function SupportCard() {
  const { isEnterprisePlan } = useBillingSubscription()

  return (
    <CardSC aria-label="Get help">
      <span className="title">
        {isEnterprisePlan ? 'Your support team' : 'Need a hand?'}
      </span>
      <span className="body">
        {isEnterprisePlan
          ? 'Enterprise includes dedicated support. Reach the Plural team for setup help, networking or SSO.'
          : 'Ask the community on Discord, or talk to us about Enterprise support.'}
      </span>
      <div className="actions">
        <Button
          small
          secondary
          as="a"
          href={CONTACT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {isEnterprisePlan ? 'Contact support' : 'Contact sales'}
        </Button>
        {!isEnterprisePlan && (
          <Button
            small
            tertiary
            as="a"
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<DiscordIcon />}
          >
            Discord
          </Button>
        )}
      </div>
    </CardSC>
  )
}

const CardSC = styled.section(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.small,
  marginTop: theme.spacing.large,
  padding: theme.spacing.medium,
  borderRadius: theme.borderRadiuses.large,
  border: theme.borders.default,
  '.title': { ...theme.partials.text.body2Bold, color: theme.colors.text },
  '.body': { ...theme.partials.text.body2, color: theme.colors['text-light'] },
  '.actions': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xsmall,
    marginTop: theme.spacing.xsmall,
  },
}))
