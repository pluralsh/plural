import { gql } from '@apollo/client'

import { CloudShellFragment, DemoProjectFragment } from '../../models/shell'

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

export const SETUP_SHELL_MUTATION = gql`
  mutation {
    setupShell {
      id
      missing
    }
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
    deleteShell {
      ...CloudShellFragment
    }
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

export const DELETE_DEMO_PROJECT_MUTATION = gql`
  mutation {
    deleteDemoProject {
      ...DemoProjectFragment
    }
  }
  ${DemoProjectFragment}
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
  mutation InstallStackShell(
    $name: String!
    $context: ContextAttributes!
    $oidc: Boolean!
  ) {
    installStackShell(name: $name, context: $context, oidc: $oidc) {
      id
      name
    }
  }
`
