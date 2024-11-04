import { Button } from 'honorable'
import { Modal } from '@pluralsh/design-system'
import { useMemo, useState } from 'react'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'

import { useUpdateRoleMutation } from '../../generated/graphql'

import { Actions } from './Actions'
import { sanitize } from './utils'
import { RoleForm } from './RoleForm'

export function EditRole({ role }: any) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState({
    name: role.name,
    description: role.description,
    repositories: role.repositories,
    permissions: role.permissions,
  })
  const [roleBindings, setRoleBindings] = useState(role.roleBindings || [])
  const uniqueRoleBindings = useMemo(
    () => uniqWith(roleBindings, isEqual),
    [roleBindings]
  )

  const [mutation, { loading, error }] = useUpdateRoleMutation({
    variables: {
      id: role.id,
      attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) },
    },
    onCompleted: () => setOpen(false),
  })

  return (
    <>
      <Button
        secondary
        small
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>
      <Modal
        header="Edit role"
        open={open}
        size="large"
        onClose={() => setOpen(false)}
        actions={
          <Actions
            cancel={() => setOpen(false)}
            submit={() => mutation()}
            loading={loading}
            action="Update"
          />
        }
      >
        <RoleForm
          attributes={attributes}
          setAttributes={setAttributes}
          bindings={uniqueRoleBindings}
          setBindings={setRoleBindings}
          error={error}
        />
      </Modal>
    </>
  )
}
