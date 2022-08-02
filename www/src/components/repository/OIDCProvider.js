import {
  useCallback, useContext, useEffect, useRef, useState,
} from 'react'
import { Box } from 'grommet'
import { useMutation } from '@apollo/client'
import { Button, Flex, P } from 'honorable'
import {
  CheckIcon, ContentCard, FormField, Input, PageTitle, Token,
} from 'pluralsh-design-system'
import { useNavigate, useParams } from 'react-router-dom'

import { CopyToClipboard } from 'react-copy-to-clipboard/src'

import isEqual from 'lodash/isEqual'

import { fetchGroups, fetchUsers } from '../accounts/Typeaheads'
import { GqlError } from '../utils/Alert'
import { deepUpdate, updateCache } from '../../utils/graphql'
import { REPO_Q } from '../repos/queries'
import { BindingInput } from '../account/Typeaheads'
import { sanitize } from '../account/utils'
import { CREATE_PROVIDER, UPDATE_PROVIDER } from '../oidc/queries'
import { AuthMethod } from '../oidc/types'
import RepositoryContext from '../../contexts/RepositoryContext'
import { SuccessToast } from '../utils/Toasts'
import usePrevious from '../../hooks/usePrevious'

function UrlsInput({ uriFormat = '', urls, setUrls }) {
  const [baseScheme, basePath] = ['https://', '/oauth2/callback']
  const [value, setValue] = useState('')
  const [scheme = baseScheme, path = basePath] = uriFormat.split('{domain}').filter(v => !!v)

  const addUrl = useCallback(() => {
    const url = uriFormat ? uriFormat.replace('{domain}', value) : value

    if (url === `${baseScheme}${basePath}`) {
      return
    }

    setUrls([...urls, url])
    setValue('')
  }, [urls, value, setValue, setUrls, uriFormat])

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
        >Add
        </Button>
      </Box>
      <Flex
        align="stretch"
        wrap="wrap"
      >
        {urls.map((url, i) => (
          // TODO: Update hue once design system change is merged
          <Token
            key={url}
            marginLeft={i === 0 ? null : 'xsmall'}
            onClose={() => setUrls(urls.filter(u => u !== url))}
          >
            {url}
          </Token>
        ))}
      </Flex>
    </Box>
  )
}

export function ProviderForm({
  attributes,
  setAttributes,
  bindings,
  setBindings,
  repository,
  onSave,
  loading,
}) {
  const settings = repository.oauthSettings || {}
  const [toast, setToast] = useState(null)
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

    if (!isEqual(attributes, prevAttributes) || !isEqual(bindings, prevBindings)) {
      setDirty(true)
    }
  }, [attributes, prevAttributes, bindings, prevBindings])

  useEffect(() => {
    if (prevLoading !== undefined && !loading && loading !== prevLoading) {
      setTimeout(() => setSaved(false), 5000)
    }
  }, [loading, prevLoading])

  return (
    <ContentCard innerProps={{ gap: 'large', display: 'flex', flexDirection: 'column' }}>
      <Flex gap={24}>
        <Flex
          gap={12}
          align="end"
        >
          <FormField label="Client ID">
            <Input
              disabled
              value={attributes.clientId}
              placeholder="Client ID"
              onChange={({ target: { value } }) => setAttributes({ ...attributes, ...{ clientId: value } })}
            />
          </FormField>
          <CopyToClipboard text={attributes.clientId}>
            <Button
              secondary
              marginBottom="xsmall"
              onClick={() => setToast('Client ID successfully copied.')}
            >Copy
            </Button>
          </CopyToClipboard>
        </Flex>
        <Flex
          gap={12}
          align="end"
        >
          <FormField label="Client secret">
            <Input
              disabled
              type="password"
              value={attributes.clientSecret}
              placeholder="Client secret"
              onChange={({ target: { value } }) => setAttributes({ ...attributes, ...{ clientSecret: value } })}
            />
          </FormField>
          <CopyToClipboard text={attributes.clientSecret}>
            <Button
              secondary
              marginBottom="xsmall"
              onClick={() => setToast('Client secret successfully copied.')}
            >Copy
            </Button>
          </CopyToClipboard>
        </Flex>
      </Flex>
      <BindingInput
        label="User bindings"
        placeholder="Search for user"
        bindings={bindings.filter(({ user }) => !!user).map(({ user: { email } }) => email)}
        fetcher={fetchUsers}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        label="Group bindings"
        placeholder="Search for group"
        bindings={bindings.filter(({ group }) => !!group).map(({ group: { name } }) => name)}
        fetcher={fetchGroups}
        add={group => setBindings([...bindings, { group }])}
        remove={name => setBindings(bindings.filter(({ group }) => !group || group.name !== name))}
      />
      <FormField
        label="Redirect urls"
      >
        <UrlsInput
          uriFormat={settings.uriFormat}
          urls={attributes.redirectUris}
          setUrls={redirectUris => setAttributes({ ...attributes, redirectUris })}
        />
      </FormField>
      <Flex
        align="center"
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
        >Save
        </Button>
        {dirty && (
          <P
            body2
            color="text-xlight"
          >Unsaved changes
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
        <SuccessToast onClose={() => setToast(null)}>{toast}</SuccessToast>
      )}
    </ContentCard>
  )
}

