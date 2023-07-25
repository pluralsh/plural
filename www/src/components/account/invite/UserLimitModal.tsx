import { Button, Modal } from '@pluralsh/design-system'
import { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

const UserLimitModal = styled(UserLimitModalUnstyled)(({ theme }) => ({
  '.message': {
    ...theme.partials.text.body1,
  },
}))

function UserLimitModalUnstyled({ onClose }): ReactElement {
  return (
    <Modal
      open
      onClose={onClose}
      size="medium"
      header="User limit"
      severity="danger"
      style={{ padding: 0 }}
      actions={
        <Button
          as={Link}
          to="/account/billing"
        >
          Review plans
        </Button>
      }
    >
      <div className="message">
        You have reached your user limit for the Open-source plan. Upgrade to
        Plural Professional to add additional users.
      </div>
    </Modal>
  )
}

export default UserLimitModal
