import { gql } from '@apollo/client'

import { ArtifactFragment, InstallationFragment, RepoFragment, StepFragment, TestFragment } from '../../models/repo'
import { ChartFragment } from '../../models/chart'
import { TerraformFragment } from '../../models/terraform'
import { DockerRepoFragment } from '../../models/docker'
import { RecipeFragment } from '../../models/recipe'
import { PageInfo } from '../../models/misc'
import { RolloutFragment } from '../../models/upgrades'

export const CREATE_REPOSITORY_MUTATION = gql`
  mutation CreateRepository($repositoryId: ID!, $attributes: RepositoryAttributes!) {
    createRepository(id: $repositoryId, attributes: $attributes) {
      ...RepoFragment
    }
  }
  ${RepoFragment}
`

export const REPOSITORY_QUERY = gql`
  query Repository($repositoryId: ID!) {
    repository(id: $repositoryId) {
      ...RepoFragment
      editable
      publicKey
      secrets
      artifacts {
        ...ArtifactFragment
      }
      installation {
        ...InstallationFragment
      }
      tags {
        name: tag
      }
      readme
      git_url
      homepage
    }
  }
  ${RepoFragment}
  ${ArtifactFragment}
  ${InstallationFragment}
`

export const RECIPES_QUERY = gql`
  query RepositoryRecipes($repositoryId: ID!, $cursor: String) {
    recipes(repositoryId: $repositoryId, first: 100, after: $cursor) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...RecipeFragment
        }
      }
    }
  }
  ${PageInfo}
  ${RecipeFragment}
`

export const CHARTS_QUERY = gql`
  query RepositoryCharts($repositoryId: ID!, $cursor: String) {
    charts(repositoryId: $repositoryId, first: 12, after: $cursor) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...ChartFragment
        }
      }
    }
  }
  ${PageInfo}
  ${ChartFragment}
`

export const TERRAFORM_QUERY = gql`
  query RepositoryTerraform($repositoryId: ID! $cursor: String) {
    terraform(repositoryId: $repositoryId, first: 12, after: $cursor) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...TerraformFragment
        }
      }
    }
  }
  ${PageInfo}
  ${TerraformFragment}
`
export const DOCKER_QUERY = gql`
  query RepositoryDocker($repositoryId: ID!, $cursor: String) {
    dockerRepositories(repositoryId: $repositoryId, first: 12, after: $cursor) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...DockerRepoFragment
        }
      }
    }
  }
  ${PageInfo}
  ${DockerRepoFragment}
`
export const TESTS_QUERY = gql`
  query RespositoryTests($repositoryId: ID, $cursor: String) {
    tests(after: $cursor, first: 12, repositoryId: $repositoryId) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...TestFragment
        }
      }
    }
  }
  ${PageInfo}
  ${TestFragment}
`

export const TEST_LOGS_SUBSCRIPTION = gql`
  subscription RepositoryTestLogs($testId: ID!) {
    testLogs(testId: $testId) {
      step {
        ...StepFragment
      }
      logs
    }
  }
  ${StepFragment}
`

export const DEPLOYMENTS_QUERY = gql`
  query RepositoryRollouts($repositoryId: ID!, $cursor: String) {
    rollouts(repositoryId: $repositoryId, after: $cursor, first: 12) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...RolloutFragment
        }
      }
    }
  }
  ${PageInfo}
  ${RolloutFragment}
`

export const DELETE_INSTALLATION_MUTATION = gql`
  mutation DeleteInstallation($id: ID!) {
    deleteInstallation(id: $id) { ...InstallationFragment }
  }
  ${InstallationFragment}
`
