import {
  Card,
  CheckIcon,
  Chip,
  Codeline,
  FormField,
  InfoOutlineIcon,
  Input,
  ListBoxFooter,
  PageTitle,
  PeoplePlusIcon,
  PersonPlusIcon,
  Toast,
  Tooltip,
} from '@pluralsh/design-system'
import { Box } from 'grommet'
import { Button, Div, Flex, P, Span } from 'honorable'
import isEqual from 'lodash/isEqual'
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppContext, useAppContext } from '../../../contexts/AppContext'
import usePrevious from '../../../hooks/usePrevious'
import { deepUpdate, updateCache } from '../../../utils/graphql'
import InviteUserModal from '../../account/invite/InviteUserModal'
import { BindingInput, fetchGroups, fetchUsers } from '../../account/Typeaheads'
import { sanitize } from '../../account/utils'
import { AuthMethod } from '../../oidc/types'
import { REPO_Q } from '../../repository/packages/queries'
import { GqlError } from '../../utils/Alert'
import CreateGroupModal from '../../utils/group/CreateGroupModal'
import ImpersonateServiceAccount from '../../utils/ImpersonateServiceAccount'
import { AppHeaderActions } from '../AppHeaderActions'
import {
  useCreateProviderMutation,
  useUpdateProviderMutation,
} from '../../../generated/graphql'

export function UrlsInput({ uriFormat = '', urls, setUrls }: any) {
  const [baseScheme, basePath] = ['https://', '/oauth2/callback']
  const [value, setValue] = useState('')
  const [scheme = baseScheme, path = basePath] = uriFormat
    .split('{domain}')
    .filter((v) => !!v)

  const addUrl = useCallback(() => {
    const url = uriFormat ? uriFormat.replace('{domain}', value) : value

    if (url === `${baseScheme}${basePath}`) {
      return
    }

    if (urls.indexOf(url) > -1) {
      return
    }

    setUrls([...urls, url])
    setValue('')
  }, [urls, value, setValue, setUrls, uriFormat, basePath, baseScheme])

  const removeUrl = useCallback(
    (url) => setUrls(urls.filter((item) => item !== url)),
    [setUrls, urls]
  )

  return (
    <Box
      gap="small"
      fill="horizontal"
    >
      <Box
        flex={false}
        fill="horizontal"
        direction="row"
        align="center"
      >
        <Input
          value={value}
          prefix={scheme}
          suffix={path}
          width="100%"
          borderRadius="normal"
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
      </Box>
      <Flex
        align="stretch"
        wrap="wrap"
        gap="xxsmall"
      >
        {urls.map((url, i) => (
          <Chip
            key={i}
            size="small"
            hue="lighter"
            clickable
            closeButton
            onClick={() => removeUrl(url)}
          >
            {url}
          </Chip>
        ))}
      </Flex>
    </Box>
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
      display="flex"
      flexDirection="column"
      gap="large"
      padding="xlarge"
    >
      <Flex
        gap="medium"
        width="100%"
      >
        <FormField
          label="Client ID"
          width="calc(66.666% - 16px)"
        >
          <Codeline>{attributes.clientId}</Codeline>
        </FormField>
        <FormField
          label="Client secret"
          width="33.333%"
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
              <Span color="text-primary-disabled">{invite.email}</Span>
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
              <Span color="action-link-inline">Invite new user</Span>
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
              <Span color="action-link-inline">Create new group</Span>
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
        {dirty && (
          <P
            body2
            color="text-xlight"
          >
            Unsaved changes
          </P>
        )}
        {!dirty && !loading && saved && (
          <Flex
            gap="xsmall"
            color="text-xlight"
          >
            <P body2>Saved</P>
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

export function CreateProvider({ installation }: any) {
  const settings = installation.repository.oauthSettings || {}
  const [attributes, setAttributes] = useState({
    redirectUris: [],
    authMethod: settings.authMethod || AuthMethod.POST,
  })
  const [bindings, setBindings] = useState([])
  const [mutation, { loading, error }] = useCreateProviderMutation({
    variables: {
      id: installation.id,
      attributes: { ...attributes, bindings: bindings.map(sanitize) },
    },
    update: (cache, { data }) =>
      updateCache(cache, {
        query: REPO_Q,
        variables: { repositoryId: installation.repository.id },
        update: (prev) =>
          deepUpdate(
            prev,
            'repository.installation.oidcProvider',
            () => data?.createOidcProvider
          ),
      }),
  })

  return (
    <Div paddingBottom="large">
      <PageTitle
        heading="OpenID connect users"
        paddingTop="medium"
      >
        <AppHeaderActions />
      </PageTitle>
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
    </Div>
  )
}

enum ModalSelection {
  None,
  InviteUser,
  CreateGroup,
}

export function UpdateProvider({ installation }: any) {
  const { refetch } = useContext(AppContext)

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
      id: installation.id,
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
    <Div paddingBottom="large">
      <PageTitle
        heading="OpenID connect users"
        paddingTop="medium"
      >
        <AppHeaderActions />
      </PageTitle>
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
    </Div>
  )
}

export function OIDC() {
  const navigate = useNavigate()
  const { installation } = useAppContext()
  const { appName: name } = useParams()

  useEffect(() => {
    if (!installation) navigate(-1)
  }, [name, installation, navigate])

  if (!installation) return null
  if (installation.oidcProvider)
    return <UpdateProvider installation={installation} />

  return <CreateProvider installation={installation} />
}
