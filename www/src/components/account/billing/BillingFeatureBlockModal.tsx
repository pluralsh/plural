import { Button, Modal, WarningIcon } from '@pluralsh/design-system'
import { Dispatch } from 'react'
import styled from 'styled-components'

type BillingFeatureBlockModalProps = {
  message?: string
  open: boolean
  onClose: Dispatch<void>
}

const Header = styled.div({
  display: 'inline-flex',
  justifyContent: 'center',
})

const ActionsWrap = styled.div({
  display: 'flex',
  justifyContent: 'end',
})

export default function BillingFeatureBlockModal({ message = 'Upgrade to Plural Professional to use this feature.', open = false, onClose }: BillingFeatureBlockModalProps) {
  return (
    <Modal
      BackdropProps={{ zIndex: 20 }}
      header={(
        <Header>
          <WarningIcon
            color="icon-warning"
            marginRight="xsmall"
          />
          Upgrade needed
        </Header>
      )}
      open={open}
      onClose={() => onClose()}
      size="large"
      style={{ padding: 0 }}
    >
      {message}
      <ActionsWrap>
        <Button
          as="a"
          href="https://app.plural.sh/account/billing"
          target="_blank"
          rel="noopener noreferrer"
          width="max-content"
          marginTop="large"
          onClick={() => onClose()}
        >
          Review plans
        </Button>
      </ActionsWrap>
    </Modal>
  )
}
