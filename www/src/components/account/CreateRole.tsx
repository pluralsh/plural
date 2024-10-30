import { useCallback, useContext, useMemo, useState } from 'react'
import { useMutation } from '@apollo/client'
import { Button } from 'honorable'
import { Modal } from '@pluralsh/design-system'
import uniqWith from 'lodash/uniqWith'
import isEqual from 'lodash/isEqual'

import { appendConnection, updateCache } from '../../utils/graphql'

import SubscriptionContext from '../../contexts/SubscriptionContext'

import { ROLES_Q } from './queries'

import { Actions } from './Actions'
import { sanitize } from './utils'
import { RoleForm } from './RoleForm'
import BillingFeatureBlockModal from './billing/BillingFeatureBlockModal'
import { useCreateRoleMutation } from '../../generated/graphql'

const defaultAttributes = {
  name: '',
  description: '',
  repositories: ['*'],
  permissions: [],
}

export function CreateRole({ q }: any) {
  const { availableFeatures } = useContext(SubscriptionContext)
  const isAvailable = !!availableFeatures?.userManagement
  const [createModalVisible, setCreateModalVisible] = useState(false)
  const [blockModalVisible, setBlockModalVisible] = useState(false)
  const [attributes, setAttributes] = useState(defaultAttributes)
  const [roleBindings, setRoleBindings] = useState([])

  const uniqueRoleBindings = useMemo(
    () => uniqWith(roleBindings, isEqual),
    [roleBindings]
  )

  const resetAndClose = useCallback(() => {
    setAttributes(defaultAttributes)
    setRoleBindings([])
    setCreateModalVisible(false)
  }, [])

  const [mutation, { loading, error }] = useCreateRoleMutation({
    variables: {
      attributes: { ...attributes, roleBindings: roleBindings.map(sanitize) },
    },
    update: (cache, { data }) =>
      updateCache(cache, {
        query: ROLES_Q,
        variables: { q },
        update: (prev) => appendConnection(prev, data?.createRole, 'roles'),
      }),
    onCompleted: () => resetAndClose(),
  })

  return (
    <>
      <Button
        secondary
        onClick={() =>
          isAvailable ? setCreateModalVisible(true) : setBlockModalVisible(true)
        }
      >
        Create role
      </Button>

      {/* Modals */}
      <Modal
        header="Create role"
        open={createModalVisible}
        onClose={() => resetAndClose()}
        size="large"
        actions={
          <Actions
            cancel={() => resetAndClose()}
            submit={() => mutation()}
            loading={loading}
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
      <BillingFeatureBlockModal
        open={blockModalVisible}
        message="Upgrade to Plural Professional to create a role."
        onClose={() => setBlockModalVisible(false)}
      />
    </>
  )
}
