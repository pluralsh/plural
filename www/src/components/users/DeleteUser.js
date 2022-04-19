import { useState } from 'react'
import { Trash } from 'forge-core'
import { useMutation } from '@apollo/client'

import { Icon } from '../accounts/Group'
import { Confirm } from '../utils/Confirm'

import { DELETE_USER } from './queries'

const MSG = 'This will delete the user permanently and all their installations.  You should run `plural destroy` in their workspace prior to doing this.'

export function DeleteUser({ id, update }) {
  const [confirm, setConfirm] = useState(false)
  const [mutation, { loading, error }] = useMutation(DELETE_USER, {
    variables: { id },
    update,
    onCompleted: () => setConfirm(false),
  })

  return (
    <>
      <Icon
        icon={Trash}
        onClick={() => setConfirm(true)}
        iconAttrs={{ color: 'error' }}
      />
      {confirm && (
        <Confirm
          error={error}
          header="Delete user?"
          description={MSG}
          submit={mutation}
          cancel={() => setConfirm(false)}
          label="Delete"
          loading={loading}
        />
      )}
    </>
  )
}
