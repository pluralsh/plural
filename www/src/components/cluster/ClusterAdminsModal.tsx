import { useMutation } from '@apollo/client'
import {
  Button,
  Chip,
  InfoOutlineIcon,
  ListBoxFooter,
  Modal,
  PeoplePlusIcon,
  PersonPlusIcon,
  Tooltip,
} from '@pluralsh/design-system'
import { Div, Flex, Span } from 'honorable'
import {
  DispatchWithoutAction,
  ReactElement,
  useContext,
  useMemo,
  useState,
} from 'react'

import ClustersContext from '../../contexts/ClustersContext'
import subscriptionContext from '../../contexts/SubscriptionContext'
import { Group } from '../../generated/graphql'
import InviteUser from '../account/invite/InviteUser'
import { UPDATE_SERVICE_ACCOUNT } from '../account/queries'
import { BindingInput } from '../account/Typeaheads'
import { sanitize } from '../account/utils'
import { GqlError } from '../utils/Alert'
import CreateGroup from '../utils/group/CreateGroup'

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
  onGroupCreate,
  selected,
}): ReactElement {
  const [bindings, setBindings] = useState([
    ...(serviceAccount?.impersonationPolicy?.bindings ?? []),
    ...(selected ?? []),
  ])

  const [mutation, { loading, error }] = useMutation(UPDATE_SERVICE_ACCOUNT, {
    variables: {
      id: serviceAccount.id,
      attributes: { impersonationPolicy: { bindings: bindings.map(sanitize) } },
    },
    onCompleted: onClose,
  })

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
        customBindings={serviceAccount.invites?.map((invite) => (
          <Tooltip label="Pending invitation">
            <Chip
              fillLevel={2}
              size="small"
              icon={<InfoOutlineIcon color="icon-xlight" />}
            >
              <Span color="text-primary-disabled">{invite.email}</Span>
            </Chip>
          </Tooltip>
        ))}
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
        dropdownFooterFixed={
          <ListBoxFooter
            onClick={onGroupCreate}
            leftContent={<PeoplePlusIcon color="icon-info" />}
          >
            <Span color="action-link-inline">Create new group</Span>
          </ListBoxFooter>
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
  const { refetchClusters } = useContext(ClustersContext)
  const { isPaidPlan, isTrialPlan } = useContext(subscriptionContext)

  const [view, setView] = useState(View.Managers)
  const [lastView, setLastView] = useState(View.Managers)
  const [groups, setGroups] = useState<Array<Group>>([])
  const [onCreateGroup, setOnCreateGroup] = useState<DispatchWithoutAction>()
  const [bindings, setBindings] = useState<Array<object>>([])

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
            onGroupCreate={() => {
              setView(View.CreateGroup)
              setLastView(View.Managers)
            }}
            selected={bindings}
          />
        )}
        {view === View.InviteUser && (
          <InviteUser
            onGroupCreate={() => {
              setView(View.CreateGroup)
              setLastView(View.InviteUser)
            }}
            onInvite={() => {
              refetchClusters?.()
              setView(View.Managers)
              setGroups([])
            }}
            onBack={() => setView(View.Managers)}
            bindings={groups}
            refetch={setOnCreateGroup}
            serviceAccountId={serviceAccount.id}
          />
        )}
        {view === View.CreateGroup && (
          <CreateGroup
            onBack={() => setView(lastView)}
            onCreate={(group: Group) => {
              switch (lastView) {
                case View.Managers:
                  setBindings((bindings) => [...bindings, { group }])
                  break
                case View.InviteUser:
                  setGroups((groups) => [...groups, group])
              }

              setView(lastView)
              onCreateGroup?.()
            }}
          />
        )}
      </Flex>
    </Modal>
  )
}
