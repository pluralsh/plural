import gql from 'graphql-tag'
import {RepoFragment, InstallationFragment} from '../../models/repo'
import {ChartFragment, VersionFragment} from '../../models/chart'
import {TerraformFragment} from '../../models/terraform'

export const CREATE_REPO = gql`
  mutation CreateRepository($attributes: RepositoryAttributes!) {
    createRepository(attributes: $attributes) {
      ...RepoFragment
    }
  }
  ${RepoFragment}
`;

export const UPDATE_REPO = gql`
  mutation UpdateRepository($id: ID!, $attributes: RepositoryAttributes!) {
    updateRepository(repositoryId: $id, attributes: $attributes) {
      ...RepoFragment
    }
  }
  ${RepoFragment}
`;

export const DELETE_REPO = gql`
  mutation DeleteRepository($id: ID!) {
    deleteRepository(repositoryId: $id) {
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

export const SEARCH_REPOS = gql`
  query SearchRepos($query: String!) {
    searchRepositories(query: $query, first: 10) {
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
  query Repo($repositoryId: String!, $chartCursor: String, $tfCursor: String) {
    repository(id: $repositoryId) {
      ...RepoFragment
      editable
      installation {
        ...InstallationFragment
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
    terraform(repositoryId: $repositoryId, first: 15, after: $tfCursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...TerraformFragment
        }
      }
    }
  }
  ${RepoFragment}
  ${ChartFragment}
  ${InstallationFragment}
  ${TerraformFragment}
`;

export const CREATE_TF = gql`
  mutation CreateTerraform($repositoryId: ID!, $attributes: TerraformAttributes!) {
    createTerraform(repositoryId: $repositoryId, attributes: $attributes) {
      ...TerraformFragment
    }
  }
  ${TerraformFragment}
`;

export const UPDATE_TF = gql`
  mutation UpdateTerraform($id: ID!, $attributes: TerraformAttributes!) {
    updateTerraform(id: $id, attributes: $attributes) {
      ...TerraformFragment
    }
  }
  ${TerraformFragment}
`;

export const CHART_Q = gql`
  query Charts($chartId: ID!, $cursor: String) {
    chart(id: $chartId) {
      ...ChartFragment
      repository {
        ...RepoFragment
        installation {
          ...InstallationFragment
        }
      }
    }
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
  ${InstallationFragment}
  ${RepoFragment}
  ${ChartFragment}
  ${VersionFragment}
`;

export const TF_Q = gql`
  query Charts($tfId: ID!) {
    terraformModule(id: $tfId) {
      ...TerraformFragment
      editable
      repository {
        ...RepoFragment
        installation {
          ...InstallationFragment
        }
      }
    }
  }
  ${InstallationFragment}
  ${RepoFragment}
  ${TerraformFragment}
`;