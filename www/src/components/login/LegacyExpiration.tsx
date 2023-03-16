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
        <P body1>
          Your extended feature access to Plural Professional has ended and your
          account has been transitioned to the Open-source plan. Accounts with
          more than 5 users will not be able to add more users until the account
          is upgraded. Current Roles, Groups, Service Accounts, and VPN clients
          will continue to function but cannot be updated, and new ones cannot be
          created.
        </P>
        <P body1>
          Thank you for being one of our early adopters. If you have any questions
          or feedback please reach out via{' '}
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
  let message = (
    <>
      Extended feature access ending soon. Upgrade to Plural professional to
      retain access to Roles, Groups, Services accounts, and VPN clients and add
      more than 5 Plural users.
    </>
  )
  let severity: ComponentProps<typeof Toast>['severity'] = 'info'
  let dismissState: EXPIRATION_NOTICE_STATE
    = EXPIRATION_NOTICE_STATE.DISMISSED_3

  if (remainingDays <= 10) {
    message = (
      <>
        Extended feature access ending {endDate}. Upgrade to Plural professional to
        retain access to Roles, Groups, Services accounts, and VPN clients and
        add more than 5 Plural users.
      </>
    )
    severity = 'error'
    dismissState = EXPIRATION_NOTICE_STATE.DISMISSED_2
  }
  else if (remainingDays <= 20) {
    message = (
      <>
        Last chance to upgrade! Extended feature access ending {endDate}. Upgrade
        to Plural professional to retain access to Roles, Groups, Services
        accounts, and VPN clients and add more than 5 Plural users.
      </>
    )
    severity = 'info'
    dismissState = EXPIRATION_NOTICE_STATE.DISMISSED_1
  }

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
      {message}{' '}
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
    </Toast>
  )
}
