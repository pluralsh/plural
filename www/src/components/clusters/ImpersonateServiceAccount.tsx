import { useEffect, useState } from 'react'
import { ApolloClient, ApolloProvider, useMutation } from '@apollo/client'

import { memoize } from 'lodash'

import styled from 'styled-components'

import { buildClient } from '../../helpers/client'
import { IMPERSONATE_SERVICE_ACCOUNT } from '../account/queries'
import LoadingIndicator from '../utils/LoadingIndicator'

// TODO: Make sure that below caches are properly destroyed on logout and invalidated after some time.

// Cache tokens with service account ID as keys.
const getImpersonatedToken = memoize((id, mutation) => mutation()
  .then(({ data: { impersonateServiceAccount: { jwt } } }) => jwt))

// Cache clients with impersonated service account tokens as keys.
const getClient = memoize(token => buildClient(() => token).client)

const Error = styled.div(({ theme }) => ({
  color: theme.colors['text-xlight'],
  padding: `${theme.spacing.small}px ${theme.spacing.medium}px`,
}))

export function ImpersonateServiceAccount({ id, children }) {
  const [client, setClient] = useState<ApolloClient<unknown> | undefined>()
  const [mutation, { error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, { variables: { id } })

  useEffect(() => {
    // Reset client on each service account ID change.
    // It will be set once matching client will be retrieved.
    setClient(undefined)

    // Retrieve client matching given service account ID.
    getImpersonatedToken(id, mutation).then(jwt => setClient(getClient(jwt)))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <Error>Error while impersonating service account: {error.message}</Error>
  if (!client) return <LoadingIndicator />

  return (
    <ApolloProvider client={client}>
      { children }
    </ApolloProvider>
  )
}
