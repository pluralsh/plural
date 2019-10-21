import { ApolloClient } from 'apollo-client'
import { createLink } from "apollo-absinthe-upload-link";
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { AUTH_TOKEN } from '../constants'
import {apiHost, secure} from './hostname'
import customFetch from './uploadLink'


const API_HOST = apiHost()
const GQL_URL=`${secure() ? 'https' : 'http'}://${API_HOST}/gql`

const httpLink = createLink({
  uri: GQL_URL,
  fetch: customFetch
})

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN)
  let authHeaders = token ? {authorization: `Bearer ${token}`} : {}
  return {
    headers: Object.assign(headers || {}, authHeaders)
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})