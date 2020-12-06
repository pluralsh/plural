import gql from 'graphql-tag'

export const AccountFragment = gql`
  fragment AccountFragment on Account {
    id
    name
    billingCustomerId
  }
`;

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

export const AddressFragment = gql`
  fragment AddressFragment on Address {
    line1
    line2
    city
    country
    state
    zip
  }
`;

export const PublisherFragment = gql`
  fragment PublisherFragment on Publisher {
    id
    name
    phone
    description
    owner { ...UserFragment }
    address { ...AddressFragment }
  }
  ${UserFragment}
  ${AddressFragment}
`;

export const WebhookFragment = gql`
  fragment WebhookFragment on Webhook {
    id
    url
    secret
    insertedAt
  }
`;