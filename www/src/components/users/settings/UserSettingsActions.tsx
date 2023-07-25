import { Button } from '@pluralsh/design-system'
import { ReactElement } from 'react'
import styled from 'styled-components'

import { UserSettingsActionsProps } from './types'

const UserSettingsActions = styled(UserSettingsActionsUnstyled)(
  ({ theme }) => ({
    display: 'flex',
    gap: theme.spacing.medium,

    '.spacer': {
      flex: 1,
    },
  })
)

function UserSettingsActionsUnstyled({
  onCancel,
  onDelete,
  onUpdate,
  changed,
  loading,
  ...props
}: UserSettingsActionsProps): ReactElement {
  return (
    <div {...props}>
      <Button
        destructive
        disabled={loading}
        onClick={onDelete}
      >
        Delete user
      </Button>
      <div className="spacer" />
      <Button
        secondary
        disabled={loading}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        primary
        disabled={!changed || loading}
        loading={loading}
        onClick={onUpdate}
      >
        Update
      </Button>
    </div>
  )
}

export default UserSettingsActions
