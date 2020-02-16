import { gql } from 'apollo-boost'

export const RepositoryFragment = gql`
  fragment RepositoryFragment on Repository {
    id
    name
    description
  }
`;

export const InstallationFragment = gql`
  fragment InstallationFragment on Installation {
    id
    repository {
      ...RepositoryFragment
    }
  }
  ${RepositoryFragment}
`;

export const INSTALLATION_Q = gql`
  query Installations($cursor: String) {
    installations(first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...InstallationFragment
        }
      }
    }
  }
  ${InstallationFragment}
`;