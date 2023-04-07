import { useEffect, useState } from 'react'
import { ApolloClient, ApolloProvider, useMutation } from '@apollo/client'
import memoize from 'lodash/memoize'

import { buildClient } from '../../../helpers/client'
import { IMPERSONATE_SERVICE_ACCOUNT } from '../../account/queries'
import LoadingIndicator from '../../utils/LoadingIndicator'

import { EmptyListMessage } from './misc'

// Cache tokens with service account ID as keys.
const getImpersonatedToken = memoize((id, mutation) => mutation()
  .then(({ data: { impersonateServiceAccount: { jwt } } }) => jwt))

// Cache clients with impersonated service account tokens as keys.
const getClient = memoize(token => buildClient(() => token).client)

export function ImpersonateServiceAccountWithSkip({ id, skip, children }) {
  return skip ? children : <ImpersonateServiceAccount id={id}>{children}</ImpersonateServiceAccount>
}

export function ImpersonateServiceAccount({ id, children }) {
  const [client, setClient] = useState<ApolloClient<unknown> | undefined>()
  const [mutation, { error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, { variables: { id } })

  useEffect(() => {
    // Reset client until matching client will be retrieved.
    setClient(undefined)

    // Retrieve client matching given service account.
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