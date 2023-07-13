import { Button, Modal } from '@pluralsh/design-system'
import styled from 'styled-components'

import { useBeginTrialMutation } from '../../../generated/graphql'
import { GqlError } from '../../utils/Alert'

type BillingStartTrialModalProps = {
  open: boolean
  onClose: () => void
}

const ErrorWrapper = styled.div(({ theme }) => ({
  paddingBottom: theme.spacing.large,
}))

const Header = styled.div(({ theme }) => ({
  ...theme.partials.text.body1,
  fontWeight: '600',
}))

const Description = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  color: theme.colors['text-light'],
  marginTop: theme.spacing.medium,

  '& > ul': {
    paddingLeft: theme.spacing.large,
  },
}))

const ButtonGroup = styled.div(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing.medium,
  justifyContent: 'flex-end',
  marginTop: theme.spacing.xlarge,
}))

function BillingStartTrialModal({
  open,
  onClose,
}: BillingStartTrialModalProps) {
  const [beginTrial, { loading, error }] = useBeginTrialMutation({
    onCompleted: () => {
      window.location.reload()
      onClose()
    },
  })

  return (
    <Modal
      BackdropProps={{ zIndex: 20 }}
      open={open}
      onClose={onClose}
      style={{ padding: 0 }}
      size="large"
      header="Free Trial Confirmation"
    >
      {error && (
        <ErrorWrapper>
          <GqlError
            error={error}
            header="Could not start free trial"
          />
        </ErrorWrapper>
      )}

      <Header>Experience Plural Professional free for 30 days.</Header>
      <Description>
        Try out full feature access to Plural Professional risk free for 30
        days. Features include:
        <ul>
          <li>Multi-cluster management</li>
          <li>Cluster promotions</li>
          <li>Advanced user management with groups and roles</li>
          <li>Service accounts</li>
          <li>VPNs</li>
        </ul>
      </Description>

      <ButtonGroup>
        <Button
          secondary
          alignSelf="flex-end"
          onClick={() => onClose()}
        >
          Cancel
        </Button>
        <Button
          primary
          loading={loading}
          onClick={beginTrial}
          alignSelf="flex-end"
        >
          Start free trial
        </Button>
      </ButtonGroup>
    </Modal>
  )
}

export default BillingStartTrialModal
