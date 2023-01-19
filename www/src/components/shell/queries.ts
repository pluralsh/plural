import { gql } from '@apollo/client'

import { CloudShellFragment, DemoProjectFragment } from '../../models/shell'
import { RepoFragment, StackFragment } from '../../models/repo'
import { PageInfo } from '../../models/misc'

export const AUTHENTICATION_URLS_QUERY = gql`
  query {
    scmAuthorization {
      provider
      url
    }
  }
`

export const SCM_TOKEN_QUERY = gql`
  query Token($provider: ScmProvider!, $code: String!) {
    scmToken(provider: $provider, code: $code)
  }
`

export const CLOUD_SHELL_QUERY = gql`
  query {
    shell {
      ...CloudShellFragment
    }
  }
  ${CloudShellFragment}
`

export const SETUP_SHELL = gql`
  mutation {
    setupShell { id }
  }
`

export const CREATE_SHELL_MUTATION = gql`
  mutation Create($attributes: CloudShellAttributes!) {
    createShell(attributes: $attributes) {
      ...CloudShellFragment
    }
  }
  ${CloudShellFragment}
`

export const DELETE_SHELL_MUTATION = gql`
  mutation {
    deleteShell { ...CloudShellFragment }
  }
  ${CloudShellFragment}
`

export const REBOOT_SHELL_MUTATION = gql`
  mutation {
    rebootShell {
      ...CloudShellFragment
    }
  }
  ${CloudShellFragment}
`

export const CREATE_DEMO_PROJECT_MUTATION = gql`
  mutation {
    createDemoProject {
      ...DemoProjectFragment
    }
  }
  ${DemoProjectFragment}
`

export const POLL_DEMO_PROJECT_QUERY = gql`
  query Demo($id: ID) {
    demoProject(id: $id) {
      ...DemoProjectFragment
    }
  }
  ${DemoProjectFragment}
`

export const DELETE_DEMO_PROJECT_QUERY = gql`
  mutation {
    deleteDemoProject {
      ...DemoProjectFragment
    }
  }
  ${DemoProjectFragment}
`

export const APPLICATIONS_QUERY = gql`
  query ApplicationsQuery($cursor: String) {
    repositories(after: $cursor, first: 200) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...RepoFragment
          recipes {
            id
            name
            provider
          }
        }
      }
    }
  }
  ${RepoFragment}
  ${PageInfo}
`

export const STACKS_QUERY = gql`
  query Stacks($featured: Boolean) {
    stacks(featured: $featured, first: 10) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...StackFragment
        }
      }
    }
  }
  ${PageInfo}
  ${StackFragment}
`

export const STACK_QUERY = gql`
  query StackQuery($name: String!, $provider: Provider!) {
    stack(name: $name, provider: $provider) {
      ...StackFragment
    }
  }
  ${StackFragment}
`

export const CREATE_QUICK_STACK_MUTATION = gql`
    mutation QuickStacks($applicationIds: [ID], $provider: Provider!) {
        quickStack(repositoryIds: $applicationIds, provider: $provider) {
            id
            name
        }
    }
`

export const INSTALL_STACK_SHELL_MUTATION = gql`
    mutation InstallStackShell($name: String!, $context: ContextAttributes!, $oidc: Boolean!) {
        installStackShell(name: $name, context: $context, oidc: $oidc) {
            id
            name
        }
    }
`
