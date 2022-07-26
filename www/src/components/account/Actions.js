import { Button, ModalActions } from 'pluralsh-design-system'

export function Actions({
  cancel, submit, loading, action, destructive,
}) {
  return (
    <ModalActions>
      <Button
        secondary
        onClick={cancel}
      >Cancel
      </Button>
      <Button
        destructive={destructive}
        onClick={submit}
        disabled={!submit}
        loading={loading}
        marginLeft="medium"
      >{action || 'Create'}
      </Button>
    </ModalActions>
  )
}