export function CreateProvider({
  installation,
}) {
  const settings = installation.repository.oauthSettings || {}
  const [attributes, setAttributes] = useState({
    redirectUris: [],
    authMethod: settings.authMethod || AuthMethod.POST,
  })
  const [bindings, setBindings] = useState([])
  const [mutation, { loading, error }] = useMutation(CREATE_PROVIDER, {
    variables: {
      id: installation.id,
      attributes: { ...attributes, bindings: bindings.map(sanitize) },
    },
    update: (cache, { data: { createOidcProvider } }) => updateCache(cache, {
      query: REPO_Q,
      variables: { repositoryId: installation.repository.id },
      update: prev => deepUpdate(prev, 'repository.installation.oidcProvider', () => createOidcProvider),
    }),
  })

  return (
    <Box fill>
      <PageTitle
        heading="OpenID Connect"
        paddingTop="medium"
      />
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
        onSave={mutation}
        loading={loading}
      />
    </Box>
  )
}

export function UpdateProvider({
  installation,
}) {
  const provider = installation.oidcProvider
  const [attributes, setAttributes] = useState({
    redirectUris: provider.redirectUris,
    authMethod: provider.authMethod,
    clientId: provider.clientId,
    clientSecret: provider.clientSecret,
  })
  const [bindings, setBindings] = useState(provider.bindings)
  const [mutation, { loading, error }] = useMutation(UPDATE_PROVIDER, {
    variables: {
      id: installation.id,
      attributes: { ...{ redirectUris: attributes.redirectUris, authMethod: attributes.authMethod }, bindings: bindings.map(sanitize) },
    },
  })

  return (
    <Box fill>
      <PageTitle
        heading="OpenID Connect"
        paddingTop="medium"
      />
      {error && (
        <GqlError
          error={error}
          header="Could not update provider"
        />
      )}
      <ProviderForm
        repository={installation.repository}
        attributes={attributes}
        setAttributes={setAttributes}
        bindings={bindings}
        setBindings={setBindings}
        onSave={mutation}
        loading={loading}
      />
    </Box>
  )
}

export function OIDCProvider() {
  const navigate = useNavigate()
  const { installation } = useContext(RepositoryContext)
  const { id } = useParams()

  useEffect(() => {
    if (!installation) navigate(-1)
  }, [id, installation, navigate])

  if (!installation) return null
  if (installation.oidcProvider) return <UpdateProvider installation={installation} />

  return <CreateProvider installation={installation} />
}
