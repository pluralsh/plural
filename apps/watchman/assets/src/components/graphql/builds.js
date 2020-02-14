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

export const CREATE_BUILD = gql`
  mutation CreateBuild($attributes: BuildAttributes!) {
    createBuild(attributes: $attributes) {
      ...BuildFragment
    }
  }
  ${BuildFragment}
`;

export const BUILD_SUB = gql`
  subscription {
    buildDelta {
      delta
      payload {
        ...BuildFragment
      }
    }
  }
  ${BuildFragment}
`;