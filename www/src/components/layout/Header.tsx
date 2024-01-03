import styled, { useTheme } from 'styled-components'
import { Link } from 'react-router-dom'
import { LightDarkSwitch, setThemeColorMode } from '@pluralsh/design-system'

import BillingLegacyUserMessage from '../account/billing/BillingLegacyUserMessage'
import BillingSubscriptionChip from '../account/billing/BillingSubscriptionChip'
import BillingTrialMessage from '../account/billing/BillingTrialMessage'
import { useIsCurrentlyOnboarding } from '../shell/hooks/useOnboarded'

const APP_ICON_LIGHT = '/header-logo-light.png'
const APP_ICON_DARK = '/header-logo-dark.png'

const HeaderSC = styled.div(({ theme }) => ({
  backgroundColor:
    theme.mode === 'light' ? theme.colors['fill-one'] : theme.colors.grey[850],
  borderBottom: theme.borders.default,
}))

const HeaderContentSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.medium,
  padding: `${theme.spacing.xsmall}px ${theme.spacing.large}px`,
}))

const LogoSC = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  marginLeft: -2.0 /* Optically center with sidebar buttons */,
  minHeight: 40,
  img: {
    height: 24,
  },
}))

export default function Header() {
  const theme = useTheme()
  const isCurrentlyOnboarding = useIsCurrentlyOnboarding()

  return (
    <HeaderSC style={isCurrentlyOnboarding ? { display: 'none' } : {}}>
      <HeaderContentSC>
        <LogoSC to="/">
          <img
            src={theme.mode === 'light' ? APP_ICON_LIGHT : APP_ICON_DARK}
            alt="Plural app"
          />
        </LogoSC>
        <div css={{ display: 'flex', flexGrow: 1 }} />
        <BillingLegacyUserMessage />
        <BillingTrialMessage />
        <BillingSubscriptionChip />
        <LightDarkSwitch
          checked={theme.mode === 'dark'}
          onChange={(val) => {
            setThemeColorMode(val ? 'dark' : 'light')
          }}
        />
      </HeaderContentSC>
    </HeaderSC>
  )
}
