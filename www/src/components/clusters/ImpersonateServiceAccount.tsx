import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { ApolloProvider, useMutation } from '@apollo/client'

import { buildClient } from '../../helpers/client'
import { IMPERSONATE_SERVICE_ACCOUNT } from '../account/queries'

export const PluralApiContext = createContext({})
const SA_CLIENT_CACHE = {} // TODO: Change it.

export function ImpersonateServiceAccount({ id, children }) { // TODO: Loading, errors etc.
  const [token, setToken] = useState('')
  const [mutation, { error }] = useMutation(IMPERSONATE_SERVICE_ACCOUNT, {
    variables: { id },
    update: (_cache, { data: { impersonateServiceAccount: { jwt } } }) => {
      console.log(jwt)
      setToken(jwt) // TODO: Save it in cache, not just current value.
    },
  })

  useEffect(() => {
    mutation()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { client } = useMemo(() => {
    if (SA_CLIENT_CACHE[token]) return SA_CLIENT_CACHE[token]

    const c = buildClient(() => token)

    SA_CLIENT_CACHE[token] = c

    return c
  }, [token])

  if (error) return <>Error: {error.message}</>

  return (
    <ApolloProvider client={client}>
      {children}
    </ApolloProvider>
  )
}
