import { useEffect, useState } from 'react'
import { ApolloClient, ApolloProvider, useMutation } from '@apollo/client'
import memoize from 'lodash/memoize'

import { buildClient } from '../../../helpers/client'
import { IMPERSONATE_SERVICE_ACCOUNT } from '../../account/queries'
import LoadingIndicator from '../../utils/LoadingIndicator'

import { EmptyListMessage } from './misc'

// TODO: Make sure that below caches are properly destroyed on logout/impersonation
// and invalidated after some time.

// Cache tokens with service account ID as keys.
const getImpersonatedToken = memoize((id, mutation) => mutation()
  .then(({ data: { impersonateServiceAccount: { jwt } } }) => jwt))

// Cache clients with impersonated service account tokens as keys.
const getClient = memoize(token => buildClient(() => token).client)

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

  if (error) return <EmptyListMessage>Error while impersonating service account: {error.message}</EmptyListMessage>
  if (!client) return <LoadingIndicator />

  return (
    <ApolloProvider client={client}>
      { children }
    </ApolloProvider>
  )
}
