import gql from 'graphql-tag'
import {RepoFragment, InstallationFragment} from '../../models/repo'
import {ChartFragment, VersionFragment, ChartInstallationFragment} from '../../models/chart'
import {TerraformFragment} from '../../models/terraform'
import {DockerRepoFragment, DockerImageFragment} from '../../models/docker'

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

export const DELETE_INSTALLATION = gql`
  mutation DeleteInstallation($id: ID!) {
    deleteInstallation(id: $id) {
      ...InstallationFragment
    }
  }
  ${InstallationFragment}
`;

export const INSTALLATIONS_Q = gql`
  query Installations($cursor: String) {
    installations(after: $cursor, first: 15) {
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
      ...InstallationFragment
    }
  }
  ${InstallationFragment}
`;

export const REPO_Q = gql`
  query Repo($repositoryId: String!, $chartCursor: String, $tfCursor: String, $dkrCursor: String) {
    repository(id: $repositoryId) {
      ...RepoFragment
      editable
      publicKey
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
    dockerRepositories(repositoryId: $repositoryId, first: 15, after: $dkrCursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...DockerRepoFragment
        }
      }
    }
  }
  ${RepoFragment}
  ${ChartFragment}
  ${InstallationFragment}
  ${TerraformFragment}
  ${DockerRepoFragment}
`;

export const DOCKER_IMG_Q = gql`
  query DockerImages($dockerRepositoryId: ID!, $cursor: String) {
    dockerImages(dockerRepositoryId: $dockerRepositoryId, after: $cursor, first: 15) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          ...DockerImageFragment
        }
      }
    }
  }
  ${DockerImageFragment}
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
      installation {
        ...ChartInstallationFragment
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
  ${ChartInstallationFragment}
`;

export const TF_Q = gql`
  query Charts($tfId: ID!) {
    terraformModule(id: $tfId) {
      ...TerraformFragment
      editable
      installation {
        id
      }
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

export const INSTALL_CHART = gql`
  mutation InstallChart($id: ID!, $attributes: ChartInstallationAttributes!) {
    installChart(installationId: $id, attributes: $attributes) {
      ...ChartInstallationFragment
    }
  }
  ${ChartInstallationFragment}
`

export const INSTALL_TF = gql`
  mutation InstallTf($id: ID!, $attributes: TerraformInstallationAttributes!) {
    installTerraform(installationId: $id, attributes: $attributes) {
      id
    }
  }
`;

export const UNINSTALL_TF = gql`
  mutation UninstallTf($id: ID!) {
    uninstallTerraform(id: $id) {
      id
    }
  }
`;

export const UPDATE_CHART_INST = gql`
  mutation UpdateChartInst($id: ID!, $attributes: ChartInstallationAttributes!) {
    updateChartInstallation(chartInstallationId: $id, attributes: $attributes) {
      ...ChartInstallationFragment
    }
  }
  ${ChartInstallationFragment}
`;

export const CLOSURE_Q = gql`
  query Closure($type: DependencyType!, $id: ID!) {
    closure(type: $type, id: $id) {
      terraform {
        ...TerraformFragment
        repository {
          id
          name
        }
      }
      helm {
        ...ChartFragment
        repository {
          id
          name
        }
      }
    }
  }
  ${TerraformFragment}
  ${ChartFragment}
`;