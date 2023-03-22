import { useCallback } from 'react'
import { Modal } from '@pluralsh/design-system'

import PaymentForm from './PaymentForm'

type BillingUpgradeToProfessionalModalPropsType = {
  open: boolean
  onClose: () => void
}

function BillingUpgradeToProfessionalModal({
  open,
  onClose,
}: BillingUpgradeToProfessionalModalPropsType) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      header="Upgrade to professional"
      minWidth={512 + 128}
    >
      <PaymentForm type="upgrade" />
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal
