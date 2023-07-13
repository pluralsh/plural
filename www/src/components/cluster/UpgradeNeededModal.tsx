import { Button, Modal, WarningIcon } from '@pluralsh/design-system'
import { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

const Wrap = styled.div((_) => ({
  display: 'flex',
  flexDirection: 'column',
}))

const Message = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  marginBottom: theme.spacing.large,
}))

const Header = styled.div(({ theme }) => ({
  ...theme.partials.text.overline,
  display: 'flex',
}))

function UpgradeNeededModal({ open, onClose }): ReactElement {
  const navigate = useNavigate()

  return (
    <Modal
      BackdropProps={{ zIndex: 20 }}
      header={
        <Header>
          <WarningIcon
            color="icon-warning"
            marginRight="xsmall"
          />
          Upgrade needed
        </Header>
      }
      open={open}
      onClose={() => onClose()}
      style={{ padding: 0 }}
    >
      <Wrap>
        <Message>
          Upgrade to Plural Professional to access multi-cluster-management.
        </Message>
        <Button
          alignSelf="flex-end"
          onClick={() => navigate('/account/billing')}
        >
          Review plans
        </Button>
      </Wrap>
    </Modal>
  )
}

export default UpgradeNeededModal
