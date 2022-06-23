import { Button, ModalActions } from 'pluralsh-design-system'

export function Actions({ cancel, submit, loading }) {
  return (
    <ModalActions>
      <Button
        secondary
        onClick={cancel}
      >Cancel
      </Button>
      <Button
        onClick={submit}
        loading={loading}
        marginLeft="medium"
      >Create
      </Button>
    </ModalActions>
  )
}
