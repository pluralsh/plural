import { useCallback, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button } from 'honorable'
import { Modal } from '@pluralsh/design-system'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'

import { appendConnection, updateCache } from '../../utils/graphql'

import { CREATE_ROLE, ROLES_Q } from './queries'

import { Actions } from './Actions'
import { sanitize } from './utils'
import { RoleForm } from './RoleForm'

const defaultAttributes = {
  name: '',
  description: '',
  repositories: ['*'],
  permissions: [],
}

export function CreateRole({ q }: any) {
  const [open, setOpen] = useState(false)
  const [attributes, setAttributes] = useState(defaultAttributes)
  const [roleBindings, setRoleBindings] = useState([])
  const uniqueRoleBindings = useMemo(() => uniqWith(roleBindings, isEqual),
    [roleBindings])
  const resetAndClose = useCallback(() => {
    setAttributes(defaultAttributes)
    setRoleBindings([])
    setOpen(false)
  }, [])
  const [mutation, { loading, error }] = useMutation(CREATE_ROLE, {
    variables: {
      attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) },
    },
    update: (cache, { data: { createRole } }) => updateCache(cache, {
      query: ROLES_Q,
      variables: { q },
      update: prev => appendConnection(prev, createRole, 'roles'),
    }),
    onCompleted: () => resetAndClose(),
  })

  return (
    <>
      <Button
        secondary
        onClick={() => setOpen(true)}
      >
        Create role
      </Button>
      <Modal
        header="Create role"
        open={open}
        onClose={() => resetAndClose()}
        marginVertical={16}
        size="large"
        actions={(
          <Actions
            cancel={() => resetAndClose()}
            submit={() => mutation()}
            loading={loading}
          />
        )}
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
