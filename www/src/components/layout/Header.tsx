import { Div, Flex, Img } from 'honorable'
import { useTheme } from 'styled-components'

import BillingLegacyUserMessage from '../account/billing/BillingLegacyUserMessage'
import BillingSubscriptionChip from '../account/billing/BillingSubscriptionChip'
import BillingTrialMessage from '../account/billing/BillingTrialMessage'
import { useIsCurrentlyOnboarding } from '../shell/hooks/useOnboarded'

const APP_ICON = '/app-logo-white.png'

export default function Header() {
  const theme = useTheme()
  const isCurrentlyOnboarding = useIsCurrentlyOnboarding()

  return (
    <Div
      backgroundColor={theme.colors['fill-one']}
      borderBottom="1px solid border"
      paddingHorizontal="large"
      paddingVertical="xsmall"
      style={isCurrentlyOnboarding ? { display: 'none' } : null}
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
        <BillingTrialMessage />
        <BillingSubscriptionChip />
      </Flex>
    </Div>
  )
}
