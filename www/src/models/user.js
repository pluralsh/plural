import gql from 'graphql-tag'

export const UserFragment = gql`
  fragment UserFragment on User {
    id
    name
    email
  }
`;

export const PublisherFragment = gql`
  fragment PublisherFragment on Publisher {
    id
    name
    owner {
      ...UserFragment
    }
  }
  ${UserFragment}
`;