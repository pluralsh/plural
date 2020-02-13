import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import {apiHost, secure} from './hostname'
import { HttpLink } from 'apollo-boost'

const API_HOST = apiHost()
const GQL_URL=`${secure() ? 'https' : 'http'}://${API_HOST}/gql`

const httpLink = new HttpLink({uri: GQL_URL})

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})