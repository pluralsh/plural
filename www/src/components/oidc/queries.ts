import { gql } from '@apollo/client'

import { OIDCProvider } from '../../models/oauth'

export const CREATE_PROVIDER = gql`
  mutation Provider($id: ID!, $attributes: OidcAttributes!) {
    createOidcProvider(installationId: $id, attributes: $attributes) {
      ...OIDCProvider
    }
  }
  ${OIDCProvider}
`

export const UPDATE_PROVIDER = gql`
  mutation Update($id: ID!, $attributes: OidcAttributes!) {
    updateOidcProvider(installationId: $id, attributes: $attributes) {
      ...OIDCProvider
    }
  }
  ${OIDCProvider}
`

export const OAUTH_CONSENT = gql`
  mutation Consent($challenge: String!, $scopes: [String]) {
    oauthConsent(challenge: $challenge, scopes: $scopes) {
      redirectTo
    }
  }
`
