import { ApolloClient } from 'apollo-client'
import { createLink } from "apollo-absinthe-upload-link"
import { createPersistedQueryLink } from "apollo-link-persisted-queries"
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { RetryLink } from "apollo-link-retry"
import { split } from 'apollo-link'
import { hasSubscription } from "@jumpn/utils-graphql"
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link"
import * as AbsintheSocket from "@absinthe/socket"
import { Socket as PhoenixSocket } from "phoenix"
import { InMemoryCache } from 'apollo-cache-inmemory'
import { apiHost } from './hostname'
import customFetch from './uploadLink'
import { wipeToken, fetchToken } from './authentication'

const API_HOST = apiHost()
const GQL_URL=`https://${API_HOST}/gql`
const WS_URI=`wss://${API_HOST}/socket`

const httpLink = createLink({
  uri: GQL_URL,
  fetch: customFetch
})

const retryLink = new RetryLink({
  delay: {initial: 200},
  attempts: {
    max: Infinity,
    retryIf: (error) => !!error && !!fetchToken()
  }
})

const authLink = setContext((_, { headers }) => {
  const token = fetchToken()
  let authHeaders = token ? {authorization: `Bearer ${token}`} : {}
  return {
    headers: Object.assign(headers || {}, authHeaders)
  }
})

const resetToken = onError(({ response, networkError }) => {
  if (networkError && networkError.statusCode === 401) {
    // remove cached token on 401 from the server
    wipeToken()
    window.location = '/login'
  }
});

const socket = new PhoenixSocket(WS_URI, {
  params: () => {
    const token = fetchToken()
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

const absintheSocket = AbsintheSocket.create(socket);

const socketLink = createAbsintheSocketLink(absintheSocket);

const splitLink = split(
  (operation) => hasSubscription(operation.query),
  socketLink,
  createPersistedQueryLink().concat(retryLink).concat(resetToken).concat(httpLink),
);

export const client = new ApolloClient({
  link: authLink.concat(splitLink),
  cache: new InMemoryCache()
})