import gql from 'graphql-tag'

export const AUTH_URLS = gql`
  query {
    scmAuthorization { provider url }
  }
`

export const SCM_TOKEN = gql`
  query Token($provider: ScmProvider!, $code: String!) {
    scmToken(provider: $provider, code: $code)
  }
`