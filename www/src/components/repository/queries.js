import { gql } from '@apollo/client'

// TODO remove unsued imports once feature is complete
import { ArtifactFragment, CategoryFragment, InstallationFragment, IntegrationFragment, RepoFragment, StepFragment, TestFragment } from '../../models/repo'
import { ChartFragment, ChartInstallationFragment, PackageScan, VersionFragment, VersionTagFragment } from '../../models/chart'
import { TerraformFragment, TerraformInstallationFragment } from '../../models/terraform'
import { DockerImageFragment, DockerRepoFragment, DockerRepository, VulnerabilityFragment } from '../../models/docker'
import { RecipeFragment, RecipeSectionFragment } from '../../models/recipe'
import { PlanFragment, SubscriptionFragment } from '../../models/payments'
import { PageInfo } from '../../models/misc'
import { MetricFragment } from '../../models/metrics'
import { DeferredUpdateFragment } from '../../models/upgrades'
import { OIDCProvider } from '../../models/oauth'

// export const REPO_Q = gql`
//   query Repo($repositoryId: ID!, $chartCursor: String, $tfCursor: String, $dkrCursor: String, $recipeCursor: String, $intCursor: String) {
//     repository(id: $repositoryId) {
//       ...RepoFragment
//       editable
//       publicKey
//       secrets
//       installation {
//         ...InstallationFragment
//         subscription { ...SubscriptionFragment }
//         oidcProvider { ...OIDCProvider }
//       }
//       plans { ...PlanFragment }
//       tags { tag }
//       artifacts { ...ArtifactFragment }
//     }
//     charts(repositoryId: $repositoryId, first: 15, after: $chartCursor) {
//       pageInfo { ...PageInfo }
//       edges { node { ...ChartFragment } }
//     }
//     terraform(repositoryId: $repositoryId, first: 15, after: $tfCursor) {
//       pageInfo { ...PageInfo }
//       edges { node { ...TerraformFragment } }
//     }
//     dockerRepositories(repositoryId: $repositoryId, first: 15, after: $dkrCursor) {
//       pageInfo { ...PageInfo }
//       edges { node { ...DockerRepoFragment } }
//     }
//     recipes(repositoryId: $repositoryId, first: 5, after: $recipeCursor) {
//       pageInfo { ...PageInfo }
//       edges { node { ...RecipeFragment } }
//     }
//     integrations(repositoryId: $repositoryId, first: 5, after: $intCursor) {
//       pageInfo { ...PageInfo }
//       edges { node { ...IntegrationFragment } }
//     }
//   }
//   ${PageInfo}
//   ${PlanFragment}
//   ${SubscriptionFragment}
//   ${RepoFragment}
//   ${ChartFragment}
//   ${InstallationFragment}
//   ${TerraformFragment}
//   ${DockerRepoFragment}
//   ${RecipeFragment}
//   ${IntegrationFragment}
//   ${ArtifactFragment}
//   ${OIDCProvider}
// `

export const REPOSITORY_QUERY = gql`
  query Repo($repositoryId: ID!) {
    repository(id: $repositoryId) {
      ...RepoFragment
      editable
      publicKey
      secrets
      installation {
        ...InstallationFragment
      }
      tags {
        tag
      }
    }
  }
  ${RepoFragment}
  ${InstallationFragment}
`

export const CHARTS_QUERY = gql`
  query Repo($repositoryId: ID!, $cursor: String) {
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
  query Repo($repositoryId: ID! $cursor: String) {
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
  query Repo($repositoryId: ID!, $cursor: String) {
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
  query RepoTests($repositoryId: ID, $cursor: String) {
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
  subscription Logs($testId: ID!) {
    testLogs(testId: $testId) {
      step {
        ...StepFragment
      }
      logs
    }
  }
  ${StepFragment}
`
