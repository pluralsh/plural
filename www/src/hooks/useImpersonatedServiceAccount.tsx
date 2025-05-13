import { useEffect, useMemo, useState } from 'react'
import { ApolloClient } from '@apollo/client'
import memoize from 'lodash/memoize'

import { buildClient, client as defaultClient } from '../helpers/client'
import { fetchToken } from '../helpers/authentication'
import { useImpersonateServiceAccountMutation } from '../generated/graphql'

// Cache tokens with service account ID as keys.
const getImpersonatedToken = memoize((_, mutation) =>
  mutation().then(({ data }) => data?.impersonateServiceAccount?.jwt)
)

// Cache clients with impersonated service account tokens as keys.
const getClient = memoize((token) => buildClient(() => token).client)

export default function useImpersonatedServiceAccount(
  id: string | null | undefined,
  skip = false
) {
  const [client, setClient] = useState<ApolloClient<unknown> | undefined>()
  const [token, setToken] = useState<any | undefined>()
  const [impersonationError, setImpersonationError] = useState<
    any | undefined
  >()
  const [mutation, { error }] = useImpersonateServiceAccountMutation({
    variables: { id },
  })

  useEffect(() => {
    if (error) {
      setImpersonationError(error)
    }
  }, [error])

  useEffect(() => {
    if (skip) {
      setClient(defaultClient)
      setToken(fetchToken())

      return
    }

    // Reset client until matching client will be retrieved.
    setClient(undefined)
    setToken(undefined)

    // Retrieve client matching given service account.
    getImpersonatedToken(id, mutation)
      .then((jwt) => {
        setClient(getClient(jwt))
        setToken(jwt)
      })
      .catch((err) => setImpersonationError(err))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(
    () => ({ client, token, error: impersonationError }),
    [client, token, impersonationError]
  )
}
