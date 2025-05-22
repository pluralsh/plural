import { ApolloProvider } from '@apollo/client'
import { ReactElement, ReactNode, useMemo } from 'react'

import { AuthTokenContext } from '../../contexts/AuthTokenContext'
import useImpersonatedServiceAccount from '../../hooks/useImpersonatedServiceAccount'
import { EmptyListMessage } from '../overview/clusters/misc'

import LoadingIndicator from './LoadingIndicator'

type ImpersonateServiceAccountProps = {
  id?: string | null
  skip?: boolean
  renderIndicators?: boolean
  children?: ReactNode
}

export default function ImpersonateServiceAccount({
  id,
  skip = false,
  renderIndicators = true,
  children,
}: ImpersonateServiceAccountProps): ReactElement | null {
  const { token, client, error } = useImpersonatedServiceAccount(id, skip)
  const tokenCtxVal = useMemo(() => ({ token }), [token])

  if (error)
    return renderIndicators ? (
      <EmptyListMessage>
        Error while impersonating service account: {error.message}
      </EmptyListMessage>
    ) : null

  if (!client) return renderIndicators ? <LoadingIndicator /> : null

  return (
    <ApolloProvider client={client}>
      <AuthTokenContext.Provider value={tokenCtxVal}>
        {children}
      </AuthTokenContext.Provider>
    </ApolloProvider>
  )
}
