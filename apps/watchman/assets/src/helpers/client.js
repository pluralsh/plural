import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import * as AbsintheSocket from "@absinthe/socket"
import { Socket as PhoenixSocket } from "phoenix"
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link"
import { hasSubscription } from "@jumpn/utils-graphql"
import { split } from 'apollo-link'
import {apiHost, secure} from './hostname'
import { HttpLink } from 'apollo-boost'
import { fetchToken, wipeToken } from './auth'

const API_HOST = apiHost()
const GQL_URL = `${secure() ? 'https' : 'http'}://${API_HOST}/gql`
const WS_URI  = `${secure() ? 'wss' : 'ws'}://${API_HOST}/socket`

const httpLink = new HttpLink({uri: GQL_URL})

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
    return token ? { Authorization: `Bearer ${token}`} : {}
  }
})

const absintheSocket = AbsintheSocket.create(socket)

const socketLink = createAbsintheSocketLink(absintheSocket)

const splitLink = split(
  (operation) => hasSubscription(operation.query),
  socketLink,
  authLink.concat(resetToken).concat(httpLink)
)

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})