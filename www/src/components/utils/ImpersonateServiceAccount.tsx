import { ReactElement, useMemo } from 'react'
import { ApolloProvider } from '@apollo/client'

import { EmptyListMessage } from '../overview/clusters/misc'
import { AuthTokenContext } from '../../contexts/AuthTokenContext'
import useImpersonatedServiceAccount from '../../hooks/useImpersonatedServiceAccount'

import LoadingIndicator from './LoadingIndicator'

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
  const { token, client, error } = useImpersonatedServiceAccount(id, skip)
  const tokenCtxVal = useMemo(() => ({ token }), [token])

  if (error)
    return (
      <EmptyListMessage>
        Error while impersonating service account: {error.message}
      </EmptyListMessage>
    )
  if (!client) return <LoadingIndicator />

  return (
    <ApolloProvider client={client}>
      <AuthTokenContext.Provider value={tokenCtxVal}>
        {children}
      </AuthTokenContext.Provider>
    </ApolloProvider>
  )
}
