import { useMutation } from '@apollo/client'
import { Button, Card, Flex, Toast } from '@pluralsh/design-system'
import { UPDATE_SERVICE_ACCOUNT } from 'components/account/queries'
import {
  BindingInput,
  fetchGroups,
  fetchUsers,
} from 'components/account/Typeaheads'
import { Body2P, OverlineH1 } from 'components/utils/Typography'
import {
  ConsoleInstanceFragment,
  ImpersonationPolicyBindingFragment,
} from 'generated/graphql'
import { useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { isNonNullable } from 'utils/isNonNullable'
import { bindingsToBindingAttributes } from '../EditPluralOIDCClient'
import { areBindingsEqual } from './login-settings/PluralCloudInstanceLoginSettings'
import { GqlError } from 'components/utils/Alert'

type BindingsArray = Omit<ImpersonationPolicyBindingFragment, 'id'>[]

export function PluralCloudInstanceClusterPermissions({
  instance,
}: {
  instance: ConsoleInstanceFragment
}) {
  const { colors } = useTheme()
  const serviceAccount = instance.owner
  const serviceAccountBindings =
    serviceAccount?.impersonationPolicy?.bindings?.filter(isNonNullable) ?? []

  const [showToast, setShowToast] = useState(false)
  const [bindings, setBindings] = useState<BindingsArray>(
    serviceAccountBindings
  )
  const hasUpdates = !areBindingsEqual(bindings, serviceAccountBindings)

  const [mutation, { loading, error }] = useMutation(UPDATE_SERVICE_ACCOUNT, {
    variables: {
      id: serviceAccount?.id,
      attributes: {
        impersonationPolicy: {
          bindings: bindingsToBindingAttributes(bindings),
        },
      },
    },
    onCompleted: () => setShowToast(true),
  })

  return (
    <LoginSettingsWrapperCardSC>
      {error && <GqlError error={error} />}
      <div>
        <Flex
          width="100%"
          justify="space-between"
          align="center"
        >
          <OverlineH1
            as="h3"
            $color="text-xlight"
          >
            Cluster permissions
          </OverlineH1>
          <Flex gap="small">
            <Button
              secondary
              disabled={!hasUpdates}
              onClick={() => setBindings(serviceAccountBindings)}
            >
              Reset
            </Button>
            <Button
              loading={loading}
              disabled={!hasUpdates || loading}
              onClick={() => mutation()}
            >
              Save
            </Button>
          </Flex>
        </Flex>
        <Body2P>
          Allow certain users/groups to make edits to the Plural Cloud
          management cluster
        </Body2P>
      </div>
      <Flex
        gap="medium"
        width="100%"
      >
        <BindingInput
          type="user"
          inputStyle={{ background: colors['fill-two'] }}
          css={{ flex: 1 }}
          bindings={bindings
            .filter(({ user }) => !!user)
            .map(({ user }) => user?.email)}
          fetcher={fetchUsers}
          add={(user) =>
            !bindings.some(({ user: u }) => u?.email === user?.email) &&
            setBindings([...bindings, { user }])
          }
          remove={(email) =>
            setBindings(bindings.filter(({ user }) => user?.email !== email))
          }
        />
        <BindingInput
          type="group"
          css={{ flex: 1 }}
          inputStyle={{ background: colors['fill-two'] }}
          bindings={bindings
            .filter(({ group }) => !!group)
            .map(({ group }) => group?.name)}
          fetcher={fetchGroups}
          add={(group) =>
            !bindings.some(({ group: g }) => g?.name === group?.name) &&
            setBindings([...bindings, { group }])
          }
          remove={(name) =>
            setBindings(bindings.filter(({ group }) => group?.name !== name))
          }
        />
      </Flex>
      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        closeTimeout={2500}
        severity="success"
        position="bottom"
      >
        Cluster permissions updated successfully
      </Toast>
    </LoginSettingsWrapperCardSC>
  )
}

const LoginSettingsWrapperCardSC = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing.large,
  padding: theme.spacing.large,
}))
