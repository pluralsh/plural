import {
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ApolloClient, ApolloProvider, useMutation } from '@apollo/client'
import memoize from 'lodash/memoize'

import { buildClient } from '../../helpers/client'
import { IMPERSONATE_SERVICE_ACCOUNT } from '../account/queries'
import { EmptyListMessage } from '../overview/clusters/misc'

import { AuthTokenContext } from '../../contexts/AuthTokenContext'

import LoadingIndicator from './LoadingIndicator'

// Cache tokens with service account ID as keys.
const getImpersonatedToken = memoize((id, mutation) => mutation()
  .then(({ data: { impersonateServiceAccount: { jwt } } }) => jwt))

// Cache clients with impersonated service account tokens as keys.
const getClient = memoize(token => buildClient(() => token).client)

type ImpersonateServiceAccountProps = {
  id?: string | null
  skip?: boolean
  children: ReactElement
}

export default function ImpersonateServiceAccount({
  id,
  skip = false,
  children,
}: ImpersonateServiceAccountProps): ReactElement {
  if (skip) return children

  return <ImpersonateServiceAccountInternal id={id}>{children}</ImpersonateServiceAccountInternal>
}

function ImpersonateServiceAccountInternal({
  id,
  children,
}: Omit<ImpersonateServiceAccountProps, 'skip'>): ReactElement {
  const [client, setClient] = useState<ApolloClient<unknown> | undefined>()
  const [token, setToken] = useState<any | undefined>()
  const [mutation, { error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, { variables: { id } })

  useEffect(() => {
    // Reset client until matching client will be retrieved.
    setClient(undefined)
    setToken(undefined)

    // Retrieve client matching given service account.
    getImpersonatedToken(id, mutation).then(jwt => {
      setClient(getClient(jwt))
      setToken(jwt)
    })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const tokenCtxVal = useMemo(() => ({ token }), [token])

  if (error) return <EmptyListMessage>Error while impersonating service account: {error.message}</EmptyListMessage>
  if (!client) return <LoadingIndicator />

  return (
    <ApolloProvider client={client}>
      <AuthTokenContext.Provider value={tokenCtxVal}>
        {children}
      </AuthTokenContext.Provider>
    </ApolloProvider>
  )
}
