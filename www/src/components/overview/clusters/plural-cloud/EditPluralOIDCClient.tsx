import { Button, Chip, FormField, Input, Modal } from '@pluralsh/design-system'
import { InputMaybe, OidcProviderFragment } from 'generated/graphql'
import { useCallback, useState } from 'react'
import { useTheme } from 'styled-components'
import {
  BindingInput,
  fetchGroups,
  fetchUsers,
} from '../../../account/Typeaheads'

export function EditPluralOIDCClientModal({
  open,
  onClose,
  instanceName,
  provider,
  useModalOverlay = true,
}: {
  open: boolean
  onClose: () => void
  instanceName: string
  provider?: OidcProviderFragment
  useModalOverlay?: boolean
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      overlayStyles={{ background: useModalOverlay ? undefined : 'none' }}
      header={`${instanceName} - Edit Plural OIDC clients`}
      size="large"
    >
      <EditPluralOIDCClient
        onClose={onClose}
        provider={provider}
      />
    </Modal>
  )
}

function EditPluralOIDCClient({
  onClose,
  provider,
}: {
  onClose: () => void
  provider?: OidcProviderFragment
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

  const addUrl = useCallback(() => {
    if (redirectUris.indexOf(url) > -1) return

    setRedirectUris([...redirectUris, url])
    setUrl('')
  }, [url, setUrl, redirectUris, setRedirectUris])

  const removeUrl = useCallback(
    (url) => setRedirectUris(redirectUris.filter((item) => item !== url)),
    [redirectUris, setRedirectUris]
  )

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
            .map(({ group }) => group?.name)}
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
            <div
              css={{
                display: 'flex',
              }}
            >
              <Input
                value={url}
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
      <div css={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          secondary
          onClick={onClose}
        >
          Back to Plural OIDC clients
        </Button>
        <Button
          secondary
          onClick={onClose}
        >
          {createMode ? 'Create' : 'Save'}
        </Button>
      </div>
    </div>
  )
}
