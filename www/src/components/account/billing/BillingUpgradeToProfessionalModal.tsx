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
      size="large"
      header="Upgrade to professional"
    >
      <PaymentForm formVariant={PaymentFormVariant.Upgrade} />
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal
