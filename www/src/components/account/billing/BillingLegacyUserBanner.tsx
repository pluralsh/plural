import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { Callout } from '@pluralsh/design-system'
import { A, DivProps } from 'honorable'
import styled from 'styled-components'

import SubscriptionContext from '../../../contexts/SubscriptionContext'

type BillingLegacyUserBannerPropsType = DivProps & {
  feature?: string
  withBottomMargin?: boolean
}

const Wrapper = styled.div<{withBottomMargin: boolean}>(({ theme, withBottomMargin }) => ({ marginBottom: withBottomMargin ? theme.spacing.large : undefined }))

function BillingLegacyUserBanner({ feature, withBottomMargin = true, ...props }: BillingLegacyUserBannerPropsType) {
  const { isProPlan, isEnterprisePlan, isGrandfathered } = useContext(SubscriptionContext)
  const open = !(isProPlan || isEnterprisePlan) && isGrandfathered

  if (!open) return null

  return (
    <Wrapper withBottomMargin={withBottomMargin}>
      <Callout
        severity="warning"
        title="Legacy user access ends soon."
        {...props}
      >
        {!!feature && (
          <>
            {feature} are a Professional plan feature.
            {' '}
            <A
              inline
              as={Link}
              to="/account/billing"
            >
              Upgrade now
            </A>
            .
          </>
        )}
        {!feature && 'You have access to Professional features for a short period of time.'}
      </Callout>
    </Wrapper>
  )
}

export default BillingLegacyUserBanner
