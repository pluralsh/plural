import { Button, CaretLeftIcon, Input } from '@pluralsh/design-system'
import { ReactElement, useState } from 'react'
import styled from 'styled-components'

import { useDeleteUserMutation } from '../../../generated/graphql'
import { UserInfo } from '../../account/User'
import { GqlError } from '../Alert'

import { DeleteUserProps } from './types'

const DeleteUser = styled(DeleteUserUnstyled)(({ theme }) => ({
  ...theme.partials.text.body2,

  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.xlarge,

  '.info': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xlarge,
  },

  '.confirm': {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xxsmall,
  },

  '.actions': {
    display: 'flex',
    gap: theme.spacing.medium,
    justifyContent: 'space-between',
  },
}))

function DeleteUserUnstyled({
  user,
  onBack,
  onDelete,
  update,
  ...props
}: DeleteUserProps): ReactElement {
  const [confirmed, setConfirmed] = useState(false)

  const [deleteUser, { loading, error }] = useDeleteUserMutation({
    variables: { id: user.id },
    update,
    onCompleted: onDelete,
  })

  return (
    <div {...props}>
      {error && (
        <GqlError
          error={error}
          header="Failed to delete user"
        />
      )}
      <div className="info">
        <UserInfo
          fill="horizontal"
          user={user}
        />
        <div>
          Make sure this user has no active installations before deleting.
        </div>
      </div>
      <div className="confirm">
        <div>
          To confirm, type "<b>{user.name}</b>" in the box below
        </div>
        <Input
          borderColor="border-danger"
          onChange={({ target: { value } }) =>
            value === user.name ? setConfirmed(true) : setConfirmed(false)
          }
        />
      </div>
      <div className="actions">
        {onBack && (
          <Button
            secondary
            startIcon={<CaretLeftIcon />}
            disabled={loading}
            onClick={onBack}
          >
            Back
          </Button>
        )}
        <div />
        <Button
          destructive
          disabled={!confirmed || loading}
          loading={loading}
          onClick={deleteUser}
        >
          Delete
        </Button>
      </div>
    </div>
  )
}

export default DeleteUser
