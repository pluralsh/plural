import { Modal } from '@pluralsh/design-system'
import { ReactElement, useContext } from 'react'

import subscriptionContext from '../../../contexts/SubscriptionContext'
import UpgradeNeededModal, { Feature } from '../../cluster/UpgradeNeededModal'

import CreateGroup from './CreateGroup'

function CreateGroupModal({ onClose, onCreate }): ReactElement {
  const { isPaidPlan, isTrialPlan } = useContext(subscriptionContext)

  if (!(isPaidPlan || isTrialPlan))
    return (
      <UpgradeNeededModal
        feature={Feature.Groups}
        open
        onClose={onClose}
      />
    )

  return (
    <Modal
      open
      onClose={onClose}
      style={{ padding: 0 }}
      size="large"
      header="create group"
    >
      <CreateGroup onCreate={onCreate} />
    </Modal>
  )
}

export default CreateGroupModal
