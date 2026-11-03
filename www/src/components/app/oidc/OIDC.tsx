import {
  Button,
  Card,
  CheckIcon,
  Chip,
  Codeline,
  Flex,
  FormField,
  InfoOutlineIcon,
  Input,
  ListBoxFooter,
  PeoplePlusIcon,
  PersonPlusIcon,
  Toast,
  Tooltip,
} from '@pluralsh/design-system'
import isEqual from 'lodash/isEqual'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from 'styled-components'

import usePrevious from '../../../hooks/usePrevious'
import InviteUserModal from '../../account/invite/InviteUserModal'
import { BindingInput, fetchGroups, fetchUsers } from '../../account/Typeaheads'
import { sanitize } from '../../account/utils'
import { AuthMethod } from '../../oidc/types'
import { GqlError } from '../../utils/Alert'
import { Body2P, SpanSC } from '../../utils/Typography'
import CreateGroupModal from '../../utils/group/CreateGroupModal'
import ImpersonateServiceAccount from '../../utils/ImpersonateServiceAccount'
import {
  useCreateProviderMutation,
  useUpdateProviderMutation,
} from '../../../generated/graphql'

export function UrlsInput({ uriFormat = '', urls, setUrls }: any) {
  const [baseScheme, basePath] = ['https://', '/oauth/callback']
  const [value, setValue] = useState('')
  console.log('uriFormat', uriFormat)
  const [scheme, path] = uriFormat.split('{domain}').filter((v) => !!v)

  const addUrl = useCallback(() => {
    let url: string
    const trimmed = value.trim()

    if (trimmed.length === 0) {
      return
    }

    // Check if uriFormat is valid and contains {domain}
    if (uriFormat && uriFormat.includes('{domain}')) {
      url = uriFormat.replace('{domain}', trimmed)
    } else {
      url = trimmed
    }

    if (urls.indexOf(url) > -1) {
      return
    }

    setUrls([...urls, url])
    setValue('')
  }, [
    urls,
    value,
    setValue,
    setUrls,
    uriFormat,
    basePath,
    baseScheme,
    scheme,
    path,
  ])

  const removeUrl = useCallback(
    (url) => setUrls(urls.filter((item) => item !== url)),
    [setUrls, urls]
  )

  return (
    <Flex
      direction="column"
      gap="small"
      width="100%"
    >
      <Flex
        flexShrink={0}
        width="100%"
        align="center"
      >
        <Input
          value={value}
          prefix={scheme}
          suffix={path}
          width="100%"
          placeholder={uriFormat ? 'Enter a domain' : 'Enter a redirect url'}
          onChange={({ target: { value } }) => setValue(value)}
        />
        <Button
          onClick={addUrl}
          secondary
          marginLeft="small"
        >
          Add
        </Button>
      </Flex>
      <Flex
        align="stretch"
        wrap="wrap"
        gap="xxsmall"
      >
        {urls.map((url, i) => (
          <Chip
            key={i}
            size="small"
            fillLevel={2}
            clickable
            closeButton
            onClick={() => removeUrl(url)}
          >
            {url}
          </Chip>
        ))}
      </Flex>
    </Flex>
  )
}

