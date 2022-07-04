import { gql } from '@apollo/client'

import { AccountFragment, AddressFragment, EabCredentialFragment, PublicKeyFragment, PublisherFragment, TokenAuditFragment, TokenFragment, UserFragment, WebhookFragment } from '../../models/user'
import { CardFragment } from '../../models/payments'
import { PageInfo } from '../../models/misc'

export const ME_Q = gql`
  query {
    me {
      ...UserFragment
      loginMethod
      hasInstallations
      account {
        ...AccountFragment
        rootUser { id }
        domainMappings { id domain enableSso }
      }
      publisher {
        ...PublisherFragment
        billingAccountId
      }
    }
    configuration {
      stripeConnectId
      stripePublishableKey
      registry
      gitCommit
    }
  }
  ${UserFragment}
  ${AddressFragment}
  ${AccountFragment}
  ${PublisherFragment}
`

export const CARDS = gql`
  query {
    me {
      ...UserFragment
      account { ...AccountFragment }
      cards(first: 5) {
        edges { node { ...CardFragment } }
      }
    }
  }
  ${UserFragment}
  ${CardFragment}
  ${AccountFragment}
`

export const UPDATE_USER = gql`
  mutation UpdateUser($attributes: UserAttributes!) {
    updateUser(attributes: $attributes) {
      ...UserFragment
      loginMethod
    }
  }
  ${UserFragment}
`

export const TOKENS_Q = gql`
  query Tokens($cursor: String) {
    tokens(after: $cursor, first: 10) {
      pageInfo { ...PageInfo }
      edges {
        node { ...TokenFragment }
      }
    }
  }
  ${PageInfo}
  ${TokenFragment}
`

export const CREATE_TOKEN = gql`
  mutation {
    createToken {
      ...TokenFragment
    }
  }
  ${TokenFragment}
`

export const DELETE_TOKEN = gql`
  mutation DeleteToken($id: ID!) {
    deleteToken(id: $id) {
      ...TokenFragment
    }
  }
  ${TokenFragment}
`

export const TOKEN_AUDITS = gql`
  query Token($id: ID!, $cursor: String) {
    token(id: $id) {
      id
      audits(first: 100, after: $cursor) {
        pageInfo { ...PageInfo }
        edges { node { ...TokenAuditFragment } }
      }
    }
  }
  ${PageInfo}
  ${TokenAuditFragment}
`

export const TOKEN_METRICS = gql`
  query Token($id: ID!) {
    token(id: $id) {
      metrics { country count }
    }
  }
`

export const WEBHOOKS_Q = gql`
  query Webhooks($cursor: String) {
    webhooks(first: 10, after: $cursor) {
      edges {
        node { ...WebhookFragment }
      }
      pageInfo { ...PageInfo }
    }
  }
  ${WebhookFragment}
  ${PageInfo}
`

export const PING_WEBHOOK = gql`
  mutation PingWebhook($repo: String!, $id: ID!) {
    pingWebhook(repo: $repo, id: $id) {
      statusCode
      body
      headers
    }
  }
`

export const REGISTER_CARD = gql`
  mutation RegisterCard($source: String!) {
    createCard(source: $source) {
      ...AccountFragment
    }
  }
  ${AccountFragment}
`

export const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) {
      ...AccountFragment
    }
  }
  ${AccountFragment}
`

export const CREATE_RESET_TOKEN = gql`
  mutation Reset($attributes: ResetTokenAttributes!) {
    createResetToken(attributes: $attributes)
  }
`

export const REALIZE_TOKEN = gql`
  mutation Realize($id: ID!, $attributes: ResetTokenRealization!) {
    realizeResetToken(id: $id, attributes: $attributes)
  }
`

export const RESET_TOKEN = gql`
  query Token($id: ID!) {
    resetToken(id: $id) {
      type
      user { ...UserFragment }
    }
  }
  ${UserFragment}
`

export const LIST_KEYS = gql`
  query Keys($cursor: String) {
    publicKeys(after: $cursor, first: 20) {
      pageInfo { ...PageInfo }
      edges { node { ...PublicKeyFragment } }
    }
  }
  ${PageInfo}
  ${PublicKeyFragment}
`

export const DELETE_KEY = gql`
  mutation Delete($id: ID!) {
    deletePublicKey(id: $id) {
      id
    }
  }
`

export const LOGIN_METHOD = gql`
  query LoginMethod($email: String!, $host: String) {
    loginMethod(email: $email, host: $host) { loginMethod token authorizeUrl }
  }
`

export const SIGNUP_MUTATION = gql`
  mutation Signup($attributes: UserAttributes!, $account: AccountAttributes, $deviceToken: String) {
    signup(attributes: $attributes, account: $account, deviceToken: $deviceToken) { jwt }
  }
`

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!, $deviceToken: String) {
    login(email: $email, password: $password, deviceToken: $deviceToken) { jwt }
  }
`

export const PASSWORDLESS_LOGIN = gql`
  mutation Passwordless($token: String!) {
    passwordlessLogin(token: $token) { jwt }
  }
`

export const POLL_LOGIN_TOKEN = gql`
  mutation Poll($token: String!, $deviceToken: String) {
    loginToken(token: $token, deviceToken: $deviceToken) { jwt }
  }
`
export const EAB_CREDENTIALS = gql`
  query {
    eabCredentials { ...EabCredentialFragment }
  }
  ${EabCredentialFragment}
`

export const DELETE_EAB_CREDENTIALS = gql`
  mutation Delete($id: ID!) {
    deleteEabKey(id: $id) {
      ...EabCredentialFragment
    }
  }
  ${EabCredentialFragment}
`

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) { ...UserFragment }
  }
  ${UserFragment}
`

export const OAUTH_URLS = gql`
  query Urls($host: String) {
    oauthUrls(host: $host) { provider authorizeUrl }
  }
`

export const OAUTH_CALLBACK = gql`
  mutation OAuthCallback($host: String, $code: String!, $provider: OauthProvider!, $deviceToken: String) {
    oauthCallback(code: $code, host: $host, provider: $provider, deviceToken: $deviceToken) { jwt }
  }
`

export const SSO_CALLBACK = gql`
  mutation SSOCallback($code: String!, $deviceToken: String) { 
    ssoCallback(code: $code, deviceToken: $deviceToken) { jwt }
  }
`
