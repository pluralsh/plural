import { useMutation } from '@apollo/client'
import { Button } from 'honorable'
import { Modal, ModalHeader } from 'pluralsh-design-system'
import { useMemo, useState } from 'react'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'

import { UPDATE_ROLE } from '../accounts/queries'

import { Actions } from './Actions'
import { sanitize } from './utils'
import { MODAL_DIMS } from './Role'
import { RoleForm } from './RoleForm'

export function EditRole({ role }) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState({
    name: role.name,
    description: role.description,
    repositories: role.repositories,
    permissions: role.permissions,
  })
  const [roleBindings, setRoleBindings] = useState(role.roleBindings || [])
  const uniqueRoleBindings = useMemo(() => uniqWith(roleBindings, isEqual),
    [roleBindings])

  const [mutation, { loading, error }] = useMutation(UPDATE_ROLE, {
    variables: {
      id: role.id,
      attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) },
    },
    onCompleted: () => setOpen(null),
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
        portal
        open={open}
        onClose={() => setOpen(false)}
        marginVertical={16}
        {...MODAL_DIMS}
      >
        <ModalHeader onClose={() => setOpen(false)}>UPDATE ROLE</ModalHeader>
        <RoleForm
          attributes={attributes}
          setAttributes={setAttributes}
          bindings={uniqueRoleBindings}
          setBindings={setRoleBindings}
          error={error}
        />
        <Actions
          cancel={() => setOpen(false)}
          submit={mutation}
          loading={loading}
          action="Update"
        />
      </Modal>
    </>
  )
}
