import {
  Button,
  Chip,
  Codeline,
  Divider,
  FormField,
  Input,
  ListBoxItem,
  Modal,
  Select,
  Banner,
} from '@pluralsh/design-system'
import {
  InputMaybe,
  OidcAttributes,
  OidcAuthMethod,
  OidcProviderFragment,
  PolicyBinding,
  useCreateProviderMutation,
  useUpdateProviderMutation,
} from 'generated/graphql'
import { useCallback, useMemo, useState } from 'react'
import { useTheme } from 'styled-components'
import {
  BindingInput,
  fetchGroups,
  fetchUsers,
} from '../../../account/Typeaheads'
import { GqlError } from '../../../utils/Alert'

const urlPrefix = 'https://'
const urlSuffix = '/oauth2/callback'

export function EditPluralOIDCClientModal({
  open,
  onClose,
  instanceName,
  provider,
  refetch,
}: {
  open: boolean
  onClose: () => void
  instanceName: string
  provider?: OidcProviderFragment
  refetch: () => void
}) {
  const theme = useTheme()
  const [editToastVisible, setEditToastVisible] = useState(false)
  const [createToastVisible, setCreateToastVisible] = useState(false)

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        header={`${instanceName} - Edit Plural OIDC clients`}
        size="large"
      >
        <EditPluralOIDCClient
          onClose={onClose}
          onCreate={() => {
            setCreateToastVisible(true)
            setTimeout(() => setCreateToastVisible(false), 3000)
          }}
          onEdit={() => {
            setEditToastVisible(true)
            setTimeout(() => setEditToastVisible(false), 3000)
          }}
          provider={provider}
          refetch={refetch}
        />
      </Modal>
      {createToastVisible && (
        <Banner
          heading={'OIDC client successfully created.'}
          severity="success"
          position={'fixed'}
          bottom={theme.spacing.large}
          left={'50%'}
          transform={'translate(-50%, 0)'}
          zIndex={theme.zIndexes.tooltip}
        >
          The Client ID and Client secret have been generated.
        </Banner>
      )}
      {editToastVisible && (
        <Banner
          severity="success"
          position={'fixed'}
          bottom={theme.spacing.large}
          left={'50%'}
          transform={'translate(-50%, 0)'}
          zIndex={theme.zIndexes.tooltip}
        >
          OIDC client successfully saved.
        </Banner>
      )}
    </>
  )
}

export const bindingsToBindingAttributes = (
  bindings: Nullable<PolicyBinding>[]
) =>
  bindings?.map((binding) => {
    if (binding?.group?.id) return { groupId: binding.group.id }
    if (binding?.user?.id) return { userId: binding.user.id }

    return null
  })

