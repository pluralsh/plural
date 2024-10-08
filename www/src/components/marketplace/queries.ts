import { gql } from '@apollo/client'

import { CategoryFragment } from '../../models/repo'
import { PageInfo } from '../../models/misc'

export const CATEGORIES_QUERY = gql`
  query {
    categories {
      ...CategoryFragment
    }
  }
  ${CategoryFragment}
`

export const TAGS_QUERY = gql`
  query Tags($cursor: String) {
    tags(type: REPOSITORIES, first: 200, after: $cursor) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          tag
          count
        }
      }
    }
  }
  ${PageInfo}
`
