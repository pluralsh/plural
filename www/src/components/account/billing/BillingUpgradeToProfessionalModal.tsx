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
  // const [upgradeSuccess, setUpgradeSuccess] = useState()

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="large"
      header="Upgrade to professional"
      // header={upgradeSuccess ? 'Successful upgrade' : 'Upgrade to professional'}
    >
      <PaymentForm
        formVariant={PaymentFormVariant.Upgrade}
        onClose={onClose}
        // onUpgradeSuccess={()=>setUpgradeSuccess)}
      />
    </Modal>
  )
}

export default BillingUpgradeToProfessionalModal
