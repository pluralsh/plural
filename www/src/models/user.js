import gql from 'graphql-tag'

export const UserFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
    avatar
    backgroundColor
  }
`;

export const TokenFragment = gql`
  fragment TokenFragment on PersistedToken {
    id
    token
    insertedAt
  }
`;

export const PublisherFragment = gql`
  fragment PublisherFragment on Publisher {
    id
    name
    description
    owner {
      ...UserFragment
    }
  }
  ${UserFragment}
`;

export const WebhookFragment = gql`
  fragment WebhookFragment on Webhook {
    id
    url
    secret
    insertedAt
  }
`;