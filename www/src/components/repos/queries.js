import gql from 'graphql-tag'
import {RepoFragment, InstallationFragment, IntegrationFragment, ArtifactFragment, DashboardFragment} from '../../models/repo'
import {ChartFragment, VersionFragment, ChartInstallationFragment, VersionTagFragment} from '../../models/chart'
import {TerraformFragment} from '../../models/terraform'
import {DockerRepoFragment, DockerImageFragment} from '../../models/docker'
import { RecipeFragment, RecipeSectionFragment } from '../../models/recipe'
import { PlanFragment, SubscriptionFragment } from '../../models/payments'
import { PageInfo } from '../../models/misc'

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
      dashboards {
        ...DashboardFragment
      }
    }
  }
  ${RepoFragment}
  ${DashboardFragment}
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
      pageInfo { ...PageInfo }
      edges {
        node { ...InstallationFragment }
      }
    }
  }
  ${PageInfo}
  ${InstallationFragment}
`;

export const REPOS_Q = gql`
  query Repos($publisherId: String, $cursor: String) {
    repositories(publisherId: $publisherId, first: 15, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...RepoFragment }
      }
    }
  }
  ${PageInfo}
  ${RepoFragment}
`;

export const SEARCH_REPOS = gql`
  query SearchRepos($query: String!) {
    searchRepositories(query: $query, first: 10) {
      edges {
        node { ...RepoFragment }
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
  query Repo($repositoryId: String!, $chartCursor: String, $tfCursor: String, $dkrCursor: String, $recipeCursor: String, $intCursor: String) {
    repository(id: $repositoryId) {
      ...RepoFragment
      editable
      publicKey
      secrets
      installation {
        ...InstallationFragment
        subscription { ...SubscriptionFragment }
      }
      dashboards { ...DashboardFragment }
      plans { ...PlanFragment }
      tags { tag }
      artifacts { ...ArtifactFragment }
    }
    charts(repositoryId: $repositoryId, first: 15, after: $chartCursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...ChartFragment }
      }
    }
    terraform(repositoryId: $repositoryId, first: 15, after: $tfCursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...TerraformFragment }
      }
    }
    dockerRepositories(repositoryId: $repositoryId, first: 15, after: $dkrCursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...DockerRepoFragment }
      }
    }
    recipes(repositoryId: $repositoryId, first: 5, after: $recipeCursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...RecipeFragment }
      }
    }
    integrations(repositoryId: $repositoryId, first: 5, after: $intCursor) {
      pageInfo { ...PageInfo }
      edges {
        node { ...IntegrationFragment }
      }
    }
  }
  ${PageInfo}
  ${PlanFragment}
  ${SubscriptionFragment}
  ${RepoFragment}
  ${ChartFragment}
  ${InstallationFragment}
  ${TerraformFragment}
  ${DockerRepoFragment}
  ${RecipeFragment}
  ${IntegrationFragment}
  ${ArtifactFragment}
  ${DashboardFragment}
`;

export const DOCKER_IMG_Q = gql`
  query DockerImages($dockerRepositoryId: ID!, $cursor: String) {
    dockerImages(dockerRepositoryId: $dockerRepositoryId, after: $cursor, first: 15) {
      pageInfo { ...PageInfo }
      edges {
        node { ...DockerImageFragment }
      }
    }
  }
  ${PageInfo}
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

export const DELETE_TF = gql`
  mutation DeleteTerraform($id: ID!) {
    deleteTerraform(id: $id) {
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
        installation { ...InstallationFragment }
      }
      installation { ...ChartInstallationFragment }
    }
    versions(chartId: $chartId, first: 10, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node {
          ...VersionFragment
          tags { ...VersionTagFragment }
        }
      }
    }
  }
  ${PageInfo}
  ${InstallationFragment}
  ${RepoFragment}
  ${ChartFragment}
  ${VersionFragment}
  ${ChartInstallationFragment}
  ${VersionTagFragment}
`;

export const UPDATE_CHART = gql`
  mutation UpdateChart($id: ID!, $attributes: ChartAttributes!) {
    updateChart(id: $id, attributes: $attributes) {
      ...ChartFragment
      tags {
        ...VersionTagFragment
      }
    }
  }
  ${ChartFragment}
  ${VersionTagFragment}
`;


export const UPDATE_VERSION = gql`
  mutation UpdateVersion($id: ID!, $attributes: VersionAttributes!) {
    updateVersion(id: $id, attributes: $attributes) {
      ...VersionFragment
      tags { ...VersionTagFragment }
    }
  }
  ${VersionFragment}
  ${VersionTagFragment}
`

export const TF_Q = gql`
  query Terraform($tfId: ID!, $cursor: String) {
    terraformModule(id: $tfId) {
      ...TerraformFragment
      editable
      installation { id }
      repository {
        ...RepoFragment
        installation { ...InstallationFragment }
      }
    }
    versions(terraformId: $tfId, first: 10, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node {
          ...VersionFragment
          tags { ...VersionTagFragment }
        }
      }
    }
  }
  ${PageInfo}
  ${VersionFragment}
  ${VersionTagFragment}
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

export const RECIPE_Q = gql`
  query Recipe($id: ID!) {
    recipe(id: $id) {
      ...RecipeFragment
      recipeSections {
        ...RecipeSectionFragment
      }
      repository { id }
    }
  }
  ${RecipeFragment}
  ${RecipeSectionFragment}
`;

export const INSTALL_RECIPE = gql`
  mutation InstallRecipe($id: ID!, $ctx: Map!) {
    installRecipe(recipeId: $id, context: $ctx) {
      ...InstallationFragment
    }
  }
  ${InstallationFragment}
`;

export const DELETE_RECIPE = gql`
  mutation DeleteRecipe($id: ID!) {
    deleteRecipe(id: $id) {
      ...RecipeFragment
    }
  }
  ${RecipeFragment}
`;

export const INTEGRATIONS_Q = gql`
  query Integrations($id: ID!, $tag: String, $cursor: String, $intCursor: String) {
    repository(id: $id) {
      ...RepoFragment
    }
    integrations(tag: $tag, repositoryId: $id, after: $intCursor, first: 10) {
      pageInfo { ...PageInfo }
      edges {
        node { ...IntegrationFragment }
      }
    }
    tags(id: $id, type: INTEGRATIONS, first: 20, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node { tag count }
      }
    }
  }
  ${PageInfo}
  ${RepoFragment}
  ${IntegrationFragment}
`;

export const EXPLORE_REPOS = gql`
  query Repos($tag: String, $repoCursor: String, $cursor: String) {
    repositories(tag: $tag, after: $repoCursor, first: 15) {
      pageInfo { ...PageInfo }
      edges {
        node { ...RepoFragment }
      }
    }
    tags(type: REPOSITORIES, first: 20, after: $cursor) {
      pageInfo { ...PageInfo }
      edges {
        node { tag count }
      }
    }
  }
  ${PageInfo}
  ${RepoFragment}
`;