import { useEffect, useMemo, useState } from 'react'
import { ApolloClient, useMutation } from '@apollo/client'
import memoize from 'lodash/memoize'

import { buildClient, client as defaultClient } from '../helpers/client'
import { IMPERSONATE_SERVICE_ACCOUNT } from '../components/account/queries'
import { fetchToken } from '../helpers/authentication'

// Cache tokens with service account ID as keys.
const getImpersonatedToken = memoize((id, mutation) => mutation()
  .then(({ data: { impersonateServiceAccount: { jwt } } }) => jwt))

// Cache clients with impersonated service account tokens as keys.
const getClient = memoize(token => buildClient(() => token).client)

export default function useImpersonatedServiceAccount(id: string | null | undefined, skip = false) {
  const [client, setClient] = useState<ApolloClient<unknown> | undefined>()
  const [token, setToken] = useState<any | undefined>()
  const [mutation, { error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, { variables: { id } })

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
    getImpersonatedToken(id, mutation).then(jwt => {
      setClient(getClient(jwt))
      setToken(jwt)
    })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  return useMemo(() => ({ client, token, error }), [client, token, error])
}
