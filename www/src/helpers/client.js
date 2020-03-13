import { ApolloClient } from 'apollo-client'
import { createLink } from "apollo-absinthe-upload-link"
import { createPersistedQueryLink } from "apollo-link-persisted-queries"
import { setContext } from 'apollo-link-context'
import { onError } from 'apollo-link-error'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { AUTH_TOKEN } from '../constants'
import {apiHost} from './hostname'
import customFetch from './uploadLink'
import {wipeToken} from './authentication'

const API_HOST = apiHost()
const GQL_URL=`https://${API_HOST}/gql`

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

const resetToken = onError(({ response, networkError }) => {
  if (networkError && networkError.statusCode === 401) {
    // remove cached token on 401 from the server
    wipeToken()
    window.location = '/login'
  }
});

const apqLink = createPersistedQueryLink().concat(httpLink)

export const client = new ApolloClient({
  link: authLink.concat(resetToken).concat(apqLink),
  cache: new InMemoryCache()
})