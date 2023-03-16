import { Button, Modal, Toast } from '@pluralsh/design-system'
import { A, Flex, P } from 'honorable'
import moment from 'moment'
import { ComponentProps, useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import SubscriptionContext from '../../contexts/SubscriptionContext'
import { EXPIRATION_NOTICE_STATE, LEGACY_EXPIRATION_NOTICE_STORAGE_KEY } from '../../helpers/localStorage'

export function LegacyExpirationNotice() {
  const { isProPlan, isEnterprisePlan, account }
    = useContext(SubscriptionContext)
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
  console.log('expirationmodal 1')
  const initialOpen
    = localStorage.getItem(LEGACY_EXPIRATION_NOTICE_STORAGE_KEY)
    !== EXPIRATION_NOTICE_STATE.DISMISSED_0
  const [isOpen, setIsOpen] = useState(initialOpen)
  const onClose = () => {
    setIsOpen(false)
    localStorage.setItem(LEGACY_EXPIRATION_NOTICE_STORAGE_KEY,
      EXPIRATION_NOTICE_STATE.DISMISSED_0)
  }

  return (
    <Modal
      header="Expired feature access"
      portal
      open={isOpen}
      onClose={onClose}
      actions={(
        <Flex gap="medium">
          <Button
            as={Link}
            to="/account/billing"
            onClick={onClose}
          >
            Review plans
          </Button>
        </Flex>
      )}
      size="large"
    >
      <Flex
        gap="medium"
        direction="column"
      >
        <P body1>Your legacy user feature access has expired.</P>
        <P body1>
          Upgrade to Plural professional to add 5+ users and retain access to
          Roles, Groups, Service accounts, and VPN clients. Current settings
          will continue to function but can not to be updated.
        </P>
        <P body1>
          Thank you for being one of our early adopters. If you have any
          questions or feedback please reach out via{' '}
          <A
            as={Link}
            inline
            target="_blank"
            rel="noopener noreferrer"
            to="https://discord.gg/pluralsh"
          >
            discord
          </A>
          .
        </P>
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
  let dismissState: EXPIRATION_NOTICE_STATE
    = EXPIRATION_NOTICE_STATE.DISMISSED_3

  if (remainingDays <= 10) {
    messageOpening = (
      <>Last chance to upgrade! Extended feature access ending {endDate}.</>
    )
    severity = 'error'
    dismissState = EXPIRATION_NOTICE_STATE.DISMISSED_2
  }
  else if (remainingDays <= 20) {
    messageOpening = <>Extended feature access ending {endDate}.</>
    severity = 'info'
    dismissState = EXPIRATION_NOTICE_STATE.DISMISSED_1
  }
  const messageClosing = (
    <>
      Upgrade to Plural professional to add 5+ users and retain access to Roles,
      Groups, Service accounts, and VPN clients.
    </>
  )
  const plansLink = (
    <A
      inline
      as={Link}
      to="/account/billing"
      onClick={() => {
        setCloseTimeout(0)
        onClose()
      }}
    >
      Review plans
    </A>
  )

  const [showToast] = useState(localStorage.getItem(LEGACY_EXPIRATION_NOTICE_STORAGE_KEY) !== dismissState)
  const [closeTimeout, setCloseTimeout] = useState(30000)

  if (!showToast) {
    return null
  }
  const onClose = () => {
    localStorage.setItem(LEGACY_EXPIRATION_NOTICE_STORAGE_KEY, dismissState)
  }

  return (
    <Toast
      severity={severity}
      marginBottom="medium"
      marginRight="xxxxlarge"
      closeTimeout={closeTimeout}
      open={showToast}
      onClose={onClose}
    >
      {messageOpening} {messageClosing} {plansLink}
    </Toast>
  )
}
