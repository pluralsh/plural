import { Button, Chip, FormField, Input, Modal } from '@pluralsh/design-system'
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
  insideModal = false,
  refetch,
}: {
  open: boolean
  onClose: () => void
  instanceName: string
  provider?: OidcProviderFragment
  insideModal?: boolean
  refetch: () => void
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      overlayStyles={{ background: insideModal ? 'none' : undefined }}
      header={`${instanceName} - Edit Plural OIDC clients`}
      size="large"
    >
      <EditPluralOIDCClient
        onClose={onClose}
        provider={provider}
        refetch={refetch}
      />
    </Modal>
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
  provider,
  refetch,
}: {
  onClose: () => void
  provider?: OidcProviderFragment
  refetch: () => void
}) {
  const theme = useTheme()
  const [name, setName] = useState(provider?.name ?? '')
  const [description, setDescription] = useState(provider?.description ?? '')
  const [bindings, setBindings] = useState<any>(provider?.bindings ?? [])
  const [url, setUrl] = useState('')
  const [redirectUris, setRedirectUris] = useState<InputMaybe<string>[]>(
    provider?.redirectUris ?? []
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

  const m = useMemo(
    () => (!provider ? useCreateProviderMutation : useUpdateProviderMutation),
    [provider]
  )

  const attributes: OidcAttributes = useMemo(
    () => ({
      name,
      bindings: bindingsToBindingAttributes(bindings),
      redirectUris,
      authMethod: OidcAuthMethod.Basic, // TODO
      description,
    }),
    [name, description, bindings, description]
  )

  const onCompleted = useCallback(() => {
    // TODO: How to show client ID and client secret?
    onClose()
    refetch()
  }, [onClose, refetch])

  const [mutation, { loading, error }] = m({
    variables: { id: provider?.id, attributes },
    onCompleted,
  })

  return (
    <div
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.xlarge,
      }}
    >
      <div
        css={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.small,
        }}
      >
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
      </div>
      {error && (
        <GqlError
          error={error}
          header={`${
            !provider ? 'Create' : 'Edit'
          } OIDC provider request failed`}
        />
      )}
      <div css={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          secondary
          onClick={onClose}
        >
          Back to Plural OIDC clients
        </Button>
        <Button
          secondary
          loading={loading}
          onClick={mutation}
        >
          {!provider ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
