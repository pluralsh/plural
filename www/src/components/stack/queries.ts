import { gql } from '@apollo/client'
import { StackFragment } from 'models/repo'

export const STACK_QUERY = gql`
  query Stack($name: String!, $provider: Provider!) {
    stack(name: $name, provider: $provider) {
      ...StackFragment
      bundles {
        id
        repository {
          ...RepoFragment
          tags {
            tag
          }
        }
      }
    }
  }
  ${StackFragment}
`
