import { gql } from '@apollo/client'

import { PageInfo } from '../../models/misc'

export const REPOSITORIES_Q = gql`
  query Repositories($cursor: String, $installed: Boolean) {
    repositories(after: $cursor, first: 200, installed: $installed) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          id
          name
          icon
          darkIcon
          installation {
            pingedAt
          }
        }
      }
    }
  }
  ${PageInfo}
`
