import { gql } from '@apollo/client'

import { GroupFragment, UserFragment } from './user'

export const OIDCProvider = gql`
  fragment OIDCProvider on OidcProvider {
    id
    clientId
    authMethod
    clientSecret
    redirectUris
    bindings {
      id
      user { ...UserFragment }
      group { ...GroupFragment }
    }
  }
  ${UserFragment}
  ${GroupFragment}
`

export const OAuthInfo = gql`
  fragment OAuthInfo on OauthInfo {
    provider
    authorizeUrl
  }
`
