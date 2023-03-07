import { gql } from '@apollo/client'

// TODO: Use virtual scrolling
export const APPLICATIONS_QUERY = gql`
  query Repositories($provider: Provider!) {
    repositories(first: 1000, installed: false, provider: $provider) {
      edges {
        node {
          id
          name
          private
          icon
          darkIcon
          installation {
            updatedAt
            id
            context
          }
        }
      }
    }
  }
`
