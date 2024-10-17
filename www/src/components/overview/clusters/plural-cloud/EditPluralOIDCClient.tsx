import { Button, FormField, Input, Modal } from '@pluralsh/design-system'
import { InputMaybe, OidcProviderFragment } from 'generated/graphql'
import { useMemo, useState } from 'react'

import { useTheme } from 'styled-components'

import { isEmpty, uniqBy } from 'lodash'
import {
  BindingInput,
  fetchGroups,
  fetchUsers,
} from '../../../account/Typeaheads'
import sortBy from 'lodash/sortBy'
import { UrlsInput } from '../../../app/oidc/OIDC'

export function EditPluralOIDCClientModal({
  open,
  onClose,
  instanceName,
  oidcProvider,
  useModalOverlay = true,
}: {
  open: boolean
  onClose: () => void
  instanceName: string
  oidcProvider?: OidcProviderFragment
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
        provider={oidcProvider}
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
  const createMode = isEmpty(provider)
  const [name, setName] = useState(provider?.name ?? '')
  const [description, setDescription] = useState(provider?.name ?? '')
  const [bindings, setBindings] = useState<any>(provider?.bindings ?? [])
  const [redirectUris, setRedirectUris] = useState<InputMaybe<string>[]>(
    provider?.redirectUris ?? []
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
          <UrlsInput
            urls={redirectUris}
            setUrls={setRedirectUris}
          />
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
