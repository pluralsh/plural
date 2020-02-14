import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import * as AbsintheSocket from "@absinthe/socket"
import { Socket as PhoenixSocket } from "phoenix"
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link"
import { hasSubscription } from "@jumpn/utils-graphql"
import { split } from 'apollo-link'
import {apiHost, secure} from './hostname'
import { HttpLink } from 'apollo-boost'

const API_HOST = apiHost()
const GQL_URL=`${secure() ? 'https' : 'http'}://${API_HOST}/gql`
const WS_URI=`${secure() ? 'wss' : 'ws'}://${API_HOST}/socket`

const httpLink = new HttpLink({uri: GQL_URL})

const socket = new PhoenixSocket(WS_URI)
const absintheSocket = AbsintheSocket.create(socket)

const socketLink = createAbsintheSocketLink(absintheSocket)

const splitLink = split(
  (operation) => hasSubscription(operation.query),
  socketLink,
  httpLink
)

export const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache()
})