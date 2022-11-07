import { ApolloClient, InMemoryCache, split } from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { createLink } from 'apollo-absinthe-upload-link'
import { Socket as PhoenixSocket } from 'phoenix'
import * as AbsintheSocket from '@absinthe/socket'
import { createAbsintheSocketLink } from 'pluralsh-absinthe-socket-apollo-link'

import { apiHost } from './hostname'
import customFetch from './uploadLink'
import { fetchToken } from './authentication'
import { clearLocalStorage } from './localStorage'

const API_HOST = apiHost()
const GQL_URL = `https://${API_HOST}/gql`
const WS_URI = `wss://${API_HOST}/socket`

const httpLink = createLink({
  uri: GQL_URL,
  fetch: customFetch,
})

const retryLink = new RetryLink({
  delay: { initial: 200 },
  attempts: {
    max: Infinity,
    retryIf: error => !!error && !!fetchToken(),
  },
})

const authLink = setContext(({ headers }: any) => {
  const token = fetchToken()

  return {
    headers: token ? { ...headers, authorization: `Bearer ${token}` } : headers,
  }
})

const resetToken = onError(({ networkError }: any) => {
  if (networkError && networkError.statusCode === 401) {
    // remove cached token on 401 from the server
    clearLocalStorage()
    window.location = '/login' as any as Location
  }
})

export const socket = new PhoenixSocket(WS_URI, {
  params: () => {
    const token = fetchToken()

    return token ? { Authorization: `Bearer ${token}` } : {}
  },
})

const absintheSocket = AbsintheSocket.create(socket)

const socketLink = createAbsintheSocketLink(absintheSocket)

const splitLink = split(({ query }) => {
  const definition = getMainDefinition(query)

  return (
    definition.kind === 'OperationDefinition'
      && definition.operation === 'subscription'
  )
},
socketLink,
retryLink.concat(resetToken).concat(httpLink),)

export const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache: new InMemoryCache({
    typePolicies: {
      Repository: {
        fields: {
          tags: {
            merge(_existing, incoming) {
              return incoming
            },
          },
        },
      },
    },
  }),
})
