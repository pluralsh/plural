import {
  useCallback, useContext, useEffect, useState,
} from 'react'
import { Box } from 'grommet'
import { useMutation } from '@apollo/client'
import { Button, Div, Flex } from 'honorable'
import { FormField, Input, Token } from 'pluralsh-design-system'
import { useNavigate, useParams } from 'react-router-dom'

import { fetchGroups, fetchUsers } from '../accounts/Typeaheads'
import { GqlError } from '../utils/Alert'
import { deepUpdate, updateCache } from '../../utils/graphql'
import { REPO_Q } from '../repos/queries'
import { Header } from '../profile/Header'
import { BindingInput } from '../account/Typeaheads'
import { sanitize } from '../account/utils'
import { CREATE_PROVIDER, UPDATE_PROVIDER } from '../oidc/queries'
import { AuthMethod } from '../oidc/types'
import RepositoryContext from '../../contexts/RepositoryContext'

function UrlsInput({ uriFormat = '', urls, setUrls }) {
  const [value, setValue] = useState('')
  const [scheme = 'https://', path = '/oauth/callback'] = uriFormat.split('{domain}').filter(v => !!v)

  const addUrl = useCallback(() => {
    const url = uriFormat ? uriFormat.replace('{domain}', value) : value

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
          width="500px"
          borderRadius="0px"
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
  attributes, setAttributes, bindings, setBindings, repository,
}) {
  const settings = repository.oauthSettings || {}

  return (
    <Flex
      direction="column"
      gap="large"
      backgroundColor="fill-one"
      paddingHorizontal={112}
      paddingVertical="xlarge"
      borderRadius="large"
      border="1px solid border"
    >
      <BindingInput
        type="user"
        bindings={bindings.filter(({ user }) => !!user).map(({ user: { email } }) => email)}
        fetcher={fetchUsers}
        add={user => setBindings([...bindings, { user }])}
        remove={email => setBindings(bindings.filter(({ user }) => !user || user.email !== email))}
      />
      <BindingInput
        type="group"
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
      <Flex>
        <Button
          primary
        >Save
        </Button>
      </Flex>
    </Flex>
  )
}

export function CreateProvider({ installation }) {
  const settings = installation.repository.oauthSettings || {}
  const [attributes, setAttributes] = useState({ redirectUris: [], authMethod: settings.authMethod || AuthMethod.POST })
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
    <Box
      fill
      gap="medium"
    >
      <Header
        header="OpenID Connect"
        description="create an openid connect provider for this repository"
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
      />
      <Div>
        <Button
          loading={loading}
          onClick={mutation}
        >
          Create
        </Button>
      </Div>
    </Box>
  )
}

export function UpdateProvider({ installation }) {
  const provider = installation.oidcProvider
  const [attributes, setAttributes] = useState({
    redirectUris: provider.redirectUris,
    authMethod: provider.authMethod,
  })
  const [bindings, setBindings] = useState(provider.bindings)
  const [mutation, { loading, error }] = useMutation(UPDATE_PROVIDER, {
    variables: {
      id: installation.id,
      attributes: { ...attributes, bindings: bindings.map(sanitize) },
    },
  })

  return (
    <Box
      fill
      gap="medium"
    >
      <Header
        header="OpenID Connect"
      >
        {/* <Button */}
        {/*  loading={loading} */}
        {/*  onClick={mutation} */}
        {/* > */}
        {/*  Update */}
        {/* </Button> */}
      </Header>
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
