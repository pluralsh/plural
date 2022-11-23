import { gql } from '@apollo/client'

import { OIDCProvider } from '../../models/oauth'
import { RepoFragment } from '../../models/repo'

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

export const OAUTH_LOGIN = gql`
  query Login($challenge: String!) {
    oauthLogin(challenge: $challenge) {
      ...RepoFragment
    }
  }
  ${RepoFragment}
`

export const GET_OIDC_CONSENT = gql`
  query OIDCConsent($challenge: String!) {
    oidcConsent(challenge: $challenge) {
      repository {
        ...RepoFragment
      }
      consent {
        requestedScope
        skip
      }
    }
  }
  ${RepoFragment}
`

export const ACCEPT_LOGIN = gql`
  mutation AcceptLogin($challenge: String!) {
    acceptLogin(challenge: $challenge) { redirectTo }
  }
`

export const OAUTH_CONSENT = gql`
  mutation Consent($challenge: String!, $scopes: [String]) {
    oauthConsent(challenge: $challenge, scopes: $scopes) { redirectTo }
  }
`
