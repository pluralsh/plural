import { Button, ModalActions } from 'pluralsh-design-system'

export function Actions({ cancel, submit, loading, action }) {
  return (
    <ModalActions>
      <Button
        secondary
        onClick={cancel}
      >Cancel
      </Button>
      <Button
        onClick={submit}
        disabled={!submit}
        loading={loading}
        marginLeft="medium"
      >{action || 'Create'}
      </Button>
    </ModalActions>
  )
}
