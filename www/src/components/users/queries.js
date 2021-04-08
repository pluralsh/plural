import gql from 'graphql-tag'
import { UserFragment, TokenFragment, WebhookFragment, AddressFragment, AccountFragment } from '../../models/user'
import { CardFragment } from '../../models/payments';

export const ME_Q = gql`
  query {
    me {
      ...UserFragment
      account { ...AccountFragment }
      publisher {
        id
        name
        phone
        description
        billingAccountId
        address { ...AddressFragment }
      }
    }
  }
  ${UserFragment}
  ${AddressFragment}
  ${AccountFragment}
`;

export const CARDS = gql`
  query {
    me {
      ...UserFragment
      account { ...AccountFragment }
      cards(first: 5) {
        edges {
          node {
            ...CardFragment
          }
        }
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
    }
  }
  ${UserFragment}
`;

export const TOKENS_Q = gql`
  query Tokens($cursor: String) {
    tokens(after: $cursor, first: 10) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...TokenFragment
        }
      }
    }
  }
  ${TokenFragment}
`;

export const CREATE_TOKEN = gql`
  mutation {
    createToken {
      ...TokenFragment
    }
  }
  ${TokenFragment}
`;

export const DELETE_TOKEN = gql`
  mutation DeleteToken($id: ID!) {
    deleteToken(id: $id) {
      ...TokenFragment
    }
  }
  ${TokenFragment}
`;

export const WEBHOOKS_Q = gql`
  query Webhooks($cursor: String) {
    webhooks(first: 10, after: $cursor) {
      edges {
        node {
          ...WebhookFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${WebhookFragment}
`;

export const PING_WEBHOOK = gql`
  mutation PingWebhook($repo: String!, $id: ID!) {
    pingWebhook(repo: $repo, id: $id) {
      statusCode
      body
      headers
    }
  }
`;

export const REGISTER_CARD = gql`
  mutation RegisterCard($source: String!) {
    createCard(source: $source) {
      ...AccountFragment
    }
  }
  ${AccountFragment}
`;

export const DELETE_CARD = gql`
  mutation DeleteCard($id: ID!) {
    deleteCard(id: $id) {
      ...AccountFragment
    }
  }
  ${AccountFragment}
`;

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