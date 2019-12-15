import gql from 'graphql-tag'
import {UserFragment, TokenFragment, WebhookFragment} from '../../models/user'

export const ME_Q = gql`
  query {
    me {
      ...UserFragment
      publisher {
        id
        name
        description
      }
    }
  }
  ${UserFragment}
`;

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
    }
  }
`;