import { gql } from '@apollo/client'

import { CategoryFragment, InstallationFragment, RepoFragment } from '../../models/repo'
import { PageInfo } from '../../models/misc'

export const MARKETPLACE_QUERY = gql`
  query Repos($publisherId: ID, $tag: String, $cursor: String) {
    repositories(publisherId: $publisherId, tag: $tag, after: $cursor, first: 200) {
      pageInfo {
        ...PageInfo
      }
      edges {
        node {
          ...RepoFragment
          installation {
            ...InstallationFragment
          }
          tags {
            name: tag
          }
        }
      }
    }
  }
  ${PageInfo}
  ${RepoFragment}
  ${InstallationFragment}
`

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
          name: tag
          count
        }
      }
    }
  }
  ${PageInfo}
`
