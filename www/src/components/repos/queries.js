import gql from 'graphql-tag'
import {RepoFragment, InstallationFragment} from '../../models/repo'
import {ChartFragment, VersionFragment} from '../../models/chart'

export const CREATE_REPO = gql`
  mutation CreateRepository($attributes: RepositoryAttributes!) {
    createRepository(attributes: $attributes) {
      ...RepoFragment
    }
  }
  ${RepoFragment}
`;

export const UPDATE_INSTALLATION = gql`
  mutation UpdateInstallation($id: ID!, $attributes: InstallationAttributes!) {
    updateInstallation(id: $id, attributes: $attributes) {
      ...InstallationFragment
    }
  }
  ${InstallationFragment}
`;

export const REPOS_Q = gql`
  query Repos($publisherId: String, $cursor: String) {
    repositories(publisherId: $publisherId, first: 15, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...RepoFragment
        }
      }
    }
  }
  ${RepoFragment}
`;

export const INSTALL_REPO = gql`
  mutation CreateInstallation($repositoryId: ID!) {
    createInstallation(repositoryId: $repositoryId) {
      user {
        id
      }
    }
  }
`;

export const REPO_Q = gql`
  query Repo($repositoryId: String!, $chartCursor: String) {
    repository(id: $repositoryId) {
      ...RepoFragment
      installation {
        user {
          id
        }
      }
    }
    charts(repositoryId: $repositoryId, first: 15, after: $chartCursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...ChartFragment
        }
      }
    }
  }
  ${RepoFragment}
  ${ChartFragment}
`;

export const CHART_Q = gql`
  query Charts($chartId: String!, $cursor: String) {
    versions(chartId: $chartId, first: 10, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...VersionFragment
        }
      }
    }
  }
  ${VersionFragment}
`;