function EditPluralOIDCClient({
  onClose,
  onCreate,
  onEdit,
  provider,
  refetch,
}: {
  onClose: () => void
  onCreate: () => void
  onEdit: () => void
  provider?: OidcProviderFragment
  refetch: () => void
}) {
  const theme = useTheme()
  const createMode = !provider
  const [name, setName] = useState(provider?.name ?? '')
  const [description, setDescription] = useState(provider?.description ?? '')
  const [bindings, setBindings] = useState<any>(provider?.bindings ?? [])
  const [url, setUrl] = useState('')
  const [redirectUris, setRedirectUris] = useState<InputMaybe<string>[]>(
    provider?.redirectUris ?? []
  )
  const [authMethod, setAuthMethod] = useState<OidcAuthMethod>(
    provider?.authMethod ?? OidcAuthMethod.Basic
  )

  const addUrl = useCallback(() => {
    const u = `${urlPrefix}${url}${urlSuffix}`

    if (redirectUris.includes(u)) return

    setRedirectUris([...redirectUris, u])
    setUrl('')
  }, [url, setUrl, redirectUris, setRedirectUris])

  const removeUrl = useCallback(
    (url) => setRedirectUris(redirectUris.filter((item) => item !== url)),
    [redirectUris, setRedirectUris]
  )

  const attributes: OidcAttributes = useMemo(
    () => ({
      name,
      bindings: bindingsToBindingAttributes(bindings),
      redirectUris,
      authMethod,
      description,
    }),
    [name, description, authMethod, bindings, description]
  )

  const onCompleted = useCallback(() => {
    refetch()

    if (createMode) {
      onCreate()
    } else {
      onEdit()
      onClose()
    }
  }, [onClose, refetch])

  const [create, { data, loading: creating, error: createError }] =
    useCreateProviderMutation({
      variables: { attributes },
      onCompleted,
    })

  const [update, { loading: updating, error: updateError }] =
    useUpdateProviderMutation({
      variables: { id: provider?.id, attributes },
      onCompleted,
    })

  const clientId = provider?.clientId ?? data?.createOidcProvider?.clientId
  const clientSecret =
    provider?.clientSecret ?? data?.createOidcProvider?.clientSecret

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xlarge,
        overflow: 'hidden',
      }}
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.small,
          overflow: 'auto',
        }}
      >
        <FormField label="Client ID">
          <Codeline
            displayText={
              clientId ?? 'A client ID will be generated upon creation'
            }
          >
            {clientId}
          </Codeline>
        </FormField>
        <FormField label="Client secret">
          <Codeline
            displayText={
              clientSecret
                ? '•••••••••••••••••••••'
                : 'A client secret will be generated upon creation'
            }
          >
            {clientSecret}
          </Codeline>
        </FormField>
        {!data && (
          <>
            <Divider
              backgroundColor="border-fill-two"
              marginTop="medium"
              marginBottom="medium"
            />
            <FormField
              label="Name"
              required
            >
              <Input
                autoFocus
                value={name}
                onChange={({ target: { value } }) => setName(value)}
              />
            </FormField>
            <FormField label="Description">
              <Input
                value={description}
                onChange={({ target: { value } }) => setDescription(value)}
              />
            </FormField>
            <BindingInput
              label="User bindings"
              placeholder="Search for user"
              bindings={bindings
                .filter(({ user }) => !!user)
                .map(({ user }) => user?.email)}
              fetcher={fetchUsers}
              add={(user) => setBindings([...bindings, { user }])}
              remove={(email) =>
                setBindings(
                  bindings.filter(({ user }) => !user || user.email !== email)
                )
              }
            />
            <BindingInput
              label="Group bindings"
              placeholder="Search for group"
              bindings={bindings
                .filter(({ group }) => !!group)
                .map(({ group: { name } }) => name)}
              fetcher={fetchGroups}
              add={(group) => setBindings([...bindings, { group }])}
              remove={(name) =>
                setBindings(
                  bindings.filter(({ group }) => !group || group.name !== name)
                )
              }
            />
            <FormField
              label="Auth method"
              required
            >
              <Select
                selectedKey={authMethod}
                onSelectionChange={(v) => setAuthMethod(v as OidcAuthMethod)}
              >
                <ListBoxItem
                  key={OidcAuthMethod.Basic}
                  label={'Basic'}
                  textValue={OidcAuthMethod.Basic}
                />
                <ListBoxItem
                  key={OidcAuthMethod.Post}
                  label={'Post'}
                  textValue={OidcAuthMethod.Post}
                />
              </Select>
            </FormField>
            <FormField label="Redirect URIs">
              <div
                css={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.small,
                }}
              >
                <div css={{ display: 'flex' }}>
                  <Input
                    value={url}
                    prefix={urlPrefix}
                    suffix={urlSuffix}
                    width="100%"
                    placeholder="Enter a redirect URI"
                    onChange={({ target: { value } }) => setUrl(value)}
                  />
                  <Button
                    onClick={addUrl}
                    secondary
                    marginLeft="small"
                  >
                    Add
                  </Button>
                </div>
                <div
                  css={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: theme.spacing.xxsmall,
                  }}
                >
                  {redirectUris.map((url, i) => (
                    <Chip
                      key={i}
                      size="small"
                      clickable
                      closeButton
                      onClick={() => removeUrl(url)}
                    >
                      {url}
                    </Chip>
                  ))}
                </div>
              </div>
            </FormField>
          </>
        )}
      </div>
      {createError && (
        <GqlError
          error={createError}
          header={'Create OIDC provider request failed'}
        />
      )}
      {updateError && (
        <GqlError
          error={updateError}
          header={'Update OIDC provider request failed'}
        />
      )}
      <div
        css={{
          display: 'flex',
          justifyContent: 'end',
          gap: theme.spacing.small,
        }}
      >
        {!data ? (
          <>
            <Button
              secondary
              onClick={onClose}
            >
              Back to Plural OIDC clients
            </Button>
            <div css={{ flexGrow: 1 }} />
            <Button
              disabled={!name || !authMethod}
              loading={creating || updating}
              onClick={() => (createMode ? create() : update())}
            >
              {createMode ? 'Create' : 'Save'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )}
      </div>
    </div>
  )
}
