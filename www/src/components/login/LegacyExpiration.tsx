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
  const intialOpen
    = localStorage.getItem(LEGACY_EXPIRATION_NOTICE_STORAGE_KEY)
    !== EXPIRATION_NOTICE_STATE.DISMISSED_0
  const [isOpen, setIsOpen] = useState(intialOpen)
  const onClose = () => {
    setIsOpen(false)
    localStorage.setItem(LEGACY_EXPIRATION_NOTICE_STORAGE_KEY,
      EXPIRATION_NOTICE_STATE.DISMISSED_0)
  }

  return (
    <Modal
      header="Edit service account"
      portal
      open={isOpen}
      onClose={onClose}
      actions={(
        <Flex gap="medium">
          <Button
            secondary
            onClick={onClose}
          >
            Close
          </Button>
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
      <P body1>
        Extended feature access has ended. Upgrade to Plural professional to
        retain access to Roles, Groups, Services accounts, and VPN clients.
      </P>
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
      retain access to Roles, Groups, Services accounts, and VPN clients.
    </>
  )
  let severity: ComponentProps<typeof Toast>['severity'] = 'info'
  let dismissState: EXPIRATION_NOTICE_STATE
    = EXPIRATION_NOTICE_STATE.DISMISSED_3

  if (remainingDays <= 10) {
    message = (
      <>
        Last chance to upgrade! Extended feature access ending {endDate}.
        Upgrade to Plural professional to retain access to Roles, Groups,
        Services accounts, and VPN clients.
      </>
    )
    severity = 'error'
    dismissState = EXPIRATION_NOTICE_STATE.DISMISSED_2
  }
  else if (remainingDays <= 20) {
    message = (
      <>
        Extended feature access ending {endDate}. Upgrade to Plural professional
        to retain access to Roles, Groups, Services accounts, and VPN clients.
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
