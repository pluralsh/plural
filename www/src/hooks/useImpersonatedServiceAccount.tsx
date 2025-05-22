import { useEffect, useMemo, useState } from 'react'
import { ApolloClient } from '@apollo/client'
import memoize from 'lodash/memoize'

import { buildClient, client as defaultClient } from '../helpers/client'
import { fetchToken } from '../helpers/authentication'
import { useImpersonateServiceAccountMutation } from '../generated/graphql'

// Cache clients with impersonated service account tokens as keys.
const getClient = memoize((token: string) => buildClient(() => token).client)

export default function useImpersonatedServiceAccount(
  id: string | null | undefined,
  skip = false
) {
  const [client, setClient] = useState<ApolloClient<unknown> | undefined>()
  const [token, setToken] = useState<any | undefined>()

  const [mutation, { error }] = useImpersonateServiceAccountMutation()

  useEffect(() => {
    if (skip) {
      setClient(defaultClient)
      setToken(fetchToken())
      return
    }

    // Reset client until matching client will be retrieved.
    setClient(undefined)
    setToken(undefined)

    mutation({
      variables: { id },
      onCompleted: ({ impersonateServiceAccount }) => {
        if (impersonateServiceAccount?.jwt) {
          setClient(getClient(impersonateServiceAccount.jwt))
          setToken(impersonateServiceAccount?.jwt)
        }
      },
      onError: () => {}, // silences the console warning, error will still show up in "error" object
    })
  }, [id])

  return useMemo(() => ({ client, token, error }), [client, token, error])
}
