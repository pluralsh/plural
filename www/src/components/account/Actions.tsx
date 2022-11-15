import { Button } from '@pluralsh/design-system'

export function Actions({
  cancel,
  submit,
  loading,
  action,
  destructive,
}: any) {
  return (
    <>
      <Button
        secondary
        onClick={cancel}
      >
        Cancel
      </Button>
      <Button
        destructive={destructive}
        onClick={submit}
        disabled={!submit}
        loading={loading}
        marginLeft="medium"
      >
        {action || 'Create'}
      </Button>
    </>
  )
}
