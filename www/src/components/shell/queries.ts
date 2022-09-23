import { gql } from '@apollo/client'

import { CloudShellFragment, DemoProjectFragment } from '../../models/shell'
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

export const CREATE_SHELL_MUTATION = gql`
  mutation Create($attributes: CloudShellAttributes!) {
    createShell(attributes: $attributes) {
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
  query Demo($id: ID!) {
    demoProject(id: $id) {
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
          id
          name
          icon
          darkIcon
          private
        }
      }
    }
  }
  ${PageInfo}
`

export const STACK_QUERY = gql`
  query StackQuery($name: String!, $provider: Provider!) {
    stack(name: $name, provider: $provider) {
      id
      name
      description
      # featured
      # creator {
        # id
        # name
      # }
      collections {
        provider
        bundles {
          recipe {
            repository {
              id
              name
              icon
              darkIcon
            }
          }
        }
      }
    }
  }
`

export const CREATE_QUICK_STACK_MUTATION = gql`
 mutation QuickStacks($applicationIds: [ID], $provider: Provider!) {
  quickStack(repositoryIds: $applicationIds, provider: $provider) {
    name
  }
}
`
