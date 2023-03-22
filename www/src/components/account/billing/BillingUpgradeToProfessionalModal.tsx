import { Modal } from '@pluralsh/design-system'

import PaymentForm, { PaymentFormVariant } from './PaymentForm'

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
      <PaymentForm formVariant={PaymentFormVariant.Upgrade} />
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal
