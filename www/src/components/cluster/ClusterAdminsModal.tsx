import { Button, Modal } from '@pluralsh/design-system'
import { Flex } from 'honorable'
import { useContext, useState } from 'react'
import { useMutation } from '@apollo/client'

import subscriptionContext from '../../contexts/SubscriptionContext'

import { BindingInput } from '../account/Typeaheads'
import { GqlError } from '../utils/Alert'
import { UPDATE_SERVICE_ACCOUNT } from '../account/queries'
import { sanitize } from '../account/utils'

import UpgradeNeededModal from './UpgradeNeededModal'

export function ClusterAdminsModal({ open, setOpen, serviceAccount }) {
  const { isPaidPlan, isTrialPlan } = useContext(subscriptionContext)
  const [bindings, setBindings] = useState(
    serviceAccount.impersonationPolicy?.bindings || []
  )

  const [mutation, { loading, error }] = useMutation(UPDATE_SERVICE_ACCOUNT, {
    variables: {
      id: serviceAccount.id,
      attributes: { impersonationPolicy: { bindings: bindings.map(sanitize) } },
    },
    onCompleted: () => setOpen(false),
  })

  if (!(isPaidPlan || isTrialPlan))
    return (
      <UpgradeNeededModal
        open={open}
        onClose={() => setOpen(false)}
      />
    )

  return (
    <Modal
      header="Cluster administrators"
      portal
      open={open}
      onClose={() => setOpen(false)}
      actions={
        <>
          <Button
            secondary
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => mutation()}
            loading={loading}
            marginLeft="medium"
          >
            Save
          </Button>
        </>
      }
      size="large"
    >
      <Flex
        direction="column"
        gap="xlarge"
      >
        {error && (
          <GqlError
            header="Something went wrong"
            error={error}
          />
        )}
        <BindingInput
          type="user"
          hint="Users that can administer this cluster"
          bindings={bindings
            .filter(({ user }) => !!user)
            .map(({ user: { email } }) => email)}
          add={(user) => setBindings([...bindings, { user }])}
          remove={(email) =>
            setBindings(
              bindings.filter(({ user }) => !user || user.email !== email)
            )
          }
        />
        <BindingInput
          type="group"
          hint="Groups that can administer this cluster"
          bindings={bindings
            .filter(({ group }) => !!group)
            .map(({ group: { name } }) => name)}
          add={(group) => setBindings([...bindings, { group }])}
          remove={(name) =>
            setBindings(
              bindings.filter(({ group }) => !group || group.name !== name)
            )
          }
        />
      </Flex>
    </Modal>
  )
}
