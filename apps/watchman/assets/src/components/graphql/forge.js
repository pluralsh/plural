import { gql } from 'apollo-boost'

export const DashboardFragment = gql`
  fragment DashboardFragment on Dashboard {
    name
    uid
  }
`;

export const RepositoryFragment = gql`
  fragment RepositoryFragment on Repository {
    id
    name
    description
    dashboards {
      ...DashboardFragment
    }
  }
  ${DashboardFragment}
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

export const CONFIGURATIONS_Q = gql`
  query Installations($cursor: String) {
    installations(first: 20, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          repository {
            ...RepositoryFragment
            configuration
            icon
            description
            grafanaDns
          }
        }
      }
    }
  }
  ${RepositoryFragment}
`;

export const UPDATE_CONFIGURATION = gql`
  mutation UpdateConfiguration($repository: String!, $content: String!) {
    updateConfiguration(repository: $repository, content: $content) {
      configuration
    }
  }
`;