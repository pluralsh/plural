import { useMutation, useQuery } from '@apollo/client'
import {
  AppIcon,
  Button,
  CaretLeftIcon,
  FormField,
  Input,
  ListBoxFooter,
  ListBoxItem,
  Modal,
  PlusIcon,
  Select,
} from '@pluralsh/design-system'
import {
  Key,
  ReactElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ClustersContext from '../../contexts/ClustersContext'
import { useCurrentUser } from '../../contexts/CurrentUserContext'
import subscriptionContext from '../../contexts/SubscriptionContext'
import {
  Cluster,
  RootMutationType,
  RootMutationTypeCreateServiceAccountArgs,
  RootQueryType,
  RootQueryTypeUsersArgs,
  User,
} from '../../generated/graphql'
import { CREATE_SERVICE_ACCOUNT, USERS_Q } from '../account/queries'
import UpgradeNeededModal from '../cluster/UpgradeNeededModal'
import { GqlError } from '../utils/Alert'
import LoadingIndicator from '../utils/LoadingIndicator'

const toUserList = (connection: Pick<RootQueryType, 'users'>): Array<User> =>
  connection?.users?.edges?.map((u) => u!.node!) ?? []

function useGetUsersWithoutCluster(clusters: Array<Cluster>) {
  const {
    data,
    fetchMore,
    refetch: refetchUsers,
  } = useQuery<Pick<RootQueryType, 'users'>, RootQueryTypeUsersArgs>(USERS_Q, {
    fetchPolicy: 'network-only',
    variables: { serviceAccount: true },
  })
  const [users, setUsers] = useState<Array<User>>([])
  const [loaded, setLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  const ownerSet = useMemo(
    () => new Set<string>(clusters.map((c) => c.owner?.id ?? '')),
    [clusters]
  )

  const refetch = useCallback(
    (onComplete: () => void) => {
      refetchUsers().then(() => {
        setUsers([])
        setLoading(false)
        setLoaded(false)
        onComplete()
      })
    },
    [refetchUsers]
  )

  const reset = useCallback(() => {
    setUsers([])
    setLoading(false)
    setLoaded(false)
  }, [])

  useEffect(() => {
    if (!data || loaded || loading) return

    setLoading(true)
    const fetch = async () => {
      let hasNextPage = data?.users?.pageInfo.hasNextPage ?? false
      let cursor = data?.users?.pageInfo.endCursor

      setUsers(toUserList(data))
      while (hasNextPage) {
        const { data: connection } = await fetchMore({
          variables: { serviceAccount: true, cursor },
        })

        hasNextPage = connection?.users?.pageInfo.hasNextPage ?? false
        cursor = connection?.users?.pageInfo.endCursor
        setUsers((users) => [...users, ...toUserList(connection)])
      }

      setUsers((users) =>
        users.filter((u) => !ownerSet.has(u.id) && !u.hasInstallations)
      )
      setLoaded(true)
      setLoading(false)
    }

    fetch()
  }, [data, fetchMore, loaded, loading, ownerSet])

  return { users, loaded, refetch, reset }
}

const Wrap = styled.div((_) => ({
  display: 'flex',
  flexDirection: 'column',
}))

const Message = styled.div(({ theme }) => ({
  ...theme.partials.text.body2,
  marginBottom: theme.spacing.large,
}))

const Header = styled.div(({ theme }) => ({
  ...theme.partials.text.overline,
  display: 'flex',
}))

const ActionContainer = styled.div((_) => ({
  display: 'flex',
  justifyContent: 'space-between',
}))

const Spacer = styled.div(({ theme }) => ({
  marginTop: theme.spacing.large,
}))

const CreateNewServiceAccountButton = styled(
  CreateNewServiceAccountButtonUnstyled
)(({ theme }) => ({
  ...theme.partials.text.body2,
  color: theme.colors['text-primary-accent'],
}))

function CreateNewServiceAccountButtonUnstyled({ onClick, ...props }) {
  return (
    <ListBoxFooter
      onClick={onClick}
      leftContent={
        <PlusIcon
          color="text-primary-accent"
          size={16}
        />
      }
      {...props}
    >
      Create new Service Account
    </ListBoxFooter>
  )
}

enum UserSelectionMode {
  Select,
  Input,
}

function ClusterOwnerSelect({
  setMode,
  items,
  selectedKey,
  setSelectedKey,
  onClose,
}): ReactElement {
  const navigate = useNavigate()
  const me = useCurrentUser()
  const [selectOpen, setSelectOpen] = useState(false)

  return (
    <>
      <Message>
        Choose an owner for the cluster. Only users without existing cluster are
        available for selection.
      </Message>
      <FormField
        label="Cluster owner"
        marginBottom="large"
      >
        <Select
          label="Select owner"
          isOpen={selectOpen}
          onOpenChange={(open) => setSelectOpen(open)}
          selectedKey={selectedKey}
          onSelectionChange={(key) => setSelectedKey(key as Key)}
          dropdownFooterFixed={
            <CreateNewServiceAccountButton
              onClick={() => setMode(UserSelectionMode.Input)}
            />
          }
        >
          {items.map(({ id, name, email, avatar }) => (
            <ListBoxItem
              key={id}
              label={name}
              textValue={`${name} - ${email}`}
              description={email}
              leftContent={
                <AppIcon
                  spacing={avatar ? 'none' : undefined}
                  hue="lightest"
                  size="xsmall"
                  name={name}
                  url={avatar ?? undefined}
                />
              }
            />
          ))}
        </Select>
      </FormField>
      <ActionContainer>
        <Button
          secondary
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          alignSelf="flex-end"
          disabled={!selectedKey}
          onClick={() =>
            navigate(
              `/shell${me.id !== selectedKey ? `?user=${selectedKey}` : ''}`
            )
          }
        >
          Create cluster
        </Button>
      </ActionContainer>
    </>
  )
}

function ClusterOwnerInput({
  setMode,
  showBackButton,
  refetch,
  setSelectedKey,
  onClose,
}): ReactElement {
  const me = useCurrentUser()
  const [name, setName] = useState<string>()
  const [mutation, { loading, error }] = useMutation<
    Pick<RootMutationType, 'createServiceAccount'>,
    RootMutationTypeCreateServiceAccountArgs
  >(CREATE_SERVICE_ACCOUNT, {
    variables: {
      attributes: {
        name,
        impersonationPolicy: { bindings: [{ userId: me.id }] },
      },
    },
    onCompleted: (result) =>
      refetch(() => {
        setMode(UserSelectionMode.Select)
        setSelectedKey(result.createServiceAccount?.id)
      }),
  })

  return (
    <>
      {error && (
        <>
          <GqlError error={error} />
          <Spacer />
        </>
      )}
      <Message>
        Create a new service account that will become an owner of the cluster.
      </Message>
      <FormField
        label="Service Account"
        marginBottom="large"
      >
        <Input
          value={name}
          onChange={({ target: { value } }) => setName(value)}
          placeholder="Name"
        />
      </FormField>
      {showBackButton ? (
        <ActionContainer>
          <Button
            secondary
            onClick={() => setMode(UserSelectionMode.Select)}
            disabled={loading}
          >
            <CaretLeftIcon marginRight="small" />
            Back
          </Button>
          <Button
            alignSelf="flex-end"
            onClick={mutation}
            loading={loading}
            disabled={loading}
          >
            Create
          </Button>
        </ActionContainer>
      ) : (
        <ActionContainer>
          <Button
            secondary
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            alignSelf="flex-end"
            onClick={mutation}
            loading={loading}
            disabled={loading}
          >
            Create
          </Button>
        </ActionContainer>
      )}
    </>
  )
}

function CreateClusterModal({ open, onClose }): ReactElement {
  const { isPaidPlan, isTrialPlan } = useContext(subscriptionContext)
  const [mode, setMode] = useState<UserSelectionMode>(UserSelectionMode.Select)
  const me = useCurrentUser()
  const { clusters } = useContext(ClustersContext)
  const { users, loaded, refetch, reset } = useGetUsersWithoutCluster(clusters)

  const hasCluster = useMemo(
    () => clusters.some((c) => c.owner?.id === me.id),
    [clusters, me.id]
  )

  const items = useMemo(
    () => [...(hasCluster ? [...users] : [...users, me])],
    [hasCluster, me, users]
  )

  const [selectedKey, setSelectedKey] = useState<Key | undefined>(
    hasCluster ? undefined : me.id
  )

  useEffect(
    () =>
      setMode(
        items.length === 0 ? UserSelectionMode.Input : UserSelectionMode.Select
      ),
    [items.length]
  )

  if (!(isPaidPlan || isTrialPlan))
    return (
      <UpgradeNeededModal
        open={open}
        onClose={onClose}
      />
    )

  return (
    <Modal
      BackdropProps={{ zIndex: 20 }}
      header={<Header>Create cluster</Header>}
      open={open}
      onClose={() => {
        reset()
        onClose()
      }}
      style={{ padding: 0 }}
    >
      {!loaded ? (
        <LoadingIndicator />
      ) : (
        <Wrap>
          {mode === UserSelectionMode.Select ? (
            <ClusterOwnerSelect
              setMode={setMode}
              items={items}
              selectedKey={selectedKey}
              setSelectedKey={setSelectedKey}
              onClose={onClose}
            />
          ) : (
            <ClusterOwnerInput
              setMode={setMode}
              showBackButton={items.length > 0}
              refetch={refetch}
              setSelectedKey={setSelectedKey}
              onClose={onClose}
            />
          )}
        </Wrap>
      )}
    </Modal>
  )
}

export default CreateClusterModal
