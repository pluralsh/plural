import { Button, Modal } from 'honorable'
import { ModalActions } from 'pluralsh-design-system'

type CreatePublisherModalProps = {
  open: boolean
  onClose: () => void
}

function CreatePublisherModal({ open, onClose }: CreatePublisherModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      foo
      <ModalActions gap="medium">
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button primary>
          Save
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default CreatePublisherModal
