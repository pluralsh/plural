import { useMutation } from '@apollo/client'
import {
  Button,
  ListBoxFooter,
  Modal,
  PersonPlusIcon,
} from '@pluralsh/design-system'
import { Div, Flex, Span } from 'honorable'
import {
  DispatchWithoutAction,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from 'react'

import subscriptionContext from '../../contexts/SubscriptionContext'
import { Group, Invite } from '../../generated/graphql'
import CreateGroup from '../account/invite/CreateGroup'
import InviteUser from '../account/invite/InviteUser'
import { UPDATE_SERVICE_ACCOUNT } from '../account/queries'

import { BindingInput } from '../account/Typeaheads'
import { sanitize } from '../account/utils'
import { GqlError } from '../utils/Alert'

import UpgradeNeededModal from './UpgradeNeededModal'

enum View {
  Managers,
  InviteUser,
  CreateGroup,
}

function ClusterAdmins({
  serviceAccount,
  onClose,
  onInvite,
  invites,
}): ReactElement {
  const [bindings, setBindings] = useState([
    ...invites,
    ...(serviceAccount?.impersonationPolicy?.bindings ?? []),
  ])

  const [mutation, { loading, error }] = useMutation(UPDATE_SERVICE_ACCOUNT, {
    variables: {
      id: serviceAccount.id,
      attributes: { impersonationPolicy: { bindings: bindings.map(sanitize) } },
    },
    onCompleted: onClose,
  })

  console.log(bindings)

  return (
    <>
      {error && (
        <GqlError
          header="Something went wrong"
          error={error}
        />
      )}
      <Div
        body2
        color="text-light"
      >
        Bind users to the service account owning this cluster. This will allow
        users to do low level git operations to this cluster.
      </Div>
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
        dropdownFooterFixed={
          <ListBoxFooter
            onClick={onInvite}
            leftContent={<PersonPlusIcon color="icon-info" />}
          >
            <Span color="action-link-inline">Invite new user</Span>
          </ListBoxFooter>
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
      <Flex justifyContent="space-between">
        <Button
          secondary
          onClick={onClose}
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
      </Flex>
    </>
  )
}

export function ClusterAdminsModal({ onClose, serviceAccount }) {
  const { isPaidPlan, isTrialPlan } = useContext(subscriptionContext)

  const [view, setView] = useState(View.Managers)
  const [bindings, setBindings] = useState<Array<object>>([])
  const [groups, setGroups] = useState<Array<Group>>([])
  const [onCreateGroup, setOnCreateGroup] = useState<DispatchWithoutAction>()

  const header = useMemo(() => {
    switch (view) {
      case View.Managers:
        return 'cluster managers'
      case View.InviteUser:
        return 'invite user'
      case View.CreateGroup:
        return 'create group'
    }
  }, [view])

  if (!(isPaidPlan || isTrialPlan))
    return (
      <UpgradeNeededModal
        open
        onClose={onClose}
      />
    )

  return (
    <Modal
      header={header}
      portal
      open
      onClose={onClose}
      style={{ padding: 0 }}
      size="large"
    >
      <Flex
        direction="column"
        gap="xlarge"
      >
        {view === View.Managers && (
          <ClusterAdmins
            serviceAccount={serviceAccount}
            onClose={onClose}
            onInvite={() => setView(View.InviteUser)}
            invites={bindings}
          />
        )}
        {view === View.InviteUser && (
          <InviteUser
            onGroupCreate={() => setView(View.CreateGroup)}
            onInvite={(invite: Invite) => {
              setBindings((bindings) => [
                ...(invite.user
                  ? [...bindings, { id: invite.user?.id, user: invite.user }]
                  : [...bindings]),
              ])
              setView(View.Managers)
              setGroups([])
            }}
            onBack={() => setView(View.Managers)}
            bindings={groups}
            refetch={setOnCreateGroup}
          />
        )}
        {view === View.CreateGroup && (
          <CreateGroup
            onBack={() => setView(View.InviteUser)}
            onCreate={(group: Group) => {
              setGroups((groups) => [...groups, group])
              setView(View.InviteUser)
              onCreateGroup?.()
            }}
          />
        )}
      </Flex>
    </Modal>
  )
}
