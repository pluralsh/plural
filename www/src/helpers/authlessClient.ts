import { ApolloClient, InMemoryCache } from '@apollo/client'
import { createLink } from 'apollo-absinthe-upload-link'

import { apiHost } from './hostname'

const GQL_URL = `https://${apiHost()}/gql`

export const authlessClient = new ApolloClient({
  link: createLink({ uri: GQL_URL }),
  cache: new InMemoryCache(),
})
