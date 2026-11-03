import { Breadcrumbs, Flex, InfoIcon } from '@pluralsh/design-system'
import { useContext } from 'react'
import { Link } from 'react-router-dom'
import styled, { useTheme } from 'styled-components'

import CurrentUserContext from '../../contexts/CurrentUserContext'
import { getPreviousUserData } from '../../helpers/authentication'
import BillingLegacyUserMessage from '../account/billing/BillingLegacyUserMessage'
import BillingSubscriptionChip from '../account/billing/BillingSubscriptionChip'
import BillingTrialMessage from '../account/billing/BillingTrialMessage'
import { handlePreviousUserClick } from '../login/CurrentUser'
import { CaptionP, InlineLinkButtonSC } from '../utils/Typography'

export const HEADER_HEIGHT = 48

const WORDMARK_LIGHT = '/logos/plural-cloud-wordmark-black.png'
const WORDMARK_DARK = '/logos/plural-cloud-wordmark-white.png'

export default function Header() {
  const theme = useTheme()

  return (
    <HeaderSC>
      <HeaderContentSC>
        <CrumbsSC>
          <Breadcrumbs className="crumbs" />
        </CrumbsSC>
        <ActionsSC>
          <ServiceAccountBanner />
          <BillingLegacyUserMessage />
          <BillingTrialMessage />
          <BillingSubscriptionChip size="small" />
          <WordmarkLinkSC
            to="/"
            aria-label="Plural Cloud home"
          >
            <img
              src={theme.mode === 'light' ? WORDMARK_LIGHT : WORDMARK_DARK}
              alt="Plural Cloud"
            />
          </WordmarkLinkSC>
        </ActionsSC>
      </HeaderContentSC>
    </HeaderSC>
  )
}

function ServiceAccountBanner() {
  const previousUser = getPreviousUserData()
  const me = useContext(CurrentUserContext)

  if (!previousUser) return null

  return (
    <Flex
      align="center"
      gap="xsmall"
      height="100%"
    >
      <InfoIcon
        size={12}
        color="text-warning-light"
      />
      <CaptionP $color="text-xlight">
        You are currently logged in as {me.email}.{' '}
        <InlineLinkButtonSC
          onClick={() => handlePreviousUserClick(previousUser)}
        >
          Switch to {previousUser.me.email}
        </InlineLinkButtonSC>
      </CaptionP>
    </Flex>
  )
}

const HeaderSC = styled.div(({ theme }) => ({
  backgroundColor: theme.colors['fill-accent'],
  borderBottom: theme.borders.default,
}))

const HeaderContentSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.small,
  height: HEADER_HEIGHT,
  padding: `0 ${theme.spacing.medium}`,
}))

const CrumbsSC = styled.div({
  display: 'flex',
  alignItems: 'center',
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
  '.crumbs': { flex: 1, minWidth: 0 },
})

const ActionsSC = styled.div(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing.small,
  flexShrink: 0,
}))

const WordmarkLinkSC = styled(Link)({
  display: 'flex',
  alignItems: 'center',
  img: { height: 18, display: 'block' },
})
