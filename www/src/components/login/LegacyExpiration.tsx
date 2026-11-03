import { Button, Flex, Modal, Toast } from '@pluralsh/design-system'
import moment from 'moment'
import { ComponentProps, useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import SubscriptionContext from '../../contexts/SubscriptionContext'
import { LocalStorageKeys } from '../../constants'
import { EXPIRATION_NOTICE_STATE } from '../../helpers/localStorage'
import { Body1P, InlineA, InlineLinkSC } from '../utils/Typography'

export function LegacyExpirationNotice() {
  const { isProPlan, isEnterprisePlan, account } =
    useContext(SubscriptionContext)
  const grandfatheredUntil = account?.grandfatheredUntil
  const isLegacy = !(isProPlan || isEnterprisePlan) && !!grandfatheredUntil

  if (!isLegacy) return null

  const remainingDays = moment(grandfatheredUntil).diff(moment(), 'days', true)
  const endDate = moment(grandfatheredUntil).format('MMM DD, YYYY')

  if (remainingDays <= 0) {
    return <ExpiredModal />
  }

  return (
    <ExpirationToast
      remainingDays={remainingDays}
      endDate={endDate}
    />
  )
}

function ExpiredModal() {
  const initialOpen =
    localStorage.getItem(LocalStorageKeys.LegacyExpirationNotice) !==
    EXPIRATION_NOTICE_STATE.DISMISSED_0
  const [isOpen, setIsOpen] = useState(initialOpen)
  const onClose = () => {
    setIsOpen(false)
    localStorage.setItem(
      LocalStorageKeys.LegacyExpirationNotice,
      EXPIRATION_NOTICE_STATE.DISMISSED_0
    )
  }

  return (
    <Modal
      header="Expired feature access"
      open={isOpen}
      onClose={onClose}
      actions={
        <Flex gap="medium">
          <Button
            as={Link}
            to="/account/billing"
            onClick={onClose}
          >
            Review plans
          </Button>
        </Flex>
      }
      size="large"
    >
      <Flex
        gap="medium"
        direction="column"
      >
        <Body1P>Your legacy user feature access has expired.</Body1P>
        <Body1P>
          Upgrade to Plural professional to add 5+ users and retain access to
          Roles, Groups, Service accounts, and VPN clients. Current settings
          will continue to function but can not to be updated.
        </Body1P>
        <Body1P>
          Thank you for being one of our early adopters. If you have any
          questions or feedback please reach out via{' '}
          <InlineA href="https://discord.gg/pluralsh">discord</InlineA>.
        </Body1P>
      </Flex>
    </Modal>
  )
}

function ExpirationToast({
  remainingDays,
  endDate,
}: {
  remainingDays: number
  endDate: string
}) {
  // Defaults for remaining days > 20
  let messageOpening = <>Extended feature access ending soon.</>
  let severity: ComponentProps<typeof Toast>['severity'] = 'info'
  let dismissState: EXPIRATION_NOTICE_STATE =
    EXPIRATION_NOTICE_STATE.DISMISSED_3

  if (remainingDays <= 10) {
    messageOpening = (
      <>Last chance to upgrade! Extended feature access ending {endDate}.</>
    )
    severity = 'danger'
    dismissState = EXPIRATION_NOTICE_STATE.DISMISSED_2
  } else if (remainingDays <= 20) {
    messageOpening = <>Extended feature access ending {endDate}.</>
    severity = 'info'
    dismissState = EXPIRATION_NOTICE_STATE.DISMISSED_1
  }
  const messageClosing = (
    <>
      Upgrade to Plural Pro to add more than 5 users and retain access to Roles,
      Groups, Service accounts, and VPN clients.
    </>
  )
  const plansLink = (
    <InlineLinkSC
      to="/account/billing"
      onClick={() => {
        setCloseTimeout(0)
        onClose()
      }}
    >
      Review plans
    </InlineLinkSC>
  )

  const [showToast] = useState(
    localStorage.getItem(LocalStorageKeys.LegacyExpirationNotice) !==
      dismissState
  )
  const [closeTimeout, setCloseTimeout] = useState(30000)

  if (!showToast) {
    return null
  }
  const onClose = () => {
    localStorage.setItem(LocalStorageKeys.LegacyExpirationNotice, dismissState)
  }

  return (
    <Toast
      severity={severity}
      marginBottom="medium"
      marginRight="xxxxlarge"
      closeTimeout={closeTimeout}
      show={showToast}
      onClose={onClose}
    >
      {messageOpening} {messageClosing} {plansLink}
    </Toast>
  )
}