export function ProviderForm({
  provider,
  attributes,
  setAttributes,
  bindings,
  setBindings,
  repository,
  onSave,
  onInvite,
  onCreateGroup,
  loading,
}: any) {
  const theme = useTheme()
  const settings = repository.oauthSettings || {}
  const [toast, setToast] = useState<any>(null)
  const [dirty, setDirty] = useState(false)
  const [saved, setSaved] = useState(false)
  const isMountRef = useRef(true)
  const prevAttributes = usePrevious(attributes)
  const prevBindings = usePrevious(bindings)
  const prevLoading = usePrevious(loading)

  useEffect(() => {
    if (isMountRef.current) {
      isMountRef.current = false

      return
    }

    if (
      !isEqual(attributes, prevAttributes) ||
      !isEqual(bindings, prevBindings)
    ) {
      setDirty(true)
    }
  }, [attributes, prevAttributes, bindings, prevBindings, isMountRef])

  useEffect(() => {
    if (prevLoading !== undefined && !loading && loading !== prevLoading) {
      setTimeout(() => setSaved(false), 5000)
    }
  }, [loading, prevLoading])

  return (
    <Card
      maxHeight="100%"
      overflowY="auto"
      css={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.large,
        padding: theme.spacing.xlarge,
      }}
    >
      <Flex
        gap="medium"
        width="100%"
      >
        <FormField
          label="Client ID"
          style={{ width: 'calc(66.666% - 16px)' }}
        >
          <Codeline>{attributes.clientId}</Codeline>
        </FormField>
        <FormField
          label="Client secret"
          style={{ width: '33.333%' }}
        >
          <Codeline displayText="••••••••••">
            {attributes.clientSecret}
          </Codeline>
        </FormField>
      </Flex>
      <BindingInput
        label="User bindings"
        placeholder="Search for user"
        bindings={bindings
          .filter(({ user }) => !!user)
          .map(({ user: { email } }) => email)}
        customBindings={provider?.invites?.map((invite) => (
          <Tooltip label="Pending invitation">
            <Chip
              fillLevel={2}
              size="small"
              icon={<InfoOutlineIcon color="icon-xlight" />}
            >
              <SpanSC $color="text-primary-disabled">{invite.email}</SpanSC>
            </Chip>
          </Tooltip>
        ))}
        fetcher={fetchUsers}
        add={(user) => setBindings([...bindings, { user }])}
        remove={(email) =>
          setBindings(
            bindings.filter(({ user }) => !user || user.email !== email)
          )
        }
        dropdownFooterFixed={
          provider?.id && (
            <ListBoxFooter
              onClick={onInvite}
              leftContent={<PersonPlusIcon color="icon-info" />}
            >
              <SpanSC $color="action-link-inline">Invite new user</SpanSC>
            </ListBoxFooter>
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
        dropdownFooterFixed={
          provider?.id && (
            <ListBoxFooter
              onClick={onCreateGroup}
              leftContent={<PeoplePlusIcon color="icon-info" />}
            >
              <SpanSC $color="action-link-inline">Create new group</SpanSC>
            </ListBoxFooter>
          )
        }
      />
      <FormField label="Redirect urls">
        <UrlsInput
          uriFormat={settings.uriFormat}
          urls={attributes.redirectUris}
          setUrls={(redirectUris) =>
            setAttributes({ ...attributes, redirectUris })
          }
        />
      </FormField>
      <Flex
        align="center"
        justify="flex-end"
        gap="medium"
      >
        <Button
          primary
          disabled={!dirty}
          onClick={() => {
            onSave()
            setDirty(false)
            setSaved(true)
          }}
          loading={loading}
        >
          Save
        </Button>
        {dirty && <Body2P $color="text-xlight">Unsaved changes</Body2P>}
        {!dirty && !loading && saved && (
          <Flex
            gap="xsmall"
            color={theme.colors['text-xlight']}
          >
            <Body2P>Saved</Body2P>
            <CheckIcon size={12} />
          </Flex>
        )}
      </Flex>
      {toast && (
        <Toast
          severity="success"
          marginBottom="medium"
          marginRight="xxxxlarge"
          onClose={() => setToast(null)}
        >
          {toast}
        </Toast>
      )}
    </Card>
  )
}

export function CreateProvider({
  installation,
  refetch,
}: {
  installation: any
  refetch?: () => void
}) {
  const settings = installation.repository.oauthSettings || {}
  const [attributes, setAttributes] = useState({
    redirectUris: [],
    authMethod: settings.authMethod || AuthMethod.POST,
  })
  const [bindings, setBindings] = useState([])
  const [mutation, { loading, error }] = useCreateProviderMutation({
    variables: {
      installationId: installation.id,
      attributes: { ...attributes, bindings: bindings.map(sanitize) },
    },
    onCompleted: () => refetch?.(),
  })

  return (
    <>
      {error && (
        <GqlError
          error={error}
          header="Could not create provider"
        />
      )}
      <ProviderForm
        repository={installation.repository}
        attributes={attributes}
        setAttributes={setAttributes}
        bindings={bindings}
        setBindings={setBindings}
        onSave={() => mutation()}
        loading={loading}
      />
    </>
  )
}

enum ModalSelection {
  None,
  InviteUser,
  CreateGroup,
}

export function UpdateProvider({
  installation,
  refetch,
}: {
  installation: any
  refetch?: () => void
}) {
  const provider = useMemo(
    () => installation.oidcProvider,
    [installation.oidcProvider]
  )

  const [attributes, setAttributes] = useState({
    redirectUris: provider.redirectUris,
    authMethod: provider.authMethod,
    clientId: provider.clientId,
    clientSecret: provider.clientSecret,
  })
  const [bindings, setBindings] = useState(provider.bindings)
  const [selectedModal, setSelectedModal] = useState<ModalSelection>(
    ModalSelection.None
  )

  const [mutation, { loading, error }] = useUpdateProviderMutation({
    variables: {
      installationId: installation.id,
      attributes: {
        ...{
          redirectUris: attributes.redirectUris,
          authMethod: attributes.authMethod,
        },
        bindings: bindings.map(sanitize),
      },
    },
  })

  return (
    <>
      {error && (
        <GqlError
          error={error}
          header="Could not update provider"
        />
      )}
      <ProviderForm
        provider={provider}
        repository={installation.repository}
        attributes={attributes}
        setAttributes={setAttributes}
        bindings={bindings}
        setBindings={setBindings}
        onSave={() => mutation()}
        loading={loading}
        onInvite={() => setSelectedModal(ModalSelection.InviteUser)}
        onCreateGroup={() => setSelectedModal(ModalSelection.CreateGroup)}
      />
      <ImpersonateServiceAccount skip>
        <>
          {selectedModal === ModalSelection.InviteUser && (
            <InviteUserModal
              onClose={() => setSelectedModal(ModalSelection.None)}
              onInvite={() => {
                refetch?.()
                setSelectedModal(ModalSelection.None)
              }}
              oidcProviderId={provider?.id}
            />
          )}
          {selectedModal === ModalSelection.CreateGroup && (
            <CreateGroupModal
              onClose={() => setSelectedModal(ModalSelection.None)}
              onCreate={(group) => {
                setBindings((bindings) => [...bindings, { group }])
                setSelectedModal(ModalSelection.None)
              }}
            />
          )}
        </>
      </ImpersonateServiceAccount>
    </>
  )
}
