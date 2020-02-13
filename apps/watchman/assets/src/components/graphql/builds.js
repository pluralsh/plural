import { gql } from 'apollo-boost'

export const BuildFragment = gql`
  fragment BuildFragment on Build {
    id
    repository
    type
    status
    insertedAt
    completedAt
  }
`;

export const BUILDS_Q = gql`
  query Builds($cursor: String) {
    builds(first: 15, after: $cursor) {
      pageInfo {
        endCursor
        hasNextPage
      }
      edges {
        node {
          ...BuildFragment
        }
      }
    }
  }
  ${BuildFragment}
`;