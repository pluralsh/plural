import { Button, Modal, ModalActions } from 'pluralsh-design-system'

import { GqlError } from '../utils/Alert'

export function Confirm({ open, close, title, error, text, submit, label, loading }) {
  return (
    <Modal
      open={open}
      onClose={close}
      title={title || 'Are you sure?'}
    >
      {error ? (
        <GqlError
          error={error}
          header="Something went wrong"
        />
      ) : text}
      <ModalActions>
        <Button
          secondary
          onClick={close}
        >Cancel
        </Button>
        <Button
          onClick={submit}
          loading={loading}
          marginLeft="medium"
        >{label || 'Confirm'}
        </Button>
      </ModalActions>
    </Modal>
  )
}
